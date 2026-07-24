# ESG Platform — API Contract (Frontend ↔ FastAPI)

**Backend base:** `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`)  
**API prefix:** `/api/v1`  
**Auth header:** `Authorization: Bearer <access_token>`

## Product model

- **Platform ADMIN** creates **companies** and **company users**, and assigns roles.
- There is **no public self-signup**. Accounts exist only after an admin creates them.
- Google login only works for **existing** emails.

## Roles (exact strings)

| Role | Who |
|---|---|
| `ADMIN` | Platform administrator |
| `ESG_MANAGER` | Company user |
| `EXECUTIVE` | Company user |
| `AUDITOR` | Company user |

---

## Auth

### `POST /api/v1/auth/login/json`

```json
{ "email": "admin@verdustry.com", "password": "admin123" }
```

**200** — `{ access_token, token_type, user }`

### `POST /api/v1/auth/google`

```json
{ "id_token": "<Google ID token>" }
```

**200** — same as login. **404** if email is not already registered.

### `GET /api/v1/auth/me`

Bearer → current `user`.

---

## Companies (ADMIN only)

### `GET /api/v1/companies`
### `POST /api/v1/companies`
```json
{ "name": "GreenTech", "sector": "Manufacturing", "country": "Tunisia" }
```
### `PUT /api/v1/companies/{id}`
### `DELETE /api/v1/companies/{id}` — **204** (blocked with **409** if company still has users)

---

## Users (ADMIN only)

### `GET /api/v1/users?companyId=`
Optional filter by company.

### `POST /api/v1/users`
```json
{
  "email": "new@company.com",
  "name": "New User",
  "role": "ESG_MANAGER",
  "password": "password123",
  "companyId": "1",
  "isActive": true
}
```
`companyId` is **required**.

### `PUT /api/v1/users/{id}`
Optional: `email`, `name`, `role`, `password`, `isActive`, `companyId`.

### `DELETE /api/v1/users/{id}` — **204**

---

## Frontend env

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

## Seed account

`admin@verdustry.com` / `admin123` (platform ADMIN)
