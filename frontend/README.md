# ESG Platform — Frontend (FastAPI ready)

Next.js UI connected to **Verdustry FastAPI** (`/api/v1`) + PostgreSQL.

## Setup

```powershell
cd frontend
npm install
copy .env.example .env.local
```

```env
AUTH_SECRET=<random-32+-chars>
NEXT_PUBLIC_API_URL=http://localhost:8000
AUTH_URL=http://localhost:3000
```

Start backend first (`verdustry-backend-main`), then:

```powershell
npm run dev
```

## Backend must expose

| Method | Path |
|---|---|
| POST | `/api/v1/auth/login/json` |
| POST | `/api/v1/auth/signup` |
| GET | `/api/v1/auth/me` |
| GET/POST/PUT/DELETE | `/api/v1/users` |

See [`API_CONTRACT.md`](./API_CONTRACT.md).

## Test login (after seed)

`admin@verdustry.com` / `admin123`

## Structure

```
src/lib/api.ts   ← all FastAPI calls (/api/v1)
src/auth.ts      ← NextAuth → login/json
app/login|signup|dashboard|admin/users
```
