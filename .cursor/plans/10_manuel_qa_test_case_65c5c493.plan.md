---
name: 10 manuel QA test case
overview: Content Creator MVP için testerların elle çalıştıracağı 10 Türkçe manuel QA test case'i. Her case; önkoşul, test verisi, adımlar, beklenen sonuç ve öncelik içerir. Auth'tan bulk üretim, onay akışı, müşteri portalı, export ve admin paneline kadar kritik yolların tamamını kapsar.
todos:
  - id: scaffold_doc
    content: docs/qa/test-cases.md oluştur; başlık + Test ortamı + şablon bölümü ekle
    status: completed
  - id: tc01_auth
    content: TC-01 kayıt ve workspace onboarding
    status: completed
  - id: tc02_crud
    content: TC-02 müşteri ve marka oluşturma
    status: completed
  - id: tc03_brand_settings
    content: TC-03 marka ayarları (renk/font/logo/tone/PDF)
    status: completed
  - id: tc04_assets
    content: TC-04 asset kütüphanesi bulk upload + tag + arama
    status: completed
  - id: tc05_templates
    content: TC-05 şablon editörü preset + kaydet
    status: completed
  - id: tc06_bulk_creator
    content: TC-06 Bulk Creator 5 adımlı wizard
    status: completed
  - id: tc07_approval
    content: TC-07 job queue + kanban approval akışı
    status: completed
  - id: tc08_portal
    content: TC-08 yorumlar + client portal token ile onay
    status: completed
  - id: tc09_converter
    content: TC-09 bulk converter ZIP export
    status: completed
  - id: tc10_admin
    content: TC-10 platform & workspace admin panelleri yetki
    status: completed
isProject: false
---

## Hedef

Kayıt kapsamı: Auth/onboarding, ajans CRUD, marka ayarları, asset kütüphanesi, şablon editörü, bulk creator wizard'ı, job queue + onay akışı, yorumlar + client portal, bulk converter export ve admin paneli.

## Çıktı

Tek bir markdown dosyası: [docs/qa/test-cases.md](docs/qa/test-cases.md) (klasör yoksa oluşturulacak). Her test case şu şablonda:

```markdown
### TC-0X — <Başlık>
- **Öncelik:** Kritik | Yüksek | Orta
- **Modül:** <Alan>
- **Önkoşullar:** …
- **Test verisi:** …
- **Adımlar:**
  1. …
- **Beklenen sonuç:** …
- **Negatif varyant (opsiyonel):** …
```

Dosyanın başında kısa bir "Test ortamı" bölümü olacak: `.env.local` hazır Supabase projesi, `npm run dev`, en az 1 onboarded workspace (admin rolünde kullanıcı), TR locale varsayılan, boş/taze DB önerisi.

## 10 Test Case Listesi

1. **TC-01 — Kayıt ve yeni workspace (ajans) onboarding**
  Modül: Auth + onboarding. `/signup` → `/app` → ajans adı girip oluştur.
   Ref: [src/app/[locale]/signup/page.tsx](src/app/[locale]/signup/page.tsx), [src/app/[locale]/app/page.tsx](src/app/[locale]/app/page.tsx). Admin rolü + dashboard'a yönlendirme doğrulanır.
2. **TC-02 — Müşteri ve marka oluşturma (ajans CRUD)**
  Modül: Clients/Brands. Workspace dashboard → "Müşteri ekle" → müşteri kartı → "Marka ekle" → marka detayına git.
   Ref: [src/app/[locale]/app/[workspaceId]/page.tsx](src/app/[locale]/app/[workspaceId]/page.tsx), [src/app/[locale]/app/[workspaceId]/clients/[clientId]/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/page.tsx). Sidebar brand switcher görünür olmalı.
3. **TC-03 — Marka ayarları: renk paleti, font, logo, tone, keywords, rehber PDF**
  Modül: Brand settings. Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/settings/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/settings/page.tsx). Kaydet → reload sonrası tüm alanlar persist olmalı; logo/PDF Supabase Storage'da saklanmalı.
4. **TC-04 — Asset kütüphanesi: bulk drag & drop upload, klasör/tag, arama, auto-tag, versiyon**
  Modül: Assets. Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/assets/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/assets/page.tsx). 5+ dosya toplu yükle, tag ara, parent/child version ilişkisi doğrulanır.
5. **TC-05 — Şablon editörü: preset seç, katman düzenle, kaydet**
  Modül: Templates (Konva). Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/templates/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/templates/page.tsx). Text/image/shape ekle, logo enjekte et, preview_url oluşmalı; yeniden aç → layers intact.
6. **TC-06 — Bulk Creator sihirbazı (prompt+N, 5 adım)**
  Modül: Bulk Creator. Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/create/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/create/page.tsx), `BulkCreatorWizard`. Step1 prompt+N → Step2 IG 1:1 + 9:16 → Step3 marka + TR dil → Step4 Nano Banana Pro → Step5 Üretimi başlat. `content_jobs` kaydı oluşmalı, progress animasyonu akmalı.
7. **TC-07 — Job queue tamamlanması ve kampanya kanban onay akışı (draft→review→approved→ready)**
  Modül: Jobs + approval. Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/campaigns/[campaignId]/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/campaigns/[campaignId]/page.tsx). Job tamamlanınca içerikler draft kolonunda → review → approved → ready sürüklenir; editor rolü move edebilir, viewer edemez (negatif varyant).
8. **TC-08 — İçerik yorumları + Client portal ile onay**
  Modül: Comments + portal token. Content detayda yorum ekle, `/portal/[token]` üret → farklı/incognito tarayıcıda aç → yalnız ilgili markanın review/approved içerikleri görünür; client yorum + approve edebilir. Ref: [src/app/portal/[token]/page.tsx](src/app/portal/[token]/page.tsx). Negatif: başka markanın içeriği portalda listelenmemeli.
9. **TC-09 — Bulk Converter: asset'leri toplu oran/format dönüştürme + ZIP indirme**
  Modül: Converter/export. Ref: [src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/convert/page.tsx](src/app/[locale]/app/[workspaceId]/clients/[clientId]/brands/[brandId]/convert/page.tsx). 3 görsel seç → 1:1 PNG + 9:16 JPG + 4:5 PNG hedefle → ZIP oluştur ve indir; içerik doğru aspect/format içermeli.
10. **TC-10 — Admin panelleri yetki ve gözlem: platform admin (`/admin`) ve workspace admin (`/app/[id]/admin`)**
  Modül: Admin. Ref: [src/app/[locale]/admin/page.tsx](src/app/[locale]/admin/page.tsx), [src/app/[locale]/app/[workspaceId]/admin/page.tsx](src/app/[locale]/app/[workspaceId]/admin/page.tsx). `platform_admins` kaydı olmayan kullanıcı `/admin`'e giremez; workspace admin yalnız kendi workspace'inin üye/jobs/content/usage panelini görür. Users, jobs, audit sekmeleri listelenir.

## Sorumu atladığınız için varsayımlarım

- Format: manuel QA (tester'lar için adımlı). Otomasyon (Playwright/Vitest) istenirse yeniden planlarım.
- Dil: Türkçe (UI TR ile tutarlı).
- Kapsama: her kritik modülden 1 senaryo (yoğunluk Bulk Creator + Approval'da).
- Admin için platform + workspace adminini tek case'de birleştirdim.

Bunlardan biri yanlışsa (örn. "Playwright E2E istiyorum" veya "sadece Bulk Creator derinlemesine") söyle, planı revize ederim.