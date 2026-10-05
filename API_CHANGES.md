# API Changes (for Frontend)

Summary of endpoint changes. Responses keep the usual wrapper `{ success, message, data }`
(paginated lists use the existing pagination response). Error messages are translated via the
`x-lang` / `Accept-Language` header.

| # | Endpoint | Type |
|---|----------|------|
| 1 | `PATCH /website/student/profile/phone` | **New** |
| 2 | `GET /website/courses/latest` | **New** |
| 3 | `GET /staff-dashboard/trainer` | New query param `search` |
| 4 | `POST /staff-dashboard/courses` | New body field `status` |
| 5 | `PATCH /staff-dashboard/courses/:id` | `status` (already supported, listed for completeness) |
| 6 | `POST /instructor-dashboard/courses` | New body field `status` |
| 7 | `PATCH /instructor-dashboard/courses/:id` | New body field `status` |

---

## 1. Update student phone number — NEW

`PATCH /website/student/profile/phone`

- **Auth:** Bearer token (student).
- **Content-Type:** `application/json`

**Body**

```json
{ "phone": "512345678" }
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phone` | string | yes | Saudi mobile. `5XXXXXXXX` or `05XXXXXXXX` (both accepted, stored without the leading `0`). No country code (`+966` is rejected). |

**Success `200`** — returns the updated student profile (same shape as `GET /website/student/profile`):

```json
{
  "success": true,
  "message": "...",
  "data": {
    "id": 1,
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "phone": "512345678",
    "phoneVerified": false,
    "gender": "male",
    "img": "..."
  }
}
```

**Errors**

| Status | When |
|--------|------|
| `400` | Invalid phone format, or extra fields in the body |
| `409` | Phone already used by another user (`errors.PHONE_TAKEN`) |

**Behavior notes**
- After a successful change, `phoneVerified` becomes `false` (the new number is unverified).
- Sending the student's current number returns the profile unchanged.

---

## 2. Latest courses — NEW

`GET /website/courses/latest`

- **Auth:** none (public).
- **Query:** `lang` (optional, `ar` / `en`) — same as the other website course endpoints.
- **Returns:** the 6 newest **published** courses, newest first. Same item shape as `GET /website/courses` (`GuestCourseResponse[]`).

```json
{ "success": true, "message": "...", "data": [ /* up to 6 courses */ ] }
```

---

## 3. Trainers list — new `search` param

`GET /staff-dashboard/trainer?page=1&limit=10&search=john`

| Param | Type | Notes |
|-------|------|-------|
| `search` | string, optional | Case-insensitive "contains" match on first name, last name, full name (`john doe`) and email |

- Works together with `page` / `limit`; `total` in the response reflects the filtered count.
- Empty / whitespace-only `search` = no filter.

---

## 4. Create course (staff) — new `status`

`POST /staff-dashboard/courses` (multipart/form-data, unchanged)

New optional field:

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | no | `pending` \| `published` \| `draft` |

Default when omitted: `pending`. Invalid value → `400`.

## 5. Update course (staff) — `status`

`PATCH /staff-dashboard/courses/:id`

`status` (optional, `pending` | `published` | `draft`) was already accepted here; no change.

---

## 6. Create course (instructor) — new `status`

`POST /instructor-dashboard/courses` (multipart/form-data, unchanged)

New optional field:

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `status` | string | no | `pending` \| `draft` |

- Default when omitted: `pending` (awaiting staff approval — same as before).
- `published` is **not allowed** for instructors (only staff can publish) → `400`.

## 7. Update course (instructor) — new `status`

`PATCH /instructor-dashboard/courses/:id`

New optional field `status`: `pending` | `draft` (same rules as above; `published` → `400`).

---

## Course status values

```
pending   - waiting for staff approval
published - visible on the public website
draft     - not visible, work in progress
```

The course response already returns `status` in all course endpoints.
