# AI Knowledge Vault Free Hosting Guide

This guide deploys the MVP so it can be used from anywhere.

Recommended free-friendly setup:

- Database: Neon PostgreSQL
- Backend API: Render Web Service, using the existing .NET Dockerfile
- Frontend UI: Vercel or Cloudflare Pages, using the React/Vite static build

> Security note: this project currently uses a temporary API key gate for hosted demos. It is better than leaving the API public, but it is not a replacement for real Auth0 login because browser environment variables are visible in the built React app. Do not store highly sensitive information until real authentication is added.

## What You Will Need

- A GitHub account
- A Neon account
- A Render account
- A Vercel or Cloudflare account
- This project pushed to a GitHub repository

## Current Project Deployment Files

The repo already contains the required deployment files:

```text
render.yaml
src/AiKnowledgeVault.Api/Dockerfile
frontend/ai-knowledge-vault-ui/Dockerfile
frontend/ai-knowledge-vault-ui/nginx.conf
docker-compose.yml
```

The API auto-applies EF Core migrations on startup, so you do not need to run migrations manually on Neon.

## Step 1: Generate A Temporary Access Key

Generate a long random value and keep it somewhere safe. You will use the same value in Render and in the frontend host.

PowerShell option:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Example placeholder:

```text
MY_LONG_RANDOM_VAULT_KEY
```

Do not use the example value.

## Step 2: Push The Project To GitHub

From the project root:

```powershell
git init
git add .
git commit -m "Prepare AI Knowledge Vault for deployment"
git branch -M main
git remote add origin https://github.com/<your-github-user>/<your-repo-name>.git
git push -u origin main
```

If the project is already connected to GitHub, just run:

```powershell
git add .
git commit -m "Add deployment configuration"
git push
```

## Step 3: Create The Neon PostgreSQL Database

1. Go to Neon and sign in.
2. Create a new project.
3. Choose the free plan.
4. Use a project name like:

```text
ai-knowledge-vault
```

5. Keep the default database or create one named:

```text
ai_knowledge_vault
```

6. Open the Neon connection details.
7. Copy the connection string.

Neon often shows a URI-style connection string like this:

```text
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

For this .NET/Npgsql app, use key/value format:

```text
Host=<host>;Database=<database>;Username=<username>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true
```

If Neon provides a pooled connection string, it usually has `-pooler` in the hostname. Either pooled or direct can work for this MVP. Pooled is a reasonable default for hosted web apps.

Save the final .NET connection string. You will paste it into Render as:

```text
ConnectionStrings__DefaultConnection
```

## Step 4: Deploy The Backend API On Render

You can use either the Blueprint flow or the manual Web Service flow.

### Option A: Render Blueprint

1. Open Render.
2. Choose **New +**.
3. Choose **Blueprint**.
4. Connect your GitHub repository.
5. Render should detect:

```text
render.yaml
```

6. Create/apply the Blueprint.
7. When Render asks for environment variables marked as manual/sync false, add:

```text
ConnectionStrings__DefaultConnection=<your Neon Npgsql connection string>
AllowedCorsOrigins__0=http://localhost:5173
TemporaryAccess__ApiKey=<your long random access key>
```

`AllowedCorsOrigins__0` will be changed later after the frontend has a real public URL.

### Option B: Manual Render Web Service

1. Open Render.
2. Choose **New +**.
3. Choose **Web Service**.
4. Connect your GitHub repository.
5. Select Docker deployment.
6. Use these settings:

```text
Name: ai-knowledge-vault-api
Plan: Free
Dockerfile Path: src/AiKnowledgeVault.Api/Dockerfile
Docker Build Context Directory: .
Health Check Path: /health
```

7. Add these environment variables:

```text
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:8080
ConnectionStrings__DefaultConnection=<your Neon Npgsql connection string>
AllowedCorsOrigins__0=http://localhost:5173
TemporaryAccess__Enabled=true
TemporaryAccess__ApiKey=<your long random access key>
```

8. Create the service and wait for deployment to complete.

## Step 5: Verify The Render API

After Render finishes, your API URL will look like:

```text
https://ai-knowledge-vault-api.onrender.com
```

Open this in the browser:

```text
https://<your-render-api>.onrender.com/health
```

Expected response:

```json
{"status":"healthy"}
```

Test that the API is protected:

```powershell
Invoke-WebRequest https://<your-render-api>.onrender.com/api/categories
```

Expected result: `401 Unauthorized`.

Test with the access key:

```powershell
Invoke-WebRequest `
  -Headers @{ 'X-Vault-Api-Key' = '<your long random access key>' } `
  https://<your-render-api>.onrender.com/api/categories
```

Expected result:

```json
[]
```

If this endpoint works, the API can reach Neon and migrations have been applied.

## Step 6: Deploy The Frontend

Use either Vercel or Cloudflare Pages. Vercel is usually the simplest for a first deployment.

## Option A: Deploy Frontend On Vercel

1. Open Vercel.
2. Choose **Add New Project**.
3. Import the same GitHub repository.
4. Set the project root directory to:

```text
frontend/ai-knowledge-vault-ui
```

5. Confirm or set:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

6. Add environment variables:

```text
VITE_API_BASE_URL=https://<your-render-api>.onrender.com
VITE_API_KEY=<your long random access key>
```

7. Deploy.
8. Copy the generated Vercel URL, for example:

```text
https://ai-knowledge-vault-ui.vercel.app
```

## Option B: Deploy Frontend On Cloudflare Pages

1. Open Cloudflare Dashboard.
2. Go to **Workers & Pages**.
3. Choose **Create application**.
4. Choose **Pages**.
5. Connect your GitHub repository.
6. Use these build settings:

```text
Root directory: frontend/ai-knowledge-vault-ui
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

7. Add environment variables:

```text
VITE_API_BASE_URL=https://<your-render-api>.onrender.com
VITE_API_KEY=<your long random access key>
```

8. Deploy.
9. Copy the generated Cloudflare Pages URL, for example:

```text
https://ai-knowledge-vault-ui.pages.dev
```

## Step 7: Update CORS In Render

After the frontend is deployed, go back to the Render API service.

Update:

```text
AllowedCorsOrigins__0=<your frontend URL>
```

Examples:

```text
AllowedCorsOrigins__0=https://ai-knowledge-vault-ui.vercel.app
```

or:

```text
AllowedCorsOrigins__0=https://ai-knowledge-vault-ui.pages.dev
```

Then redeploy or restart the Render API service.

Without this step, the frontend may load but API calls can fail with CORS errors.

## Step 8: Final Browser Verification

Open the frontend URL:

```text
https://<your-frontend-domain>
```

Verify these flows:

1. Create a category.
2. Create a tag.
3. Create a note.
4. Create a saved link.
5. Mark a note or link as important.
6. Search using a keyword.
7. Filter by category.
8. Filter by tag.
9. Refresh the browser on `/search` and `/notes`; routes should still load.

## Step 9: Useful Production URLs

```text
Frontend:
https://<your-frontend-domain>

API:
https://<your-render-api>.onrender.com

Health:
https://<your-render-api>.onrender.com/health
```

Swagger is currently only enabled in Development mode. For a public hosted API, that is intentional.

## Step 10: Local Docker Verification

To run the same app locally:

```powershell
docker compose up -d --build
```

Local URLs:

```text
UI: http://localhost:5173
API: http://localhost:5000
Health: http://localhost:5000/health
```

The local Docker setup uses:

```text
TemporaryAccess__ApiKey=dev-local-vault-key
```

The local frontend Docker image is built with the same value.

## Troubleshooting

### API health check fails on Render

Check Render logs. Common causes:

- `ConnectionStrings__DefaultConnection` is missing.
- Neon password or host is wrong.
- SSL settings are missing in the Neon connection string.

Use this shape:

```text
Host=<host>;Database=<database>;Username=<username>;Password=<password>;SSL Mode=Require;Trust Server Certificate=true
```

### Frontend shows errors or empty lists

Open browser DevTools and check the Network tab.

Common causes:

- `VITE_API_BASE_URL` is wrong.
- `VITE_API_KEY` does not match `TemporaryAccess__ApiKey`.
- Render `AllowedCorsOrigins__0` does not match the frontend URL exactly.

The origin must include protocol and no trailing slash:

```text
https://your-app.vercel.app
```

not:

```text
https://your-app.vercel.app/
```

### API returns 401

The API key is missing or mismatched.

Check:

```text
Render: TemporaryAccess__ApiKey
Frontend: VITE_API_KEY
```

They must be exactly the same.

### API returns 500

Check Render logs first. Most likely causes:

- Database connection issue.
- EF migration failed.
- Required environment variable missing.

### First request is slow

Render free services can spin down when idle. The first request after idle time can be slow while the service wakes up.

### Data disappeared

Make sure you are using Neon for PostgreSQL. Do not use a temporary or expiring database for personal vault data.

## Future Security Upgrade

Before storing sensitive notes, replace the temporary API key with real Auth0 authentication:

- Enable JWT bearer authentication in the API.
- Validate Auth0 issuer and audience.
- Attach each note/link to the authenticated user.
- Filter every query by user ID.
- Remove `TemporaryAccess__ApiKey` from the frontend.

## References

- Neon connection guide: https://neon.com/docs/get-started-with-neon/connect-neon
- Npgsql connection string parameters: https://www.npgsql.org/doc/connection-string-parameters
- Render Blueprints: https://render.com/docs/infrastructure-as-code
- Render Docker services: https://render.com/docs/docker
- Vercel project import: https://vercel.com/docs/getting-started-with-vercel/import
- Cloudflare Pages build configuration: https://developers.cloudflare.com/pages/configuration/build-configuration/
