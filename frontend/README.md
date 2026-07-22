# ESG Platform — Frontend (Sprint 1 Part B)

Next.js + **NextAuth** (Auth.js v5) — login, JWT session, role-based routes, admin user CRUD.

## Stack
- Next.js 16 (App Router)
- TypeScript + Tailwind CSS
- NextAuth (Credentials → FastAPI or mock users)

## Setup

```powershell
cd frontend
npm install
copy .env.example .env.local
# Edit AUTH_SECRET in .env.local (random string, 32+ chars)
npm run dev
```

Open http://localhost:3000

## Demo login (mock — works without backend)

| Email | Password | Role |
|---|---|---|
| admin@esg.local | admin123 | Admin |
| esg@esg.local | esg123 | ESG Manager |
| exec@esg.local | exec123 | Executive |
| audit@esg.local | audit123 | Auditor |

## Pages

| Route | Who |
|---|---|
| `/login` | Public |
| `/dashboard` | All authenticated roles |
| `/admin/users` | **Admin only** — CRUD users |

## Connect to FastAPI (Person A)

When backend is ready, set in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Login tries `POST /auth/login` first; falls back to mock users if API is down.

Expected API contract:

```
POST /auth/login  { email, password } → { access_token, user: { id, email, name, role } }
GET  /users       Authorization: Bearer <token>  (Admin)
```

## Project structure

```
src/
  auth.ts                 # NextAuth config
  middleware.ts           # Route + role guards
  app/
    login/
    dashboard/
    admin/users/
    api/auth/[...nextauth]/
    api/users/            # Mock CRUD until FastAPI
  lib/
    roles.ts
    mock-users.ts
    api.ts
  components/
    layout/navbar.tsx
    admin/admin-users-client.tsx
```

## Sprint 1 deliverable (Part B)

- Login page with NextAuth
- JWT session with role in token
- Protected routes + Admin-only `/admin/users`
- Basic admin CRUD UI (mock API, swap to FastAPI later)
