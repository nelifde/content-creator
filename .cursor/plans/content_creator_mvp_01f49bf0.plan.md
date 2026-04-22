---
name: Content Creator MVP
overview: Ajans modelinde, Next.js + Supabase üzerine kurulu, AI destekli bulk sosyal medya içerik üretim aracının MVP'si. Buzzabout.ai estetiğinde (koyu/aydınlık otomatik, gradient vurgular, ambient blob animasyonları) marka asset yönetimi, şablon editörü, 5-adımlı bulk oluşturma sihirbazı, onay akışı ve export/convert pipeline'ı içerir. AI sağlayıcıları (Nano Banana Pro / Seedream / Kling) mock-first adapter katmanıyla entegre edilir.
todos:
  - id: bootstrap
    content: Next.js 15 + TS + Tailwind v4 + shadcn/ui + Framer Motion + next-intl (TR) kurulumu
    status: completed
  - id: design_system
    content: Tasarım token'ları (dark/light auto), gradient paleti, tipografi, ambient blob bileşeni, Button/Card varyantları
    status: completed
  - id: landing
    content: "Marketing landing sayfası (buzzabout estetikli: blob'lar, scroll-reveal, hero gradient, feature grid)"
    status: completed
  - id: supabase_setup
    content: "Supabase projesi: Auth, Storage bucket'lar, Postgres schema + RLS policy'leri"
    status: completed
  - id: data_model
    content: Workspaces / members / clients / brands / assets / templates / campaigns / content_jobs / contents / comments / asset_usages / portal_tokens tabloları
    status: completed
  - id: auth_workspace
    content: Auth akışı, workspace onboarding, rol tabanlı erişim (admin/editor/viewer/client)
    status: completed
  - id: agency_crud
    content: Clients & brands CRUD + brand switcher UI
    status: completed
  - id: brand_settings
    content: "Marka ayarları: renk paleti, font upload, logo varyantları, tone of voice, keywords, rehber PDF"
    status: completed
  - id: asset_library
    content: "Asset kütüphanesi: bulk drag&drop upload, klasör/tag, auto-tag (AI mock), versiyon, arama, usage tracking"
    status: completed
  - id: template_editor
    content: Konva tabanlı canvas editor + preset galeri (seed) + user templates + AI layout öneri
    status: completed
  - id: ai_adapters
    content: "AI adapter katmanı (mock-first): imageGen, videoGen, edit, copyGen, autoTag, layoutSuggest"
    status: completed
  - id: bulk_creator
    content: Bulk Creator 5-adımlı sihirbazı (prompt+N / CSV / brief / template×assets / platform multiply)
    status: completed
  - id: jobs_queue
    content: İçerik üretim job kuyruğu + animasyonlu progress UI + gerekli webhook/polling
    status: completed
  - id: approval_flow
    content: draft→review→approved→ready durum makinesi + rol tabanlı izinler + kanban board
    status: completed
  - id: comments
    content: İçerik üzerine yorum sistemi (thread, @mention basit)
    status: completed
  - id: client_portal
    content: Token-scoped client portalı (read + approve + yorum, sadece kendi markası)
    status: completed
  - id: export_service
    content: "Export pipeline: PNG/JPG/MP4/GIF/PDF + bulk ZIP (sharp + ffmpeg + pdf-lib + archiver)"
    status: completed
  - id: bulk_converter
    content: "Bulk Converter sayfası: asset'leri toplu oran/format dönüştürme"
    status: completed
  - id: i18n
    content: TR UI + çoklu dilli içerik (content dil seçimi copyGen'e prop olarak)
    status: completed
  - id: polish
    content: "Animasyon parlatması: page transitions, skeleton shimmer, hover micro, empty states, toast'lar"
    status: completed
isProject: false
---

# Content Creator — MVP Planı

## 1. Ürün Özeti

**Content Creator**, ajansların birden fazla müşterisinin markaları için sosyal medya içeriğini **bulk** şekilde üretmesini sağlayan bir web SaaS. Temel değer önerisi: bir brief / prompt / CSV / asset seti → onlarca platform-optimize içerik (görsel + video + copy), onay akışından geçip export edilir.

## 2. Bilgi Mimarisi (Agency Modeli)

```mermaid
flowchart LR
    Workspace[Workspace / Ajans] --> Members[Members<br/>admin, editor, viewer, client]
    Workspace --> Clients[Clients]
    Clients --> Brands[Brands]
    Brands --> Assets[Assets<br/>logo, image, video, font, PDF]
    Brands --> Templates[Templates]
    Brands --> Campaigns[Campaigns]
    Campaigns --> Contents[Contents<br/>draft to review to approved]
    Contents --> Comments[Comments]
    Contents --> Exports[Exports<br/>PNG JPG MP4 GIF PDF ZIP]
```



## 3. Teknik Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Framer Motion + `next-intl` (TR UI)
- **State/Data:** TanStack Query + Zustand (local UI)
- **Canvas editor:** Konva / react-konva (layer tabanlı şablon editörü)
- **Medya işleme:** `sharp` (server, raster), `ffmpeg.wasm` (client-side bulk converter fallback: server-side `ffmpeg` Edge Function)
- **Backend:** Supabase (Postgres + Auth + Storage + RLS + Edge Functions)
- **AI:** Adapter katmanı — **mock-first**, sonra gerçek API'lar (Gemini 2.5 "Nano Banana Pro", Seedream, Kling)
- **Upload:** `react-dropzone` + resumable chunk upload (büyük video için)
- **Export:** server-side `sharp` + `ffmpeg` + `pdf-lib`, istek üzerine `archiver` ile ZIP

## 4. Veri Modeli (özet)

Supabase tabloları (RLS workspace rolüne göre):

- `workspaces`, `workspace_members(role)`
- `clients` → workspace'e bağlı
- `brands` → client'a bağlı; `colors jsonb`, `fonts jsonb`, `tone text`, `keywords text[]`, `guideline_pdf_url`
- `brand_assets` → `type (logo|image|video|font|doc)`, `folder`, `tags text[]`, `version`, `parent_id`
- `templates` → `scope (workspace|brand)`, `layers jsonb`, `preview_url`
- `campaigns` → brand'e bağlı
- `content_jobs` → bulk job, `input_type`, `payload jsonb`, `status`, `progress`
- `contents` → `platform`, `aspect_ratio`, `status (draft|review|approved|ready)`, `caption`, `hashtags[]`, `layers jsonb`, `export_urls jsonb`, `ai_provider`, `language`
- `comments` → content'e bağlı
- `asset_usages` → asset ↔ content
- `client_portal_tokens` → scoped erişim

## 5. Sayfa Haritası

- `/` — Marketing landing (buzzabout estetiği, ambient blobs, scroll reveal)
- `/app` — Auth sonrası workspace seçimi
- `/app/[workspace]` — Dashboard (müşteriler, son kampanyalar, jobs queue)
- `/app/[workspace]/clients/[client]/brands/[brand]`:
  - `/assets` — Asset kütüphanesi (bulk upload, klasör/tag, auto-tag, versions, search, usage)
  - `/templates` — Preset galeri + editor (Konva), user templates, AI layout öneri
  - `/campaigns` — Kampanya listesi
  - `/campaigns/[id]` — İçerik board'u (kanban: draft/review/approved/ready + yorumlar)
  - `/create` — **Bulk Creator** sihirbazı (5 adım)
  - `/convert` — **Bulk Converter** (asset'leri oran/format dönüştürme)
  - `/settings` — Renkler, fontlar, logolar, tone, rehber PDF, keywords
- `/portal/[token]` — Client portal (sadece kendi markasını görür, onaylar/yorumlar)

## 6. Core Feature Akışları

### 6.1 Bulk Creator Sihirbazı (5 adım)

1. **Input method** — prompt+N varyant / CSV-Excel yükleme / kampanya brief'i / template×assets / platform multiply
2. **Platform & Aspect** — IG, TikTok, X, LinkedIn, FB, YouTube × (1:1, 4:5, 9:16, 16:9, custom)
3. **Brand binding** — otomatik palette/font/logo enjeksiyonu, dil seçimi (multi-content)
4. **AI provider** — görsel: **Nano Banana Pro (default)**; video: **Seedream / Kling**; copy: full (caption + başlık + hashtag + CTA)
5. **Review & Generate** — job kuyruğu, animasyonlu progress, sonuçlar campaigns board'una düşer

### 6.2 Onay Akışı

`draft → review → approved → ready` — rol tabanlı izinler, client portal sadece `review` ve `approved` görür; yorum bırakabilir, onay verebilir.

### 6.3 Bulk Converter

Asset library'den seçim → hedef platform/oran/format listesi → batch işlem (sharp + ffmpeg) → ZIP.

## 7. AI Adapter Katmanı (mock-first)

```
lib/ai/
  imageGen.ts       // nanoBananaPro (default), seedream
  videoGen.ts       // seedream, kling
  edit.ts           // bgRemove, upscale, inpaint
  copyGen.ts        // caption, title, hashtags, CTA (multi-lang)
  autoTag.ts        // asset otomatik etiketleme
  layoutSuggest.ts  // brief → template layer JSON
```

Her biri tipli kontrat + mock implementation. Gerçek API swap'i tek satırda olur.

## 8. Tasarım Sistemi

- **Tema:** sistem ayarına göre auto (dark/light), `class` stratejisi
- **Palet:** CSS değişkenleri üzerinden token'lı — başlangıç palet önerisi (onay/revize açık):
  - bg: deep indigo (`#0B0B1A` → `#101028`)
  - accent gradient: violet `#7C5CFF` → cyan `#22D3EE` (alternatif: violet → pink)
  - surface glass: `rgba(255,255,255,0.04)` + blur
- **Tipografi:** Inter (body) + Space Grotesk (display)
- **Animasyonlar:** ambient gradient blobs (arka plan), scroll-reveal (Framer Motion `whileInView`), hover micro (glow + lift), page transitions (layout animasyonu), skeleton + shimmer, **jobs queue için animasyonlu progress kartları**
- **UI kiti:** shadcn/ui + custom button/card varyantları (gradient border, glow)

## 9. MVP Kapsam Dışı (sonraki faz)

- Direkt sosyal medyaya publish / scheduling
- Analitik / performans raporları
- Gerçek AI API bağlantıları (mock'lar önce devreye girer)
- Takım sohbeti / realtime editör

## 10. Riskler & Notlar

- **Nano Banana Pro / Seedream / Kling** API'ları doğrulanacak (Nano Banana Pro = Google Gemini 2.5 Flash Image Pro; Seedream = ByteDance; Kling = Kuaishou). Adapter mock-first olduğu için bu risk izole.
- Büyük video upload + export için storage kotası ve Edge Function süre limiti (Supabase'de 150s) dikkate alınmalı — gerekirse arka planda ayrı bir job worker (ileriki faz).
- Konva editor'ü MVP'de **basit tutulacak** (text, image, shape, logo; complex video editing yok).

