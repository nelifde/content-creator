# Supabase kurulumu

1. [Supabase](https://supabase.com) üzerinde yeni proje oluşturun.
2. **SQL Editor** içinde [migrations/001_initial_schema.sql](./migrations/001_initial_schema.sql) dosyasının tamamını çalıştırın.
3. **Storage** → `brand-assets` bucket’ının oluştuğunu doğrulayın (migration içinde tanımlı).
4. Uygulama `.env.local` dosyasına ekleyin:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - İstemci portalı ve yönetim işlemleri için: `SUPABASE_SERVICE_ROLE_KEY` (yalnızca sunucu tarafı)

Auth: Email provider’ı Dashboard → Authentication’da etkinleştirin.
