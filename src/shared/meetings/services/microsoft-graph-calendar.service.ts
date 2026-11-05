import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GraphCalendarEventCreatePayload,
  GraphCalendarEventResponse,
  GraphCalendarEventUpdatePayload,
} from '../interfaces/graph-calendar-event.interface';
import {
  MicrosoftGraphAuthError,
  MicrosoftGraphAuthService,
} from './microsoft-graph-auth.service';

export class MicrosoftGraphApiException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly graphErrorCode: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'MicrosoftGraphApiException';
  }
}

@Injectable()
export class MicrosoftGraphCalendarService {
  private readonly logger = new Logger(MicrosoftGraphCalendarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: MicrosoftGraphAuthService,
  ) {}

  getOrganizerUserId(overrideOrganizerId?: string | null): string {
    const organizer =
      overrideOrganizerId ||
      this.configService.get<string>('teams.organizerUserId');
    if (!organizer) {
      this.logger.error(
        'TEAMS_ORGANIZER_USER_ID is not configured for Microsoft Graph requests',
      );
      throw new ServiceUnavailableException('errors.TEAMS_NOT_CONFIGURED');
    }
    return organizer;
  }

  async createOnlineMeetingEvent(
    payload: GraphCalendarEventCreatePayload,
    organizerUserId?: string | null,
  ): Promise<GraphCalendarEventResponse> {
    const organizer = this.getOrganizerUserId(organizerUserId);
    const path = `/users/${encodeURIComponent(organizer)}/events`;

    const response = await this.request<GraphCalendarEventResponse>(
      'POST',
      path,
      payload,
    );

    if (!response?.id) {
      throw new MicrosoftGraphApiException(
        'Microsoft Graph event creation succeeded without returning an event ID',
        502,
        'invalid_graph_response',
      );
    }

    return response;
  }

  async updateOnlineMeetingEvent(
    eventId: string,
    payload: GraphCalendarEventUpdatePayload,
    organizerUserId?: string | null,
  ): Promise<GraphCalendarEventResponse> {
    const organizer = this.getOrganizerUserId(organizerUserId);
    const path = `/users/${encodeURIComponent(
      organizer,
    )}/events/${encodeURIComponent(eventId)}`;

    return await this.request<GraphCalendarEventResponse>(
      'PATCH',
      path,
      payload,
    );
  }

  async getOnlineMeetingEvent(
    eventId: string,
    organizerUserId?: string | null,
  ): Promise<GraphCalendarEventResponse> {
    const organizer = this.getOrganizerUserId(organizerUserId);
    const path = `/users/${encodeURIComponent(
      organizer,
    )}/events/${encodeURIComponent(eventId)}`;

    return await this.request<GraphCalendarEventResponse>('GET', path);
  }

  async cancelOnlineMeetingEvent(
    eventId: string,
    comment = 'This session has been cancelled.',
    organizerUserId?: string | null,
  ): Promise<void> {
    const organizer = this.getOrganizerUserId(organizerUserId);
    const cancelPath = `/users/${encodeURIComponent(
      organizer,
    )}/events/${encodeURIComponent(eventId)}/cancel`;

    try {
      await this.request<void>('POST', cancelPath, { Comment: comment });
    } catch (error) {
      if (error instanceof MicrosoftGraphApiException) {
        // 404 means the calendar event was already deleted on Graph -> treat as idempotent success
        if (error.statusCode === 404) {
          this.logger.warn(
            `Microsoft Graph event ${eventId} was already removed (404 on cancel)`,
          );
          return;
        }
      }
      throw error;
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const graphBaseUrl =
      this.configService.get<string>('teams.graphBaseUrl') ||
      'https://graph.microsoft.com/v1.0';
    const timeoutMs =
      this.configService.get<number>('teams.httpTimeoutMs') || 15_000;
    const maxRetries =
      this.configService.get<number>('teams.maxRetries') ?? 2;

    const url = `${graphBaseUrl.replace(/\/$/, '')}${path}`;
    let attempt = 0;
    let refreshedAfter401 = false;

    while (true) {
      let accessToken: string;
      try {
        accessToken = await this.authService.getAccessToken();
      } catch (authErr) {
        if (authErr instanceof MicrosoftGraphAuthError) {
          throw new MicrosoftGraphApiException(
            authErr.message,
            authErr.statusCode,
            authErr.errorCode || 'auth_failed',
            authErr.statusCode >= 500,
          );
        }
        throw authErr;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        };
        if (body !== undefined) {
          headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        // Handle 401 by invalidating cached token and retrying once
        if (response.status === 401 && !refreshedAfter401) {
          refreshedAfter401 = true;
          this.logger.warn(
            `Microsoft Graph returned 401 for ${method} ${path}; invalidating token and retrying once`,
          );
          this.authService.invalidateToken();
          continue;
        }

        // Handle 429 rate limits or transient 502/503/504 errors
        if (
          (response.status === 429 ||
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504) &&
          attempt < maxRetries
        ) {
          attempt++;
          const retryAfterHeader = response.headers?.get?.('Retry-After');
          const retryAfterSec = retryAfterHeader
            ? parseInt(retryAfterHeader, 10)
            : NaN;
          const delayMs = !Number.isNaN(retryAfterSec)
            ? Math.min(retryAfterSec * 1000, 5_000)
            : Math.min(250 * Math.pow(2, attempt - 1), 2_000);

          this.logger.warn(
            `Microsoft Graph returned ${response.status} for ${method} ${path}; retry ${attempt}/${maxRetries} in ${delayMs}ms`,
          );
          await this.sleep(delayMs);
          continue;
        }

        if (!response.ok) {
          let graphCode = `http_${response.status}`;
          let graphMessage = `Microsoft Graph request failed with status ${response.status}`;
          try {
            const errJson = (await response.json()) as Record<string, any>;
            if (errJson?.error) {
              if (typeof errJson.error.code === 'string') {
                graphCode = errJson.error.code;
              }
              if (typeof errJson.error.message === 'string') {
                graphMessage = errJson.error.message;
              }
            }
          } catch {
            // ignore JSON parse failure
          }

          this.logger.error(
            `Microsoft Graph error on ${method} ${path}: status=${response.status} code=${graphCode}`,
          );

          throw new MicrosoftGraphApiException(
            graphMessage,
            response.status,
            graphCode,
            response.status === 429 || response.status >= 500,
          );
        }

        if (response.status === 202 || response.status === 204) {
          return undefined as unknown as T;
        }

        const text = await response.text();
        if (!text) {
          return undefined as unknown as T;
        }
        return JSON.parse(text) as T;
      } catch (error: any) {
        if (error instanceof MicrosoftGraphApiException) {
          throw error;
        }
        if (error instanceof ServiceUnavailableException) {
          throw error;
        }
        if (error?.name === 'AbortError') {
          if (attempt < maxRetries) {
            attempt++;
            this.logger.warn(
              `Microsoft Graph request timed out (${timeoutMs}ms) on ${method} ${path}; retry ${attempt}/${maxRetries}`,
            );
            await this.sleep(250 * attempt);
            continue;
          }
          this.logger.error(
            `Microsoft Graph request timed out after ${timeoutMs}ms on ${method} ${path}`,
          );
          throw new MicrosoftGraphApiException(
            `Microsoft Graph request timed out after ${timeoutMs}ms`,
            504,
            'timeout',
            true,
          );
        }

        if (attempt < maxRetries) {
          attempt++;
          this.logger.warn(
            `Microsoft Graph network error on ${method} ${path}: ${error?.message}; retry ${attempt}/${maxRetries}`,
          );
          await this.sleep(250 * attempt);
          continue;
        }

        this.logger.error(
          `Microsoft Graph network error on ${method} ${path}: ${error?.message ?? 'Unknown error'}`,
        );
        throw new MicrosoftGraphApiException(
          `Microsoft Graph network error: ${error?.message ?? 'Unknown error'}`,
          502,
          'network_error',
          true,
        );
      } finally {
        clearTimeout(timer);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

