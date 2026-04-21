# Supabase kurulumu

1. [Supabase](https://supabase.com) üzerinde yeni proje oluşturun.
2. **SQL Editor** içinde sırayla şu migration dosyalarının tamamını çalıştırın:
   - [migrations/001_initial_schema.sql](./migrations/001_initial_schema.sql)
   - [migrations/002_admin_schema.sql](./migrations/002_admin_schema.sql)
   - [migrations/003_stripe_subscriptions.sql](./migrations/003_stripe_subscriptions.sql) (opsiyonel — Stripe faturalandırma)
3. **Storage** → `brand-assets` bucket’ının oluştuğunu doğrulayın (migration içinde tanımlı).
4. Uygulama `.env.local` dosyasına ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - İstemci portalı ve yönetim işlemleri için: `SUPABASE_SERVICE_ROLE_KEY` (yalnızca sunucu tarafı)

Auth: Email provider’ı Dashboard → Authentication’da etkinleştirin.

**Platform super-admin:** `002` çalıştırdıktan sonra SQL Editor’da kendi kullanıcı UUID’nizi ekleyin:

```sql
insert into public.platform_admins (user_id) values ('YOUR_AUTH_USER_UUID');
```
