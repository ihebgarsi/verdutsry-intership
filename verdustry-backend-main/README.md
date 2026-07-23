# Verdustry Backend (FastAPI + PostgreSQL)

## Setup

```powershell
cd verdustry-backend-main
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit DATABASE_URL and SECRET_KEY in .env
```

## Database

```powershell
alembic upgrade head
python -m app.db.seed
```

Seed admin: `admin@verdustry.com` / `admin123`

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

- Health: http://localhost:8000/health  
- Docs: http://localhost:8000/docs  

CORS allows `http://localhost:3000`.

## Main endpoints (for frontend)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/auth/login` | OAuth2 form (`username`=email) |
| POST | `/api/v1/auth/login/json` | JSON `{ email, password }` + `user` in response |
| POST | `/api/v1/auth/signup` | Company + ADMIN user |
| GET | `/api/v1/auth/me` | Current user |
| GET/POST/PUT/DELETE | `/api/v1/users` | Admin user CRUD |
