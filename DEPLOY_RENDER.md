# Deploy Full App on Render (Frontend + Backend)

This repo now includes a Render Blueprint file: `render.yaml`.

## 1) Push repo to GitHub

Render deploys from your GitHub repo/branch.

## 2) Create services from Blueprint

In Render:

1. `New` -> `Blueprint`
2. Select this repo
3. Render detects `render.yaml` and creates:
   - `realestate-backend` (Node web service from `server/`)
   - `realestate-frontend` (Static site from `client/`)

## 3) Fill environment variables

### Backend (`realestate-backend`)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLIENT_URLS`

Set `CLIENT_URLS` as comma-separated origins, for example:

`https://realestate-frontend.onrender.com,https://your-custom-frontend-domain.com`

### Frontend (`realestate-frontend`)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SOCKET_URL`
- `VITE_SOCKET_PATH` (already defaults to `/socket.io`)

Set `VITE_SOCKET_URL` to your backend HTTPS URL, for example:

`https://realestate-backend.onrender.com`

## 4) Redeploy after setting real service URLs

If Render assigns different service URLs than expected, update:

- backend `CLIENT_URLS`
- frontend `VITE_SOCKET_URL`

Then trigger `Manual Deploy` for both services.

## 5) Verify

1. Open frontend URL
2. Open browser DevTools -> Network
3. Confirm requests to:
   - `https://<backend>/socket.io/...`
4. Confirm no CORS errors and no `ERR_CONNECTION_REFUSED`

## Notes

- Do not use `localhost` in production env values.
- Do not hardcode port in `VITE_SOCKET_URL` on Render.
- If you scale backend to multiple instances, you will need a Socket.IO adapter (e.g. Redis) for cross-instance events.
