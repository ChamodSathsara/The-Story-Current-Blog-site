# The Story Current — Architecture, Database & Deployment Guide

This project contains the complete UI, editorial workflow, validation, SEO and security logic for The Story Current.
In the Magic Patterns preview, the data layer (`contexts/StoreContext.tsx`) persists to the browser so every feature
is fully usable. For production, each store method maps 1:1 to a server action backed by Neon PostgreSQL + Drizzle,
with images in Cloudflare R2, deployed to Cloudflare Workers via the OpenNext Cloudflare adapter.

## 1. Production stack (free-tier first)

| Concern | Service | Cost |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) + `@opennextjs/cloudflare` | Free / OSS |
| Hosting | Cloudflare Workers (Free: 100k requests/day; Paid $5/mo if you outgrow it) | Free to start |
| Database | Neon PostgreSQL (Free plan) via `@neondatabase/serverless` HTTP driver | Free |
| ORM | Drizzle ORM + drizzle-kit migrations | Free / OSS |
| Images | Cloudflare R2 (10 GB storage, zero egress on free allowance) | Free to start |
| DNS / SSL | Cloudflare | Free |
| Domain | Any registrar (Cloudflare Registrar sells at cost) | ~$10/yr |

> Check the current Cloudflare Workers and Neon plan terms before launch. Worker free plan CPU time per request is limited — keep
> heavy work (image compression) on the client and the server to validation + storage only, as this codebase does.

## 2. Suggested production folder structure

```
app/
  (public)/page.tsx, article/[slug]/page.tsx, category/[slug]/page.tsx, tag/[slug]/page.tsx,
  author/[slug]/page.tsx, search/page.tsx, contact/page.tsx, newsletter/page.tsx, [static]/page.tsx
  admin/(auth)/login/page.tsx, admin/(cms)/layout.tsx + one page per admin section
  sitemap.ts, robots.ts, rss.xml/route.ts, api/upload/route.ts, not-found.tsx, error.tsx
db/schema.ts, db/client.ts, drizzle/ (migrations)
lib/auth.ts, lib/validation.ts (reuse utils/validation.ts), lib/seo.ts (reuse utils/seo.ts), lib/r2.ts
components/ (reuse public/ and admin/ components from this project)
```

## 3. Database schema (Drizzle — `db/schema.ts`)

```ts
import { pgTable, uuid, text, varchar, boolean, integer, timestamp, jsonb, pgEnum, primaryKey, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const postStatus = pgEnum('post_status', ['draft', 'published', 'scheduled', 'archived'])
export const sourceType = pgEnum('source_type', ['original', 'official', 'government', 'news', 'research', 'press_release', 'other'])
export const messageStatus = pgEnum('message_status', ['unread', 'read', 'archived'])
export const subscriberStatus = pgEnum('subscriber_status', ['pending', 'active', 'unsubscribed'])

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
})

export const sessions = pgTable('admin_sessions', {
  id: text('id').primaryKey(), // random 32-byte token (hashed)
  userId: uuid('user_id').notNull().references(() => adminUsers.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})

export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 90 }).notNull().unique(),
  avatarUrl: text('avatar_url'),
  bio: text('bio').default('').notNull(),
  role: varchar('role', { length: 100 }),
  email: varchar('email', { length: 200 }),
  showEmail: boolean('show_email').default(false).notNull(),
  website: text('website'),
  socials: jsonb('socials').default({}).notNull(),
  isOrganization: boolean('is_organization').default(false).notNull(),
  active: boolean('active').default(true).notNull(),
})

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 60 }).notNull(),
  slug: varchar('slug', { length: 90 }).notNull().unique(),
  description: text('description').default('').notNull(),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  seoTitle: varchar('seo_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 170 }),
}, (t) => [index('categories_parent_idx').on(t.parentId)])

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 60 }).notNull(),
  slug: varchar('slug', { length: 90 }).notNull().unique(),
})

export const mediaLibrary = pgTable('media_library', {
  id: uuid('id').primaryKey().defaultRandom(),
  r2Key: text('r2_key').notNull().unique(),
  url: text('url').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  alt: varchar('alt', { length: 250 }).default('').notNull(),
  caption: text('caption'),
  credit: varchar('credit', { length: 200 }),
  license: text('license'),
  mimeType: varchar('mime_type', { length: 50 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  width: integer('width'), height: integer('height'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const sources = pgTable('sources', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  url: text('url').notNull().unique(),
  publisher: varchar('publisher', { length: 150 }),
  publishedDate: timestamp('published_date', { mode: 'string' }),
  type: sourceType('type').default('news').notNull(),
  note: text('note'),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 90 }).notNull(),
  subtitle: text('subtitle'),
  excerpt: varchar('excerpt', { length: 320 }).default('').notNull(),
  content: jsonb('content').notNull(),        // TipTap JSON (source of truth)
  contentHtml: text('content_html').notNull(), // sanitized HTML for fast SSR
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'restrict' }),
  authorId: uuid('author_id').references(() => authors.id, { onDelete: 'restrict' }),
  featuredImageId: uuid('featured_image_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  status: postStatus('status').default('draft').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isBreaking: boolean('is_breaking').default(false).notNull(),
  isTrending: boolean('is_trending').default(false).notNull(),
  seoTitle: varchar('seo_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 170 }),
  focusKeyword: varchar('focus_keyword', { length: 100 }),
  secondaryKeywords: text('secondary_keywords'),
  canonicalUrl: text('canonical_url'),
  ogTitle: varchar('og_title', { length: 95 }),
  ogDescription: varchar('og_description', { length: 200 }),
  ogImageId: uuid('og_image_id').references(() => mediaLibrary.id, { onDelete: 'set null' }),
  noindex: boolean('noindex').default(false).notNull(),
  readingTime: integer('reading_time').default(1).notNull(),
  views: integer('views').default(0).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('posts_slug_uq').on(t.slug),
  index('posts_status_published_idx').on(t.status, t.publishedAt),
  index('posts_category_idx').on(t.categoryId),
  index('posts_author_idx').on(t.authorId),
])

export const postTags = pgTable('post_tags', {
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.postId, t.tagId] })])

export const postSources = pgTable('post_sources', {
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  sourceId: uuid('source_id').notNull().references(() => sources.id, { onDelete: 'restrict' }),
  note: text('note'),
  position: integer('position').default(0).notNull(),
}, (t) => [primaryKey({ columns: [t.postId, t.sourceId] })])

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  subject: varchar('subject', { length: 150 }).notNull(),
  message: text('message').notNull(),
  status: messageStatus('status').default('unread').notNull(),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('messages_status_idx').on(t.status, t.createdAt)])

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  status: subscriberStatus('status').default('pending').notNull(), // pending = unverified
  consent: boolean('consent').notNull(),
  consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
  consentText: text('consent_text').notNull(),
  consentIpHash: text('consent_ip_hash'),
  signupSource: varchar('signup_source', { length: 40 }).notNull(),
  verificationToken: text('verification_token'), // future double opt-in
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const siteSettings = pgTable('site_settings', {
  key: varchar('key', { length: 60 }).primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const adminActivityLogs = pgTable('admin_activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => adminUsers.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 40 }).notNull(),
  entity: varchar('entity', { length: 40 }).notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index('activity_created_idx').on(t.createdAt)])

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(), // e.g. "contact:<ipHash>"
  hits: integer('hits').notNull(),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
})
```

Generate and apply migrations: `npx drizzle-kit generate` then `npx drizzle-kit migrate`.

## 4. Environment variables (`.env.example` / `.dev.vars`)

```
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=generate-64-random-hex-chars
SETUP_TOKEN=one-time-random-token-for-first-admin
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=tsc-media
R2_PUBLIC_URL=https://media.thestorycurrent.com
NEXT_PUBLIC_SITE_URL=https://thestorycurrent.com
```
Never prefix secrets with `NEXT_PUBLIC_`. In production set secrets with `npx wrangler secret put NAME`.

## 5. Local development
1. `npx create-next-app@latest the-story-current --ts --tailwind --app` then `npx shadcn@latest init`.
2. Copy `components/`, `utils/`, `types/`, `data/` from this project; convert pages to `app/` routes.
3. `npm i drizzle-orm @neondatabase/serverless zod dompurify isomorphic-dompurify @tiptap/react @tiptap/starter-kit ...` and `npm i -D drizzle-kit wrangler @opennextjs/cloudflare`.
4. Create `.dev.vars` from the template, run migrations, then `npm run dev`.

## 6. Neon setup
Create a free project at neon.tech → copy the pooled connection string → `DATABASE_URL`. Use the HTTP driver (`drizzle-orm/neon-http`) which works inside Workers without TCP sockets.

## 7. Cloudflare R2
1. Dashboard → R2 → Create bucket `tsc-media`.
2. Connect a custom domain (e.g. `media.thestorycurrent.com`) for public reads.
3. Bind the bucket in `wrangler.jsonc`: `"r2_buckets": [{ "binding": "MEDIA", "bucket_name": "tsc-media" }]`.
4. Upload route (`app/api/upload/route.ts`): verify admin session → check `file.type` against JPEG/PNG/WebP/GIF and magic bytes → reject >8 MB → `env.MEDIA.put(key, file)` → insert `media_library` row.

## 8. Cloudflare Workers deployment (OpenNext)
1. `npm i -D @opennextjs/cloudflare wrangler` and add `open-next.config.ts` per the current OpenNext Cloudflare docs.
2. `wrangler.jsonc`: `"main": ".open-next/worker.js"`, `"compatibility_flags": ["nodejs_compat"]`, assets binding, R2 binding.
3. Scripts: `"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview"`, `"deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"`.
4. `npm run deploy`. Verify the Worker bundle stays under the plan's size limit (3 MB compressed on Free).
5. Use ISR / `revalidateTag('posts')` after publish, update or delete so cached public pages refresh.
6. Scheduled posts: a Cron Trigger (`"triggers": { "crons": ["*/5 * * * *"] }`) flips due `scheduled` posts to `published` and revalidates.

## 9. Secure first-admin setup
`/admin/setup?token=SETUP_TOKEN` is only available while `admin_users` is empty. Passwords are hashed with PBKDF2-SHA256 via Web Crypto (Workers-compatible). Remove `SETUP_TOKEN` after the first admin is created.

## 10. Security checklist
- Every admin server action calls `requireAdmin()` (session cookie: `HttpOnly; Secure; SameSite=Lax`).
- Server actions are CSRF-protected by Next.js origin checks; custom API routes verify `Origin`.
- Rate limit login (5/15 min), contact (3/15 min) and subscribe (3/10 min) per hashed IP.
- Sanitize TipTap HTML on save (isomorphic-dompurify) and render the stored sanitized HTML.
- Log destructive actions to `admin_activity_logs`.
- `/admin/*` sends `X-Robots-Tag: noindex` and is disallowed in robots.txt.

## 11. Domain connection
Add the domain to Cloudflare (change nameservers at your registrar) → Workers & Pages → your Worker → Settings → Domains & Routes → add `thestorycurrent.com` and `www`. SSL is automatic.

## 12. Launch verification
- `npm run build` and `npm run preview` succeed locally.
- Remove demo content (Admin → Website Settings).
- Submit `/sitemap.xml` in Google Search Console; validate an article in the Rich Results Test.
- Run Lighthouse on homepage and an article (target LCP < 2.5s, CLS < 0.1).
- Only enable AdSense after approval; confirm ads load only after cookie consent.
