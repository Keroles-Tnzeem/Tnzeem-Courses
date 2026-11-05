import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface MicrosoftGraphTokenResponse {
  token_type: string;
  expires_in: number;
  ext_expires_in?: number;
  access_token: string;
}

export class MicrosoftGraphAuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = 'MicrosoftGraphAuthError';
  }
}

@Injectable()
export class MicrosoftGraphAuthService {
  private readonly logger = new Logger(MicrosoftGraphAuthService.name);

  /** Cached bearer token held strictly in memory (never persisted in plaintext). */
  private cachedAccessToken: string | null = null;
  private tokenExpiresAtMs = 0;
  private inflightPromise: Promise<string> | null = null;

  /** Safety buffer (60s) before token expiry to refresh proactively. */
  private static readonly EXPIRY_BUFFER_MS = 60_000;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    const tenantId = this.configService.get<string>('teams.tenantId');
    const clientId = this.configService.get<string>('teams.clientId');
    const clientSecret = this.configService.get<string>('teams.clientSecret');
    const organizerUserId = this.configService.get<string>(
      'teams.organizerUserId',
    );
    return Boolean(tenantId && clientId && clientSecret && organizerUserId);
  }

  invalidateToken(): void {
    this.cachedAccessToken = null;
    this.tokenExpiresAtMs = 0;
  }

  async getAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.cachedAccessToken && Date.now() < this.tokenExpiresAtMs) {
      return this.cachedAccessToken;
    }

    if (this.inflightPromise) {
      return this.inflightPromise;
    }

    this.inflightPromise = this.acquireNewToken().finally(() => {
      this.inflightPromise = null;
    });

    return this.inflightPromise;
  }

  private async acquireNewToken(): Promise<string> {
    const tenantId = this.configService.get<string>('teams.tenantId');
    const clientId = this.configService.get<string>('teams.clientId');
    const clientSecret = this.configService.get<string>('teams.clientSecret');
    const loginBaseUrl =
      this.configService.get<string>('teams.loginBaseUrl') ||
      'https://login.microsoftonline.com';
    const timeoutMs =
      this.configService.get<number>('teams.httpTimeoutMs') || 15_000;

    if (!tenantId || !clientId || !clientSecret) {
      this.logger.error(
        'Microsoft Entra ID credentials are not configured (TEAMS_TENANT_ID, TEAMS_CLIENT_ID, TEAMS_CLIENT_SECRET)',
      );
      throw new ServiceUnavailableException('errors.TEAMS_NOT_CONFIGURED');
    }

    const tokenUrl = `${loginBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(
      tenantId,
    )}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorCode = 'token_acquisition_failed';
        let errorDescription = `HTTP ${response.status}`;
        try {
          const errJson = (await response.json()) as Record<string, any>;
          if (typeof errJson?.error === 'string') {
            errorCode = errJson.error;
          }
          if (typeof errJson?.error_description === 'string') {
            // Strip any trace/correlation lines if verbose, never log secrets
            errorDescription = errJson.error_description.split('\r\n')[0];
          }
        } catch {
          // ignore JSON parse error on error payload
        }

        this.logger.error(
          `Microsoft Entra ID token acquisition failed: status=${response.status} code=${errorCode}`,
        );

        throw new MicrosoftGraphAuthError(
          `Microsoft Entra ID authentication failed (${errorCode}): ${errorDescription}`,
          response.status,
          errorCode,
        );
      }

      const data = (await response.json()) as MicrosoftGraphTokenResponse;
      if (!data?.access_token) {
        this.logger.error(
          'Microsoft Entra ID token response did not include an access_token',
        );
        throw new MicrosoftGraphAuthError(
          'Microsoft Entra ID token response missing access_token',
          502,
          'missing_access_token',
        );
      }

      const expiresInSec = Number(data.expires_in) || 3600;
      this.cachedAccessToken = data.access_token;
      this.tokenExpiresAtMs =
        Date.now() +
        Math.max(
          expiresInSec * 1000 - MicrosoftGraphAuthService.EXPIRY_BUFFER_MS,
          5_000,
        );

      return this.cachedAccessToken;
    } catch (error: any) {
      if (error instanceof MicrosoftGraphAuthError) {
        throw error;
      }
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      if (error?.name === 'AbortError') {
        this.logger.error(
          `Microsoft Entra ID token request timed out after ${timeoutMs}ms`,
        );
        throw new MicrosoftGraphAuthError(
          'Microsoft Entra ID token request timed out',
          504,
          'timeout',
        );
      }
      this.logger.error(
        `Microsoft Entra ID token request failed: ${error?.message ?? 'Unknown error'}`,
      );
      throw new MicrosoftGraphAuthError(
        `Microsoft Entra ID token request failed: ${error?.message ?? 'Network error'}`,
        502,
        'network_error',
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

