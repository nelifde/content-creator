# E2E tests (Playwright)

Bu klasör, `docs/qa/test-cases.md` içindeki **TC-01** (kayıt + yeni workspace), **TC-02** (müşteri + marka → varlıklar) ve küçük bir **smoke** testini kapsar.

## Kurulum

```bash
npm install
npx playwright install chromium
```

## Sunucu

Varsayılan: `playwright.config.ts` içinde `npm run dev` zaten çalışıyorsa onu kullanır (`reuseExistingServer`).

Port farklıysa:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

## TC-01 (kayıt + ajans)

Her çalıştırmada `qa_bulk_<timestamp>@example.com` ile yeni hesap açar; Supabase’in çalışması ve `npm run dev` altında `.env.local` dolu olmalıdır.

- E-posta onayı **açıksa** ve oturum oluşmazsa bu test **timeout / fail** verebilir; Supabase Auth’ta onayı kapatın veya testi manuel TC-01 ile doğrulayın.

```bash
npm run test:e2e -- e2e/tc-01-signup-workspace.spec.ts
```

## Kimlik bilgisi (TC-02 ana test)

Supabase’de gerçek bir hesap kullanılır. Shell’de veya CI’de:

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `E2E_EMAIL` | Evet (ana test için) | Giriş e-postası |
| `E2E_PASSWORD` | Evet | Şifre |
| `E2E_WORKSPACE_ID` | Hayır | Varsa doğrudan bu workspace’e gider; yoksa listeden ilk workspace’e tıklar |
| `E2E_CLIENT_ID` | Hayır | Varsa yeni müşteri oluşturmaz; doğrudan müşteri sayfasına gider |
| `E2E_BRAND_ID` | Sadece 2. test için | Mevcut marka UUID (kök URL redirect testi) |

Örnek:

```bash
export E2E_EMAIL="you@example.com"
export E2E_PASSWORD="your-password"
npm run test:e2e
```

`.env.local` Playwright tarafından otomatik okunmaz; export veya `env` komutu kullanın.

## Çalıştırma

```bash
npm run test:e2e
```

UI modu:

```bash
npm run test:e2e:ui
```

## Ne beklenir?

- **smoke-public**: `/en/login` 200 ve `#email` görünür.
- **TC-02 (kimlik varsa)**: Giriş → workspace → (gerekirse) müşteri oluştur → marka oluştur → URL `.../brands/<id>/assets` ve sayfada marka başlığı görünür (Next.js 404 değil).
- **brand root redirect**: `E2E_WORKSPACE_ID`, `E2E_CLIENT_ID`, `E2E_BRAND_ID` tanımlıysa `.../brands/<id>` açılınca `.../assets` olur.

Kimlik yoksa TC-02 testleri **skip** edilir; smoke test yine çalışır.
