# מתכנן הקיץ המשפחתי 🌞 (Family Summer Planner)

A mobile-first, Hebrew (RTL) web app for managing kids' summer schedules. Parents
(editors) plan recurring chores and activities; kids (viewers) open the app, see today's
schedule, mark tasks complete, and earn points toward rewards.

Built with **Next.js (App Router) + TypeScript**, **Prisma + Postgres**, **Tailwind CSS**,
installable as a **PWA**. Designed for one family — no accounts; editor actions are gated
by a shared PIN.

## Features

- **Today view** – kid-friendly schedule with a big complete toggle, progress ring & points
- **Day / Week / Month** calendar views, color-coded by activity type, with filters
- **Summer Goals** – kids define their own free-text goals (add/edit/delete, no PIN), link
  activities to a goal, and see a completion count as gentle progress
- **Recurring activities** – daily, weekdays (Sun–Thu), weekly, or custom days
- **Dashboard** – today's summary, per-child progress & points, next 7 days, next-up reminder
- **Rewards** – points dashboard + rewards catalog
- **PIN-gated editor** for creating/editing/duplicating activities, members and rewards
- **Calendar export** – single activity or full schedule as `.ics` (with `RRULE`)
- **Share to WhatsApp** – one-tap `wa.me` link with the day's schedule
- **PWA** – installable, offline shell, app icons

## Local development

Requires Node 20+. A Postgres database is needed (Docker is the easiest locally):

```bash
# 1. Start a local Postgres (port 5433)
docker run -d --name summer-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=summer -p 5433:5432 postgres:16-alpine

# 2. Configure env
cp .env.example .env   # defaults already match the Docker DB above

# 3. Install, migrate, seed
npm install
npx prisma migrate dev
npm run db:seed

# 4. Run
npm run dev            # http://localhost:3000
```

Default editor PIN is `1234` (set `FAMILY_EDITOR_PIN` in `.env`).

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `FAMILY_EDITOR_PIN` | Shared PIN that unlocks editor mode |
| `EDITOR_COOKIE_SECRET` | Secret used to sign the editor session cookie |

## Deploy to Vercel + Neon

1. Push the repo to GitHub and import it into **Vercel**.
2. In the Vercel project, create a **Neon** Postgres database (Storage → Create → Neon).
3. Set environment variables (Settings → Environment Variables):
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon **pooled** string (host contains `-pooler`) — used at runtime |
   | `DIRECT_URL` | Neon **direct/unpooled** string — used by migrations |
   | `FAMILY_EDITOR_PIN` | your editor PIN (not the dev default) |
   | `EDITOR_COOKIE_SECRET` | a long random value (`openssl rand -hex 32`) |
4. **Deploy.** The build runs `prisma migrate deploy && prisma generate && next build`, so
   migrations are applied automatically on every deploy — no manual step.
5. (Optional) Load starter data once: `DIRECT_URL="<neon-direct>" npm run db:seed`.

> Why two URLs? Prisma migrations need a direct (non-pooled) connection, while the
> serverless runtime benefits from the pooled one. If you only set `DATABASE_URL`, both
> fall back to it (fine for low traffic).

## Project structure

```
app/            Routes (today, day, week, month, rewards, activities, members, unlock, api/ics)
components/     UI components (ActivityCard, ProgressRing, MemberSwitcher, forms, nav…)
lib/            Core logic: recurrence, occurrences, completions, points, progress, ics, auth, dates
prisma/         schema.prisma + seed.ts
public/         PWA manifest, service worker, icons
```

The heart of the data model: recurring activities are **not** materialized. Each activity
stores its recurrence rule once; `lib/activities.ts → getOccurrencesForRange()` expands
occurrences on demand and joins completions. This one function powers every view.

## Notes & assumptions

- "Weekdays" = **Sunday–Thursday** (Israeli convention); use *custom days* for anything else.
- Avatars are emoji presets (no image uploads).
- One shared editor PIN — no per-user logins (single-family app).
