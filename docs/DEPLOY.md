# Deployment Guide — Retail Store Management

**Prod URL:** https://retail.cashbackapp.cloud  
**UAT URL:** https://uat-retail.cashbackapp.cloud  
**VPS:** 187.127.106.81 (Hostinger) — shared with QQ Hotpot; Traefik already running  
**GitHub repo:** kaungsettshinnaing/retail-app  

---

## Infrastructure overview

```
Internet → Traefik (shared with QQ Hotpot, already running)
              ├── retail.cashbackapp.cloud     → prod app container
              └── uat-retail.cashbackapp.cloud → UAT app container

VPS directories:
  /opt/retail-app       — production (tracks origin/main)
  /opt/retail-app-uat   — UAT (tracks origin/uat)

Docker projects:
  retail-app            — prod: services app + db
  retail-uat            — UAT: services app + db (--project-name retail-uat)
```

Migrations run automatically on container start via `docker-entrypoint.sh` (`prisma migrate deploy`).  
No manual migration step needed after a deploy.

---

## Git branch → environment

| Branch | Deploys to |
|---|---|
| `main` | Production (`/opt/retail-app`) |
| `uat` | UAT (`/opt/retail-app-uat`) |

Controlled by the `DEPLOY_ENABLED` repo variable — set to `false` to pause auto-deploys.

### Typical workflow

```
develop locally → push to uat → test on UAT → merge uat→main → push main → prod live
```

---

## First-time VPS setup

### 1. Create the GitHub repo and push

On your local machine:
```bash
cd retail-app
git init
git add -A
git commit -m "Initial commit"
git remote add origin https://github.com/kaungsettshinnaing/retail-app.git
git push -u origin main
git checkout -b uat && git push -u origin uat
```

### 2. Add GitHub Secrets & Variables

In the repo → Settings → Secrets and variables → Actions:

**Secrets** (reuse values from qq-hotpot repo):

| Secret | Value |
|---|---|
| `VPS_HOST` | `187.127.106.81` |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Same ed25519 private key as qq-hotpot |
| `GHCR_PAT` | Same GitHub PAT (packages:read scope) |

**Variables:**

| Variable | Value |
|---|---|
| `DEPLOY_ENABLED` | `true` |

### 3. Set up VPS directories

SSH into the VPS:
```bash
ssh root@187.127.106.81
```

**Production:**
```bash
git clone https://github.com/kaungsettshinnaing/retail-app.git /opt/retail-app
cd /opt/retail-app
cp .env.example .env
nano .env   # fill POSTGRES_PASSWORD, AUTH_SECRET, CUSTOMER_AUTH_SECRET
            # APP_IMAGE=ghcr.io/kaungsettshinnaing/retail-app:prod
```

**UAT:**
```bash
git clone https://github.com/kaungsettshinnaing/retail-app.git /opt/retail-app-uat
cd /opt/retail-app-uat
git fetch origin && git checkout -b uat --track origin/uat
cp .env.uat.example .env.uat
nano .env.uat   # fill POSTGRES_PASSWORD (different from prod!), AUTH_SECRET, CUSTOMER_AUTH_SECRET
               # APP_IMAGE=ghcr.io/kaungsettshinnaing/retail-app:uat
```

### 4. First deploy

Let CI do the first build (push to `uat` branch will trigger). Once the `:uat` image is in GHCR:

```bash
# UAT — first start + seed
cd /opt/retail-app-uat
echo "<GHCR_PAT>" | docker login ghcr.io -u kaungsettshinnaing --password-stdin
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat up -d
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat exec app npm run db:seed

# Prod — first start + seed (after merging uat→main and CI builds :prod image)
cd /opt/retail-app
echo "<GHCR_PAT>" | docker login ghcr.io -u kaungsettshinnaing --password-stdin
docker compose up -d
docker compose exec app npm run db:seed
```

---

## Routine operations

### Deploy (automatic)

```bash
# Deploy UAT
git push origin uat

# Deploy production
git checkout main && git merge uat --ff-only && git push origin main
```

CI builds the image and SSH-deploys to the VPS. Migrations run automatically on container start.

### Manual deploy (if CI is paused)

```bash
# On VPS — UAT
cd /opt/retail-app-uat
git pull origin uat
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat pull
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat up -d
```

### Reset UAT database

```bash
cd /opt/retail-app-uat
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat down -v
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat up -d
docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat exec app npm run db:seed
```

---

## Useful VPS commands

```bash
# --- Prod ---
cd /opt/retail-app
docker compose logs -f app
docker compose ps
docker compose restart app
docker compose exec db psql -U retail -d retaildb
docker compose exec app npx prisma studio   # DB GUI (port-forward to use)

# --- UAT ---
cd /opt/retail-app-uat
alias dc-uat="docker compose -f docker-compose.uat.yml --project-name retail-uat --env-file .env.uat"
dc-uat logs -f app
dc-uat ps
dc-uat exec app npm run db:seed

# --- Housekeeping ---
docker image prune -f
docker system df
```

---

## Environment variables

| Variable | Purpose |
|---|---|
| `POSTGRES_USER/PASSWORD/DB` | PostgreSQL credentials |
| `AUTH_SECRET` | Signs staff JWTs — long random string; different per environment |
| `CUSTOMER_AUTH_SECRET` | Signs customer JWTs (online store) — separate from staff |
| `APP_URL` | Used in links/notifications |
| `DOMAIN` | Traefik routing rule hostname |
| `TZ` | `Asia/Yangon` |
| `NODE_OPTIONS` | `--max-old-space-size=512` — prevents OOM on shared VPS |
| `APP_IMAGE` | GHCR image tag pulled by compose (`...retail-app:prod` or `:uat`) |
