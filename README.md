# Manmeet Singh - Portfolio

Next.js 16 (App Router, Cache Components), React 19, Tailwind v4, TypeScript, Prisma 7 + Neon Postgres, Auth.js v5 (GitHub), Cloudinary uploads, Brevo email.

- Public pages (`/` and `/work/[slug]`) are prerendered as static HTML. Data comes from cached getters in `lib/data.ts` (`"use cache"` + `cacheTag` + `cacheLife('max')`). Visitors never hit the database on a normal page view.
- The admin panel at `/admin` writes to the database through Server Actions and calls `updateTag()`, so the public site updates immediately.

All commands below are for Windows PowerShell, one per line.

---

## 1. Local setup

Requirements: Node.js 20.9 or newer (22 LTS recommended) and pnpm.

```powershell
pnpm install
```

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in every value (sections 2 to 6 below explain where each one comes from).

Create the database tables (first time this also creates `prisma/migrations` - commit that folder):

```powershell
pnpm prisma migrate dev --name init
```

```powershell
pnpm prisma generate
```

Load the starter content (safe to run more than once; it never overwrites your edits):

```powershell
pnpm db:seed
```

Start the dev server:

```powershell
pnpm dev
```

Open http://localhost:3000 for the site and http://localhost:3000/admin for the admin panel.

After ANY change to `prisma/schema.prisma`:

```powershell
pnpm prisma migrate dev
```

```powershell
pnpm prisma generate
```

Then stop the dev server (Ctrl+C) and start it again with `pnpm dev`.

---

## 2. Neon setup

1. Create a free project at https://neon.tech (pick the region closest to your Vercel region).
2. In the project dashboard click **Connect**.
3. Turn **Connection pooling OFF** and copy the connection string. It looks like
   `postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/neondb?sslmode=require`
4. Paste it as `DATABASE_URL` in `.env`.

The app talks to Neon through `@prisma/adapter-neon` (see `lib/db.ts`). The Prisma CLI reads the same URL from `prisma.config.ts`.

Tip: create a second Neon branch (for example `dev`) and use its connection string locally, so local experiments never touch production data.

---

## 3. GitHub OAuth app (admin sign-in)

Create one OAuth app for local development and one for production (GitHub allows one callback URL per app).

1. Go to https://github.com/settings/developers > **OAuth Apps** > **New OAuth App**.
2. Local app:
   - Application name: `Portfolio admin (local)`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. Production app:
   - Homepage URL: `https://YOUR-DOMAIN`
   - Authorization callback URL: `https://YOUR-DOMAIN/api/auth/callback/github`
4. After creating each app, copy the **Client ID** into `AUTH_GITHUB_ID` and generate a **Client secret** for `AUTH_GITHUB_SECRET`.

Generate `AUTH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Finding your numeric GitHub id

`ADMIN_GITHUB_ID` is your numeric account id, not your username. Run:

```powershell
(Invoke-RestMethod https://api.github.com/users/CoderManmeet).id
```

(or open https://api.github.com/users/CoderManmeet in a browser and copy the `id` field). Put that number in `ADMIN_GITHUB_ID`. Any other GitHub account is rejected at sign-in, and every admin page, Server Action and upload route re-checks the session on the server.

---

## 4. Cloudinary (images and resume)

1. Create a free account at https://cloudinary.com.
2. Dashboard > **Product environment credentials**: copy Cloud name, API key and API secret into `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
3. Settings > **Security** > enable **Allow delivery of PDF and ZIP files** (otherwise the resume link returns 401).

Uploads go straight from the browser to Cloudinary using a signature from `/api/upload/sign` (admin only), into the `portfolio` folder. Images: JPG, PNG, WebP or AVIF, max 8MB. Resume: PDF only, max 5MB (stored as `raw`). Your portrait stays at `public/me.jpg`.

---

## 5. Brevo (contact form email)

1. Create an account at https://www.brevo.com.
2. **Senders, Domains & Dedicated IPs**: add and verify the address (or domain) you will send from. Put it in `CONTACT_FROM_EMAIL`.
3. **SMTP & API** > **API Keys** > generate a key. Put it in `BREVO_API_KEY`.
4. Put your own inbox in `CONTACT_TO_EMAIL`.

Every submission is validated, rate-limited (3 per IP per 10 minutes), saved to the database (see `/admin/inbox`), then Brevo sends you a notification and the visitor a short auto-reply with your Cal.com link. If email fails, the message is still saved and the visitor still gets a success response; the error is logged.

---

## 6. Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel (framework preset: Next.js). The default build command `pnpm build` already runs `prisma generate && next build`.
2. Project Settings > **Environment Variables**: add every variable from `.env.example` for Production (and Preview if you use it):
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` (from the production OAuth app)
   - `ADMIN_GITHUB_ID`
   - `NEXT_PUBLIC_SITE_URL` (for example `https://manmeetcodes.in`, no trailing slash)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `BREVO_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`
3. Apply migrations to the production database before the first deploy (and after every schema change). Temporarily point `DATABASE_URL` in your local `.env` at the production Neon branch, then run:

```powershell
pnpm db:deploy
```

```powershell
pnpm db:seed
```

4. Deploy. The build reads the database to prerender `/` and every `/work/[slug]` page, so the database must be reachable and migrated at build time.

---

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` | `prisma generate` + production build |
| `pnpm start` | Run the production build |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:deploy` | `prisma migrate deploy` (production) |
| `pnpm db:seed` | Insert starter content (upsert, safe to re-run) |
| `pnpm db:studio` | Prisma Studio |

## Where things live

| Path | Purpose |
| --- | --- |
| `lib/data.ts` | Cached public getters (`use cache`, tags: projects, certs, journey, testimonials, settings, project:slug) |
| `lib/db.ts` | Prisma client singleton with the Neon adapter |
| `lib/validation.ts` | Zod v4 schemas shared by forms, actions and the contact route |
| `lib/markdown.ts` | unified/remark/rehype renderer (sanitized) for case studies and the admin preview |
| `app/admin/actions.ts` | All admin Server Actions (session re-checked in every one) |
| `auth.ts`, `proxy.ts` | Auth.js config (single admin) and `/admin` protection |
| `components/smooth-scroll.tsx` | Lenis + GSAP ticker, anchor focus, route scroll reset |
| `app/enhancements.css` | Small additive styles (journey line, Cal embed, markdown accents) |
