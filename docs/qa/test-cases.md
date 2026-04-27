# Content Creator — Manuel QA test case'leri

Bu doküman MVP kapsamında kritik kullanıcı akışlarını doğrulamak için 10 manuel test senaryosunu içerir. Varsayılan dil Türkçe (`tr`); URL'lerde locale öneki yoktur (`localePrefix: as-needed`).

---

## Test ortamı

| Öğe | Beklenti |
|-----|----------|
| Bağımlılıklar | `npm install` tamamlanmış |
| Ortam değişkenleri | `.env.local` — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`; portal ve platform admin için sunucuda `SUPABASE_SERVICE_ROLE_KEY` |
| Veritabanı | Supabase migration'lar uygulanmış; mümkünse taze veya bilinen test verisi |
| Sunucu | `npm run dev` — varsayılan `http://localhost:3000` |
| Otomasyon | TC-01, TC-02 ve smoke için Playwright: `e2e/README.md`, `npm run test:e2e` |
| Tarayıcı | Chromium tabanlı + gizli pencere (portal token testi için) |
| E-posta onayı | Supabase Auth’ta e-posta doğrulaması açıksa, test hesabı önceden onaylı olmalı veya dev ortamında kapatılmalı |

**Not:** Supabase’de e-posta onayı zorunluysa TC-01’de kayıt sonrası oturum açılmayabilir; bu durumda testçi mevcut onaylı bir hesapla TC-02’den başlayıp TC-01’i ayrı “e-posta onayı kapalı ortam”da çalıştırmalıdır.

---

### TC-01 — Kayıt ve yeni workspace (ajans) onboarding

- **Öncelik:** Kritik
- **Modül:** Auth + çalışma alanı (workspace) onboarding
- **Önkoşullar:** Supabase Auth çalışıyor; `NEXT_PUBLIC_*` anahtarları tanımlı; test için benzersiz e-posta kullanılabilir.
- **Test verisi:** E-posta: `qa_bulk_<tarih>@example.com`, şifre: en az 6 karakter (örn. `TestQA1!`), ajans adı: `QA Ajans A`
- **Adımlar:**
  1. `/signup` sayfasını aç.
  2. **E-posta** ve **Şifre** alanlarını doldur; **Kayıt ol**’a tıkla.
  3. Başarılı olursa `/app` (Çalışma alanları) sayfasına yönlendirildiğini doğrula; toast’ta “Hesap oluşturuldu” benzeri mesaj görülebilir.
  4. **Ajans adı** alanına `QA Ajans A` yaz; **Oluştur**’a tıkla.
  5. Yeni oluşturulan çalışma alanına yönlendirildiğini doğrula (URL `/app/<workspaceId>`).
  6. Sayfada müşteri listesi / **Müşteri ekle** formu ve badge’de rolünün göründüğünü doğrula (örn. `Rolünüz: admin`).
- **Beklenen sonuç:** Kullanıcı kaydı tamamlanır; çalışma alanı oluşur; kullanıcı o workspace üyesi ve admin rolündedir; “Ajans oluşturuldu” toast’ı görülebilir.
- **Negatif varyant (opsiyonel):** Geçersiz e-posta veya &lt;6 karakter şifre → gönderim engellenir veya Supabase hata mesajı gösterilir.

---

### TC-02 — Müşteri ve marka oluşturma (ajans CRUD)

- **Öncelik:** Kritik
- **Modül:** Müşteriler (`clients`) ve markalar (`brands`)
- **Önkoşullar:** TC-01 tamamlanmış veya en az bir workspace’te `admin`/`editor` rolü ile giriş yapılmış hesap.
- **Test verisi:** Müşteri adı: `QA Müşteri`, marka adı: `QA Marka`
- **Adımlar:**
  1. `/app/<workspaceId>` workspace özetine git.
  2. **Müşteri adı** alanına `QA Müşteri` yaz; **Müşteri ekle**’ye tıkla.
  3. Müşteri detay sayfasına yönlendirildiğini doğrula (URL `/app/.../clients/<clientId>`); “Müşteri eklendi” toast’ı.
  4. **Marka adı** alanına `QA Marka` yaz; **Marka ekle**’ye tıkla.
  5. Marka varlıkları sayfasına yönlendirildiğini doğrula (URL `.../brands/<brandId>/assets`); “Marka eklendi” toast’ı.
  6. Sol/sidebar navigasyonda **Varlıklar**, **Şablonlar**, **Kampanyalar**, **Bulk oluştur**, **Bulk dönüştür**, **Marka ayarları** bağlantılarının marka bağlamında erişilebilir olduğunu kontrol et.
- **Beklenen sonuç:** Müşteri ve marka veritabanında oluşur; marka kartından doğru marka ID ile alt sayfalara geçiş yapılır.
- **Negatif varyant (opsiyonel):** Boş isimle gönderim — form gönderilmemeli veya hata verilmeli.

---

### TC-03 — Marka ayarları: logo, ton, anahtar kelimeler, renk/font JSON, rehber PDF URL

- **Öncelik:** Yüksek
- **Modül:** Marka ayarları (`/.../brands/[brandId]/settings`)
- **Önkoşullar:** TC-02’de oluşturulmuş bir marka; küçük bir PNG logo dosyası; geçerli JSON örneği.
- **Test verisi:**
  - Logo: `qa-logo.png` (küçük PNG)
  - Ton: `Samimi, kısa cümleler, emoji az.`
  - Anahtar kelimeler: `yazılım, b2b, güven`
  - Renk JSON (örnek): `[{"name":"Primary","hex":"#7c5cff"}]`
  - Font JSON (örnek): `[{"family":"Inter","weights":[400,600]}]`
  - Rehber PDF URL: `https://example.com/brand-guidelines.pdf` (veya gerçek bir public PDF URL)
- **Adımlar:**
  1. Marka için **Marka ayarları** sayfasına git (`.../settings`).
  2. **Logo yükle (sürükle veya tıkla)** alanına test logosunu bırak veya tıkla-yükle; başarı toast’ı (`... yüklendi`).
  3. **Ton of voice** alanını doldur; **Anahtar kelimeler (virgülle)** alanına test kelimelerini yaz.
  4. **Renk paleti (JSON)** ve **Fontlar (JSON)** alanlarını yukarıdaki geçerli JSON ile güncelle.
  5. **Rehber PDF URL** alanına URL’yi gir.
  6. **Kaydet**’e tıkla; “Kaydedildi” toast’ını doğrula.
  7. Sayfayı yenile (F5); tüm alanların (ton, kelimeler, JSON’lar, URL) kayıtlı değerleri gösterdiğini doğrula.
  8. **Müşteri portal bağlantısı** bölümünün sayfada göründüğünü (TC-08 için) not et.
- **Beklenen sonuç:** Ayarlar kalıcıdır; logo yükleme `brand-assets` storage ve `brand_assets` kaydı oluşturur; form kaydı hatasız tamamlanır.
- **Negatif varyant (opsiyonel):** Renk veya font alanına geçersiz JSON yaz → **Kaydet** → “JSON geçersiz” toast’ı beklenir.

---

### TC-04 — Asset kütüphanesi: toplu yükleme, klasör, arama, otomatik etiketler

- **Öncelik:** Yüksek
- **Modül:** Varlıklar (`/.../brands/[brandId]/assets`)
- **Önkoşullar:** En az bir marka; 3–5 adet küçük görsel dosyası (JPG/PNG).
- **Test verisi:** Klasör adı: `Q1_Kampanya`; dosya adlarında tanınabilir kelimeler (mock auto-tag dosya adına dayanır, örn. `product_hero.jpg`).
- **Adımlar:**
  1. **Varlıklar** sayfasına git.
  2. **Klasör** alanına `Q1_Kampanya` yaz.
  3. **Yükle — sürükle veya tıkla (çoklu)** alanına birden fazla dosyayı aynı anda bırak veya çoklu seçim ile yükle.
  4. Her dosya için başarı toast’ının geldiğini doğrula; grid’de yeni kartların listelendiğini kontrol et.
  5. Kart üzerinde klasörün `Q1_Kampanya` (veya girilen değer), sürümün `v1` (veya listede gösterilen sürüm) olarak göründüğünü doğrula.
  6. Otomatik etiketlerin (varsa) badge olarak göründüğünü kontrol et.
  7. Arama formunda bir dosya adının parçasını yaz; **Ara**’ya tıkla; sonuçların filtrelendiğini doğrula.
- **Beklenen sonuç:** Çoklu yükleme tamamlanır; `public_url` olan görseller önizleme gösterir; arama `q` parametresi ile isim/klasör eşleşmesi yapar.
- **Negatif varyant (opsiyonel):** Çok büyük dosya veya kota aşımı — hata mesajı veya toast.

---

### TC-05 — Şablon stüdyosu: preset, canvas, AI layout önerisi, kaydet

- **Öncelik:** Yüksek
- **Modül:** Şablonlar (`/.../brands/[brandId]/templates`) — `TemplateStudio` + Konva canvas
- **Önkoşullar:** Marka mevcut.
- **Test verisi:** Şablon adı: `QA Şablon 01`; AI brief: `Yazılım lansmanı, mor ve cam efekti`
- **Adımlar:**
  1. **Şablonlar** sayfasına git.
  2. **Şablon stüdyosu** bölümünde **Preset galeri**’den **Product hero** veya **Quote card**’a tıkla; canvas’ın güncellendiğini doğrula.
  3. İsteğe bağlı: canvas üzerinde metin/katman düzenlemesi yapılabiliyorsa değişiklik yap.
  4. **AI layout önerisi** kartında brief alanına test metnini yaz; **Öner**’e tıkla; “Layout önerildi” toast’ını ve canvas güncellemesini doğrula.
  5. **Kaydet** kartında şablon adını `QA Şablon 01` yap; **Kaydet** butonuna tıkla; “Şablon kaydedildi” toast’ını doğrula.
  6. Sayfayı yenile; **Kayıtlı şablonlar** listesinde `QA Şablon 01` satırının göründüğünü ve tipinin **Özel** olduğunu doğrula.
- **Beklenen sonuç:** Preset yüklenir; mock AI layout uygulanır; şablon `templates` tablosuna yazılır ve listede görünür.
- **Negatif varyant (opsiyonel):** Katman oluşturmadan **Kaydet** → “Önce katman oluşturun” toast’ı.

---

### TC-06 — Bulk Creator sihirbazı (Prompt + varyant, 5 adım, üretim ve job durumu)

- **Öncelik:** Kritik
- **Modül:** Bulk içerik oluştur (`/.../brands/[brandId]/create`)
- **Önkoşullar:** `admin` veya `editor` workspace rolü (job insert RLS); marka ve tercihen boş/küçük kota.
- **Test verisi:** Prompt: `Sosyal medya için minimal ürün görseli`; Varyant: `2`; Adım 2: platform `instagram`, oranlar `1:1` ve `9:16`; Adım 3: içerik dili **Türkçe**, kampanya adı: `QA Bulk Kampanya`; Adım 4: görsel **Nano Banana Pro**; video **Seedream**
- **Adımlar:**
  1. **Bulk oluştur** sayfasına git; başlık **Bulk içerik oluştur** olmalı.
  2. Adım şeridinde **1. Girdi yöntemi** seçili iken **Prompt + varyant sayısı** modunu seç; Prompt ve Varyant alanlarını doldur.
  3. **İleri** ile **2. Platform & oran** adımına geç; **instagram** işaretle; **1:1** ve **9:16** oranlarını işaretle; içerik türü olarak en az **static** seçili kalsın.
  4. **İleri** → **3. Marka & dil**; **İçerik dili** olarak **Türkçe**; **Kampanya adı** olarak test kampanya adını gir.
  5. **İleri** → **4. AI sağlayıcı**; görsel sağlayıcı **Nano Banana Pro**, video **Seedream** seçili olsun.
  6. **İleri** → **5. Özet & üret**; **Üretimi başlat**’a tıkla.
  7. İlerleme çubuğu ve `Durum: ...` metninin güncellendiğini izle; tamamlanınca “Üretim tamamlandı” toast’ını doğrula.
  8. Workspace özetine dön (`/app/<workspaceId>`); **Son üretim işleri** bölümünde yeni işin listelendiğini ve **Kampanyayı aç** linkinin çalıştığını doğrula.
- **Beklenen sonuç:** `content_jobs` kaydı oluşur, işlem tamamlanır, içerikler ilgili kampanyada oluşur; UI polling ile durum/progress güncellenir.
- **Negatif varyant (opsiyonel):** `viewer` rolü ile aynı akış — job oluşturma başarısız / RLS hatası beklenir.

---

### TC-07 — Kampanya kanban onay akışı ve rol kısıtı (draft → review → approved → ready)

- **Öncelik:** Kritik
- **Modül:** Kampanya detayı — `CampaignKanban` + `updateContentStatus` (RLS: içerik güncelleme yalnız `admin`/`editor`)
- **Önkoşullar:** TC-06 sonrası en az bir içerik `draft` durumunda veya manuel oluşturulmuş kampanya içeriği; ayrıca `viewer` rolü ile ikinci test hesabı (veya üye rolü değiştirme imkânı).
- **Test verisi:** Kanban’da bir `draft` içerik kartı
- **Adımlar:**
  1. İlgili kampanya sayfasına git (`.../campaigns/<campaignId>`); **Kanban & yorumlar** altında dört kolon olduğunu doğrula: **Taslak**, **İncelemede**, **Onaylandı**, **Hazır**.
  2. `draft` kolonundaki bir kartta **İncelemeye gönder**’e tıkla; kartın **İncelemede** kolonuna taşındığını doğrula.
  3. Aynı kartta **Onayla**’ya tıkla; **Onaylandı** kolonuna geçtiğini doğrula.
  4. **Hazır işaretle**’ye tıkla; **Hazır** kolonuna geçtiğini doğrula.
  5. Kolon başlıkları yanındaki sayaç badge’lerinin içerik sayılarıyla tutarlı olduğunu kontrol et.
  6. **Negatif:** `viewer` kullanıcısı ile aynı sayfada **İncelemeye gönder** / **Onayla** / **Hazır işaretle** dene → toast’ta hata (RLS/permission) veya işlem gerçekleşmez; durum değişmemeli.
- **Beklenen sonuç:** `admin`/`editor` akışı uçtan uca çalışır; `viewer` içerik statüsünü güncelleyemez (`contents_update` politikası).

---

### TC-08 — Kampanya yorumları ve müşteri portalı (token, onay, portal yorumu)

- **Öncelik:** Kritik
- **Modül:** `CampaignComments` + **Marka ayarları** içinde `PortalTokenSection` + `/portal/[token]`
- **Önkoşullar:** `SUPABASE_SERVICE_ROLE_KEY` tanımlı (portal sunucu tarafında admin client kullanır); en az bir içerik `review` veya `approved` durumunda (portal sorgusu `review` ve `approved` listeler); TC-07 ile bir içeriği `review` veya sonrasına getirin.
- **Test verisi:** Ajans yorumu: `Lütfen CTA kısaltın @musteri`; Portal yorumu: `Onaylıyoruz, teşekkürler`
- **Adımlar:**
  1. Kampanya sayfasında **Yorumlar** bölümüne in; bir içerik kartı altında **Yorum yazın... @kullanıcı ile bahset** placeholder’lı alana ajans yorumunu yaz; **Gönder**’e tıkla; “Yorum eklendi” ve listede vurgulu `@` metni.
  2. **Marka ayarları**’na git; **Müşteri portal bağlantısı** bölümünde **Yeni portal linki**’ne tıkla; “Token oluşturuldu” ve ekranda `.../portal/<token>` URL’sinin göründüğünü doğrula.
  3. URL’yi kopyala; gizli/incognito pencerede aç (oturum açmadan).
  4. Portal başlığında marka adı ve yalnızca **İncelemede**/**Onaylı** statülü içeriklerin listelendiğini doğrula; `draft` içeriklerin portalda görünmediğini kontrol et.
  5. `review` durumundaki bir içerikte **Onayla**’ya tıkla; “Onaylandı” toast’ı ve durum güncellemesi.
  6. **Revizyon / yorum** alanına metin yazıp **Yorum gönder** ile portal yorumunu gönder; başarı toast’ı.
  7. Ajans tarafında kampanya/yorum ekranından (mümkünse) portal yorumunun izlenebilir olduğunu veya Supabase `comments` tablosunda `portal_token_id` dolu kayıt olduğunu doğrula.
- **Beklenen sonuç:** Token URL’si markaya scoped çalışır; portal `SUPABASE_SERVICE_ROLE_KEY` olmadan anlamlı hata mesajı gösterir; onay ve portal yorumu sunucu aksiyonlarıyla tamamlanır.
- **Negatif varyant (opsiyonel):** Geçersiz token URL → “Geçersiz bağlantı.”

---

### TC-09 — Bulk dönüştürücü: varlık seçimi, hedef oranlar, format, ZIP indirme

- **Öncelik:** Yüksek
- **Modül:** **Bulk dönüştür** (`/.../brands/[brandId]/convert`) — `BulkConverter` + `/api/convert`
- **Önkoşullar:** Markada en az 3 görsel veya logo tipi `brand_assets` kaydı (`image`/`logo`); kullanıcı giriş yapmış.
- **Test verisi:** Hedef oranlar: `1:1`, `4:5`, `9:16`; format: **PNG** (UI tek seferde tek format uygular; JPG doğrulaması için ikinci bir ZIP indirimi isteğe bağlı)
- **Adımlar:**
  1. **Bulk dönüştür** sayfasına git.
  2. **Varlıklar** listesinden en az üç öğeyi işaretle.
  3. **Hedef oranlar** altında `1:1`, `4:5`, `9:16` kutularını işaretle (liste `custom` hariç oranları gösterir).
  4. **Format** açılır listesinden **PNG** seç.
  5. **ZIP indir** butonuna tıkla; “ZIP indirildi” toast’ını ve tarayıcının `converted.zip` dosyasını indirdiğini doğrula.
  6. ZIP’i aç; dosya sayısının (seçilen varlık sayısı × seçilen oran sayısı) ile uyumlu olduğunu ve çıktıların PNG olduğunu kontrol et (görsel oranları gözle veya araçla doğrula).
  7. *(İsteğe bağlı)* **Format** olarak **JPG** seçip aynı seçimle tekrar **ZIP indir**; yeni ZIP’te JPEG içeriği olduğunu doğrula.
- **Beklenen sonuç:** `POST /api/convert` başarılı yanıt verir; blob ZIP’tir; kullanıcı arayüzü hata vermez.
- **Negatif varyant (opsiyonel):** Hiç varlık seçilmeden **ZIP indir** — buton disabled kalmalı.

---

### TC-10 — Platform admin (`/admin`) ve workspace admin (`/app/[workspaceId]/admin`) erişimi

- **Öncelik:** Yüksek
- **Modül:** `requirePlatformAdmin` + `requireWorkspaceAdmin` korumalı layout’lar
- **Önkoşullar:** (A) `platform_admins` tablosunda kayıtlı bir kullanıcı + service role ile dashboard sorguları; (B) workspace `admin` rolü; (C) platform admin **olmayan** normal kullanıcı hesabı.
- **Test verisi:** — 
- **Adımlar:**
  1. **Platform admin** hesabıyla `/admin` aç; kenar çubuğunda **Özet**, **Çalışma alanları**, **Kullanıcılar**, **İşler**, **İçerik**, **Planlar**, **Denetim** bağlantılarının göründüğünü doğrula; özet metrikler yüklenir.
  2. `.env.local` içinden geçici olarak `SUPABASE_SERVICE_ROLE_KEY` kaldırılıp sunucu yeniden başlatılırsa (sadece staging’de önerilir): `/admin` üzerinde service role uyarısı (`SUPABASE_SERVICE_ROLE_KEY tanımlı değil`) görüldüğünü not et; anahtarı geri ekleyin.
  3. Platform admin **olmayan** kullanıcı ile `/admin`’e gitmeyi dene → `/app`’e yönlendirilme beklenir (`requirePlatformAdmin`).
  4. Workspace **admin** kullanıcısıyla `/app/<workspaceId>` üzerinden **Yönetim paneli** linkine tıkla (`.../app/<workspaceId>/admin`).
  5. Workspace admin kenar çubuğunda **Özet**, **Üyeler**, **Müşteriler**, **Markalar**, **İşler**, **İçerik**, **Kullanım**, **Denetim** (çeviri anahtarlarına göre etiketler) olduğunu doğrula; dashboard içeriği yüklenir.
  6. Aynı workspace’te **admin olmayan** (`editor` veya `viewer`) üye ile `/app/<workspaceId>/admin` URL’sine doğrudan git → workspace ana sayfasına yönlendirilme (`requireWorkspaceAdmin`).
- **Beklenen sonuç:** Rol ayrımı tutarlı; platform ve workspace admin panelleri yalnız yetkili kullanıcılara açılır.
- **Negatif varyant (opsiyonel):** Askıya alınmış profil (`profiles.is_suspended`) ile uygulama köküne yönlendirme.

---

## Tester notları

- Her test için **sonuç** sütunlu basit bir tablo (Geçti / Kaldı / Engellendi) ve ekran görüntüsü veya HAR isteği eklenebilir.
- Regresyon için önce **TC-01 → TC-06 → TC-07** çekirdek zinciri koşmak yeterlidir.
- Bilinen sınırlama: Asset “parent sürüm” oluşturma bu MVP arayüzünde ayrı bir akış olarak bulunmayabilir; sürüm alanı şema varsayılanıyla listelenir.
