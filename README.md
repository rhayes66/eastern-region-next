# GERAF — Ghanaian Eastern Region Association, Finland

A membership-management web app for the association: member applications, admin
review, monthly contributions (dues), member benefits, events, and WhatsApp
debt reminders.

Built with **Next.js 16 (App Router) + TypeScript**, **MongoDB + Mongoose**,
**Auth.js v5** (email/password + Google), **Tailwind CSS**, **Twilio WhatsApp**,
and **Nodemailer**.

## Features (requirements map)

| # | Requirement | Where |
|---|---|---|
| 1 | Members join by application | `/apply` → `POST /api/applications` |
| 2 | Admin reviews / accepts / rejects | `/admin/applications` |
| 3 | Monthly dues stored in DB | `/admin/members/[id]`, `Dues` model |
| 4 | Member profile (login, own dues & benefits) | `/profile` |
| 5 | Member benefits received | `Benefit` model, `/profile`, member detail |
| 6 | Events (meetings, team events) | `/events`, `/admin/events` |
| 7 | Public application form | `/apply` |
| 8 | Application content (name, parents, gender, address, spouse, children, Ghana town, Finland contact) | `MemberApplication` model |
| 9 | Social login (Google) | Auth.js Google provider |
| 10 | WhatsApp debt notifications | `/api/admin/dues/[id]/remind`, `/remind-all` |
| 11 | Account reset | `/forgot-password`, `/reset-password`, admin reset |

## Local development

### 1. Prerequisites
- Node.js 20+ (built on Node 24)
- A MongoDB instance. Easiest locally via Docker:
  ```bash
  docker run -d --name geraf-mongo -p 27017:27017 -v geraf-mongo-data:/data/db mongo:7
  ```

### 2. Environment
Copy the template and fill in at least `MONGODB_URI` and `AUTH_SECRET`:
```bash
cp .env.example .env
npx auth secret        # writes/prints an AUTH_SECRET
```
`MONGODB_URI` defaults to `mongodb://localhost:27017/geraf`. Google, Twilio and
SMTP keys may stay blank — those features degrade gracefully until configured.

### 3. Install, seed an admin, run
```bash
npm install
npm run seed:admin     # creates SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env
npm run dev            # http://localhost:3000
```

### Scripts
| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit + model tests |
| `npm run seed:admin` | Bootstrap the first Admin |

## Environment variables

| Var | Required | Notes |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `AUTH_SECRET` | ✅ | `npx auth secret` or `openssl rand -base64 32` |
| `AUTH_URL` | ✅ (prod) | Base URL, e.g. `https://geraf.example.com` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | for Google login | Google Cloud OAuth client |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` | for email | Password reset + application status |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | for WhatsApp | Debt reminders |
| `TWILIO_DEBT_TEMPLATE_SID` | for proactive WhatsApp | Approved template Content SID (`HX…`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | for seeding | Used by `npm run seed:admin` |

## Deployment (Vercel + MongoDB Atlas)

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access (`0.0.0.0/0` for Vercel, or
   Vercel's IP ranges).
3. Copy the `mongodb+srv://…` connection string (append `/geraf`).

### Google OAuth (requirement 9)
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   create an **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URI: `https://YOUR_DOMAIN/api/auth/callback/google`
   (and `http://localhost:3000/api/auth/callback/google` for local).
3. Copy the client ID/secret into `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

### Twilio WhatsApp (requirement 10)
1. In the [Twilio console](https://console.twilio.com) enable the WhatsApp
   sender (sandbox for testing, or a registered number for production).
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
   (`whatsapp:+…`).
3. **Proactive reminders require an approved template** (WhatsApp blocks
   free-form messages outside the 24-hour window). Create a template whose body
   is e.g. `Hello {{1}}, your {{2}} {{3}} GERAF dues of €{{4}} are
   outstanding…`, get it approved, and set `TWILIO_DEBT_TEMPLATE_SID`.

### Vercel
1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Add every environment variable above in **Project → Settings → Environment
   Variables** (set `AUTH_URL` to the production URL).
3. Deploy. Vercel detects Next.js automatically.
4. After the first deploy, seed an admin against the production DB:
   ```bash
   MONGODB_URI="<atlas-uri>" SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npm run seed:admin
   ```

## Architecture notes

- **Auth split config** (`auth.config.ts` + `auth.ts`): the Edge-safe config
  (no DB/bcrypt) powers the middleware; the full config adds the Credentials +
  Google providers. Route gating is in the middleware (anonymous → `/login`,
  non-admin → `/profile`).
- **cacheComponents / PPR**: pages render a static shell and stream dynamic
  data inside `<Suspense>`; request-time reads use `await connection()`.
- **Shared enums** live in `src/lib/constants.ts` so client components don't
  pull Mongoose into the browser bundle.
- **Password security**: bcrypt hashing via the `User` pre-save hook; reset
  tokens are stored hashed, single-use (atomic `findOneAndDelete`), time-limited,
  with a per-account issuance cooldown.
- **Timezone**: events are entered as Finland local time, stored as UTC, and
  displayed in `Europe/Helsinki`.

## Legacy app

The previous Angular 5 + Express app lives in `../eastern-region-app` and is
kept untouched as reference; this app reuses its proven data shapes.
