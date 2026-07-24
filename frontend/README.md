# ESG Platform — Frontend (FastAPI ready)

Next.js UI for the **platform admin** model: admins create companies and company users.

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
AUTH_GOOGLE_ID=<optional Google OAuth client id>
AUTH_GOOGLE_SECRET=<optional Google OAuth secret>
```

Backend `.env` must set the same client ID as `GOOGLE_CLIENT_ID` for Google login.

```powershell
npm run dev
```

## Admin flow

1. Sign in as platform ADMIN (`admin@verdustry.com` / `admin123` after seed)
2. **Companies** → create companies
3. **Users** → create users for a company and assign role (`ESG_MANAGER`, `EXECUTIVE`, `AUDITOR`)

No public signup. Google login only if the email already exists.

## Backend endpoints used

| Method | Path |
|---|---|
| POST | `/api/v1/auth/login/json` |
| POST | `/api/v1/auth/google` |
| GET/POST/PUT/DELETE | `/api/v1/companies` |
| GET/POST/PUT/DELETE | `/api/v1/users` |

See [`API_CONTRACT.md`](./API_CONTRACT.md).
