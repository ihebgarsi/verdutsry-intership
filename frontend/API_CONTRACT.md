# ESG Platform — API Contract (Frontend ↔ FastAPI)

**Backend base:** `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)  
**API prefix:** `/api/v1`  
**Auth header:** `Authorization: Bearer <access_token>`

## Roles (exact strings)

`EXECUTIVE` | `ESG_MANAGER` | `ADMIN` | `AUDITOR`

---

## Auth

### `POST /api/v1/auth/login/json` (used by Next.js)

**Body**
```json
{ "email": "admin@verdustry.com", "password": "admin123" }
```

**200**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "1",
    "email": "admin@verdustry.com",
    "name": "Administrator",
    "role": "ADMIN",
    "isActive": true,
    "companyId": "1"
  }
}
```

Also available: `POST /api/v1/auth/login` (OAuth2 form, `username` + `password`) — same response shape.

### `POST /api/v1/auth/signup`

**Body**
```json
{
  "companyName": "GreenTech Tunisia",
  "sector": "Manufacturing",
  "country": "Tunisia",
  "adminName": "Sara Ben Ali",
  "email": "sara@greentech.tn",
  "password": "secret123"
}
```

**201** — `{ company, user }` (user role is always `ADMIN`)

### `GET /api/v1/auth/me`

Bearer token → same `user` shape as login.

---

## Users (ADMIN; GET also allowed for EXECUTIVE)

### `GET /api/v1/users`
List users (no passwords).

### `POST /api/v1/users`
```json
{
  "email": "new@company.com",
  "name": "New User",
  "role": "ESG_MANAGER",
  "password": "password123",
  "isActive": true
}
```
Also accepts legacy: `full_name`, `role_id`, `is_active`.

### `PUT /api/v1/users/{id}`
Optional fields: `email`, `name`/`full_name`, `role`/`role_id`, `isActive`/`is_active`, `password`.

### `DELETE /api/v1/users/{id}`
**204** No Content

---

## Frontend env

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
```

Client: [`src/lib/api.ts`](./src/lib/api.ts) — all paths under `/api/v1`.

## Seed account

`admin@verdustry.com` / `admin123`
