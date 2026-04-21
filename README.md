# Job Hunt CRM

A Kanban board and AI agent for tracking job applications.

**Live:** https://jobs.anjanamohanraj.com

---

## What it does

- **Kanban board** with 8 stages: Interested, Applied, Recruiter Screen, Tech Screen, Onsite, Offer, Rejected, Withdrawn.
- **AI agent "Igor"** powered by GPT-4o. Can search job boards (LinkedIn, Indeed, Greenhouse, Lever, Workable, Wellfound, Glassdoor), read your applications, and create/update/delete them on your behalf.
- **Notes** on each application, with timestamps.
- **Analytics dashboard** with stage breakdowns and weekly activity.
- **Email/password authentication** with per-user data isolation (you only see your own applications).

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Auth | BetterAuth (email/password) |
| AI | Vercel AI SDK + OpenAI GPT-4o |
| Chat UI | @assistant-ui/react |
| Runtime | Docker + Caddy (HTTPS) |
| Infra | AWS CDK (EC2, Elastic IP, Route 53) |

---

## Getting started locally

```bash
git clone https://github.com/anmohanr/job-hunt-crm.git
cd job-hunt-crm
npm install
```

Create `.env` in the project root:

```
DATABASE_URL="postgresql://user:pass@host:5432/jobhuntcrm"
DIRECT_URL="postgresql://user:pass@host:5432/jobhuntcrm"
BETTER_AUTH_SECRET="<generate with: openssl rand -base64 32>"
BETTER_AUTH_URL="http://localhost:3000"
```

Then:

```bash
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

---

## Project structure

```
src/
├── app/                      Next.js App Router
│   ├── page.tsx              Home (Kanban board)
│   ├── applications/         List, create, edit, view
│   ├── chat/                 Igor chat interface
│   ├── dashboard/            Analytics
│   ├── settings/             OpenAI API key form
│   ├── sign-in / sign-up     Auth pages
│   └── api/
│       ├── auth/[...all]     BetterAuth endpoints
│       ├── chat/route.ts     Streaming chat with tools
│       ├── threads/          Chat thread CRUD
│       └── settings/         API key storage
├── components/               React components (Board, Chat, etc.)
├── lib/
│   ├── auth.ts               BetterAuth server config
│   ├── db.ts                 Prisma client singleton
│   ├── chatAdapter.ts        Thread adapter for AssistantUI
│   └── actions/              Server Actions (CRUD)
└── middleware.ts             Session guard on every request

prisma/schema.prisma          Database schema
infrastructure/               AWS CDK (EC2, Route 53, etc.)
scripts/deploy.sh             One-command manual deploy
.github/workflows/deploy.yml  Auto-deploy on push to main
docker-compose.yml            Runtime orchestration (Caddy, app, Postgres)
Dockerfile                    Multi-stage Next.js build
Caddyfile                     Reverse proxy + HTTPS config
```

---

## Architecture

The app runs as three Docker containers on a single EC2 instance in `us-east-1`:

1. **Caddy** — terminates HTTPS (auto-issues certs from Let's Encrypt), reverse-proxies to the app.
2. **Next.js app** — the actual CRM, built from `Dockerfile` and pulled from Docker Hub as `amohanraj/jobhuntcrm:latest`.
3. **Postgres** — data store, with the volume persisted to the EC2's EBS drive.

DNS (`jobs.anjanamohanraj.com`) is handled by AWS Route 53, pointing at an Elastic IP attached to the EC2.

All AWS resources are defined in `infrastructure/` as AWS CDK code.

---

## Deployment

### Auto-deploy (on push to `main`)

Every push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Builds the Docker image in GitHub Actions.
2. Pushes it to Docker Hub as `amohanraj/jobhuntcrm:latest`.
3. SSHes into the EC2 and runs `scripts/deploy.sh`, which pulls the new image and restarts the app container.

End-to-end time: ~3 minutes. Pushes that only touch `infrastructure/`, `*.md`, or `.github/` are skipped.

### Manual deploy

From your laptop:

```bash
npm run deploy
```

This runs `scripts/deploy.sh`, which SSHes into the EC2, pulls whatever image is currently on Docker Hub, and restarts the app container (~10s).

### Infrastructure changes

Infra changes stay manual — a bad CDK deploy can take down the site or delete data.

```bash
cd infrastructure
npx cdk diff       # preview changes
npx cdk deploy     # apply
```

---

## Required GitHub Secrets

For the auto-deploy workflow to run, these secrets must be set at `Settings → Secrets and variables → Actions`:

| Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Read & Write) |
| `EC2_HOST` | EC2 hostname (e.g. `jobs.anjanamohanraj.com`) |
| `EC2_SSH_KEY` | Contents of the SSH private key (`.pem` file) |
| `EC2_REPO_PATH` | Path to the repo on the EC2 (e.g. `/home/ec2-user/app`) |

---

## Key files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Database schema (User, Application, Note, Thread, Message) |
| `src/app/api/chat/route.ts` | Igor's chat endpoint and tool definitions |
| `src/middleware.ts` | Session enforcement on every request |
| `infrastructure/lib/job-hunt-crm-stack.ts` | AWS CDK stack definition |
| `docker-compose.yml` | Container orchestration on the EC2 |
| `scripts/deploy.sh` | Pull-based deploy script |
| `.github/workflows/deploy.yml` | GitHub Actions auto-deploy pipeline |
