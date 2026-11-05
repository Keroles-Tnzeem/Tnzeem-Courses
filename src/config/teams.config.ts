import { registerAs } from '@nestjs/config';

export default registerAs('teams', () => ({
  enabled: process.env.TEAMS_ENABLED === 'true',
  tenantId: process.env.TEAMS_TENANT_ID || '',
  clientId: process.env.TEAMS_CLIENT_ID || '',
  clientSecret: process.env.TEAMS_CLIENT_SECRET || '',
  organizerUserId: process.env.TEAMS_ORGANIZER_USER_ID || '',
  defaultTimezone: process.env.TEAMS_DEFAULT_TIMEZONE || 'Asia/Riyadh',
  defaultDurationMinutes: parseInt(
    process.env.TEAMS_DEFAULT_DURATION_MINUTES || '90',
    10,
  ),
  graphBaseUrl:
    process.env.TEAMS_GRAPH_BASE_URL || 'https://graph.microsoft.com/v1.0',
  loginBaseUrl:
    process.env.TEAMS_LOGIN_BASE_URL || 'https://login.microsoftonline.com',
  httpTimeoutMs: parseInt(process.env.TEAMS_HTTP_TIMEOUT_MS || '15000', 10),
  maxRetries: parseInt(process.env.TEAMS_MAX_RETRIES || '2', 10),
  inviteEnrolledStudents:
    process.env.TEAMS_INVITE_ENROLLED_STUDENTS !== 'false',
}));

