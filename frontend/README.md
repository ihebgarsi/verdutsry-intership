# ESG Platform — Frontend

Next.js authentication UI: login, session, role-based routes, admin user management.

## Stack
- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- NextAuth (Credentials → backend API or local demo accounts)

## Setup

```powershell
cd frontend
npm install
copy .env.example .env.local
# Edit AUTH_SECRET in .env.local (random string, 32+ chars)
npm run dev
```

Open http://localhost:3000

## Test accounts

| Email | Password | Role |
|---|---|---|
| admin@esg.local | admin123 | Administrateur |
| esg@esg.local | esg123 | Responsable ESG |
| exec@esg.local | exec123 | Direction |
| audit@esg.local | audit123 | Auditeur |

## Pages

| Route | Who |
|---|---|
| `/login` | Public |
| `/dashboard` | All authenticated roles |
| `/admin/users` | **Admin only** — user CRUD |

## Connect to FastAPI

In `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Login calls `POST /auth/login` first; falls back to local test accounts if the API is unavailable.

Expected API contract:

```
POST /auth/login  { email, password } → { access_token, user: { id, email, name, role } }
GET  /users       Authorization: Bearer <token>  (Admin)
```

## Project structure

```
src/
  auth.ts
  middleware.ts
  app/
    login/
    dashboard/
    admin/users/
    api/auth/[...nextauth]/
    api/users/
  lib/
    roles.ts
    mock-users.ts
    api.ts
  components/
    layout/navbar.tsx
    admin/admin-users-client.tsx
```
