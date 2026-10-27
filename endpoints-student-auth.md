# API Endpoints Documentation: Student Updates & Authentication



## 1. Update Student (General)

Updates general student details, including personal information, assigned staff, source, status, and password.

* **Path:** `/staff-dashboard/student/:id`
* **HTTP Method:** `PATCH`
* **Authentication:** Required (Bearer JWT)


### Request Body Schema
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `password` | `string` | Optional | **New field**: Minimum 6 characters (automatically hashed with bcrypt) |
| `status` | `enum` | Optional | **New field**: `PENDING`, `CONFIRMED`, or `CANCELLED` |
| `isActive` | `boolean` | Optional | Active status (`true`/`false`) |


---



## 3. Login with Password

Authenticates a user via phone number and password, validates active status, and issues access & refresh tokens along with role-based redirect URL.

* **Path:** `/website/student/auth/login`
* **HTTP Method:** `POST`
* **Authentication:** Public (No Bearer token required)


### Request Body Schema
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `phone` | `string` | **Yes** | Valid Saudi mobile number (e.g. `512345678`) |
| `password` | `string` | **Yes** | Plain text password |



### Validation & Error Handling
1. **Invalid Phone or Password (`401 Unauthorized`)**:
   - Throws error if user is not found or password does not match:
   ```json
   {
     "statusCode": 401,
     "message": "Invalid credentials"
   }
   ```
2. **Account Inactive (`403 Forbidden`)**:
   - Throws error if `isActive === false`:
   ```json
   {
     "statusCode": 403,
     "message": "Account is disabled"
   }
   ```



