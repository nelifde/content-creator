# Content Creator

Ajans modelinde bulk sosyal medya içerik üretimi — Next.js 16, Supabase, shadcn/ui.

## Kurulum

```bash
npm install
cp .env.example .env.local
```

Supabase adımları için [supabase/README.md](supabase/README.md) dosyasına bakın. Migration dosyaları: `001_initial_schema.sql`, `002_admin_schema.sql`, `003_stripe_subscriptions.sql` (opsiyonel). Ardından `.env.local` içine URL ve anahtarları ekleyin.

**Client portal** ve arka plan işleri için `SUPABASE_SERVICE_ROLE_KEY` gerekir (yalnızca sunucu tarafında kullanın).

```bash
npm run dev
```

- Pazarlama: `/` (varsayılan dil `tr`)
- Uygulama: `/app`
- **Platform yönetimi** (super-admin): `/admin` — `platform_admins` tablosunda kayıtlı kullanıcılar + `SUPABASE_SERVICE_ROLE_KEY`
- **Çalışma alanı yönetimi** (workspace admin): `/app/[workspaceId]/admin` — `workspace_members.role = admin`

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Auth, Postgres, Storage, RLS)
- next-intl (TR UI), Framer Motion, TanStack Query
- Konva şablon editörü, Sharp tabanlı export/converter (API routes)
