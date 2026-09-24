# Mahdiyar Studio request backend

This is the single production API and admin panel used by the public website. It stores requests in Supabase and keeps the service role key on the server.

## Deploy

1. Run `schema.sql` on a fresh database, or apply the versioned SQL migrations under `supabase/migrations` to an existing database.
2. Connect this repository to the Vercel project `mahdiyaradmin`.
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_TOKEN`, and `ALLOWED_ORIGINS` in the Vercel project's Production and Preview environments.
4. Keep `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_TOKEN` out of GitHub and browser code.

## Endpoints

- `POST /api/requests` accepts and validates public collaboration requests. A successful insert returns HTTP 201.
- `GET /api/requests` requires `Authorization: Bearer <ADMIN_TOKEN>` and returns stored requests.
- `POST /api/requests` with `action: "update"` requires the same bearer token and validates the status and category before updating.

The admin page sends the token in an Authorization header, never in a URL. The token stays in page memory and is cleared by the logout button.

## Local development

Copy `.env.example` to `.env`, fill in server-side values, then run:

```powershell
npm run dev
```

Open `http://localhost:3001/admin.html`. The backend health check is at `/health`.

