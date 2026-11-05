# NestJS Project Setup

## Requirements

Before running the project, make sure you have the following installed:

- **Node.js:** v24.x (LTS)
- **npm:** v11.x
- **NestJS CLI**

Verify your installation:

```bash
node -v
npm -v
```

Expected output:

```text
Node.js: v24.18.0
npm: 11.16.0
```

Install the NestJS CLI globally:

```bash
npm install -g @nestjs/cli
```

Verify the installation:

```bash
nest --version
```

---

## Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/Keroles-Tnzeem/Tnzeem-Courses.git
```

### 2. Navigate to the project

```bash
cd Tnzeem-Courses
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run start:dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Microsoft Teams Scheduled Meetings Integration

### Required Environment Variables (`.env`)

```env
# Microsoft Teams / Microsoft Graph Integration
TEAMS_ENABLED=true
TEAMS_TENANT_ID=your-microsoft-entra-tenant-id
TEAMS_CLIENT_ID=your-entra-app-client-id
TEAMS_CLIENT_SECRET=your-entra-app-client-secret
TEAMS_ORGANIZER_USER_ID=organizer@yourdomain.com
TEAMS_DEFAULT_TIMEZONE=Asia/Riyadh
TEAMS_DEFAULT_DURATION_MINUTES=90
TEAMS_INVITE_ENROLLED_STUDENTS=true
TEAMS_GRAPH_BASE_URL=https://graph.microsoft.com/v1.0
TEAMS_LOGIN_BASE_URL=https://login.microsoftonline.com
TEAMS_HTTP_TIMEOUT_MS=15000
TEAMS_MAX_RETRIES=2
```

### Microsoft Entra ID Setup Summary

1. **Register an Application** in [Microsoft Entra admin center](https://entra.microsoft.com) (**Applications** → **App registrations** → **New registration**):
   - Supported account types: *Accounts in this organizational directory only (Single tenant)*.
   - Record the **Directory (tenant) ID** (`TEAMS_TENANT_ID`) and **Application (client) ID** (`TEAMS_CLIENT_ID`).
2. **Create a Client Secret** (**Certificates & secrets** → **New client secret**):
   - Copy the secret **Value** into `TEAMS_CLIENT_SECRET` (never the Secret ID).
3. **Configure API Permissions** (**API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**):
   - Add `Calendars.ReadWrite` (least-privilege application permission required for `POST /users/{id}/events` with `isOnlineMeeting: true` and `onlineMeetingProvider: "teamsForBusiness"`).
   - Click **Grant admin consent for <Tenant>**.
4. **Provision the Designated Organizer Account** (`TEAMS_ORGANIZER_USER_ID`):
   - Assign a Microsoft 365 license that includes **Exchange Online (Mailbox)** and **Microsoft Teams** to a dedicated organizational service mailbox (e.g., `meetings@yourdomain.com`), and set its User Principal Name or Object ID GUID as `TEAMS_ORGANIZER_USER_ID`.
   - *(Optional security hardening)* Use an Exchange Online **ApplicationAccessPolicy** (`New-ApplicationAccessPolicy`) to restrict the Entra app's `Calendars.ReadWrite` permission strictly to the designated organizer mailbox.
