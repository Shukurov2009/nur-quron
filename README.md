# Nur — Qur’on va namoz yo‘ldoshi

**Jonli sayt:** [https://nur-quron.vercel.app](https://nur-quron.vercel.app)

O‘zbekistonlik foydalanuvchilar uchun zamonaviy Qur’on, yodlash, alifbo va namoz ilovasi. To‘liq 114 sura, oyatma-oyat tarjima, Mishary Rashid Alafasy qiroati, zanjir usulida yodlash, arab alifbosi, joylashuvga mos namoz vaqtlari va namozni o‘rganish bo‘limlari bir joyda.

Ilova **Vite + React + TypeScript** asosida yozilgan, **PWA** sifatida telefonga o‘rnatiladi va **Vercel**ga osongina joylashtiriladi.

---

## Imkoniyatlar

- **Qur’on** — 114 sura, 6 236 oyat, Usmoniy arabcha matn, o‘zbekcha tarjima (lotin va kirill).
- **Audio** — har bir oyat uchun Mishary Rashid Alafasy qiroati; pleyer, tezlik, avtomatik ergashish va oyatni yoritish.
- **Yodlash zanjiri** — `1, 2, 1·2, 3, 1·2·3, 4, 1·2·3·4` usulida, takrorlar va pauza sozlanadi. Bir sessiyada 20 oyatgacha.
- **Arab alifbosi** — 28 harf, to‘rt shakl, harakatlar, birinchi so‘zlar, talaffuz (Web Speech), o‘yin-mashq va barmoq bilan yozish maydoni.
- **Namoz vaqtlari** — GPS yoki shahar tanlash, Aladhan hisoblash usullari, Hanafiy/standart asr, qibla yo‘nalishi, oylik jadval, keyingi namozga teskari hisob.
- **Eslatmalar** — azon ovozi, jim bildirishnoma yoki o‘chirilgan rejim. Azon ilovaga biriktirilgan (`public/audio/azan.mp3`).
- **Namozni o‘rganish** — tahorat va namoz qadam-baqadam, namoz harakatlari rasmlari, duolar (arabcha + talaffuz + tarjima), besh vaqt rakatlari va o‘rganish progressi.
- **Sozlamalar** — tungi/yorug‘/tizim mavzusi, lotin/kirill, audio tezligi, azon balandligi, joylashuv, hisoblash usuli.
- **Saqlash** — sozlamalar, yodlangan oyatlar, xatcho‘plar va oxirgi o‘qilgan joy `localStorage`da. Supabase ulansa, akkaunt orqali bulutda sinxronlanadi.
- **PWA** — oflayn qobiq va ma’lumotlar, bosh ekranga o‘rnatish, yangilanishlarni avtomatik olish. iOS uchun alohida meta teglar, Android’da tezkor yorliqlar (Qur’on, Yodlash, Namoz) va notch/xavfsiz hudud (safe-area) qo‘llab-quvvatlanadi.

---

## Texnologiyalar

| Qism | Texnologiya |
| --- | --- |
| UI | React 18, TypeScript, React Router 7 |
| Build | Vite 6 |
| Ikonkalar | lucide-react |
| PWA | vite-plugin-pwa / Workbox |
| Bulut | Supabase (ixtiyoriy) |
| Namoz vaqtlari | Aladhan API |
| Qur’on matni | alquran.cloud (Tanzil Usmoniy) |
| Tarjima | QuranEnc — `uzbek_sadiq` |
| Qiroat | cdn.islamic.network — Mishary Rashid Alafasy |

---

## Tez boshlash

Talab: **Node.js 20+** va npm.

```bash
npm install
npm run dev
```

Ilova `http://localhost:5173` da ochiladi.

### Skriptlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | TypeScript tekshiruvi + production build (`dist/`) |
| `npm run preview` | Buildni lokal tekshirish (`http://localhost:4173`) |
| `npm run data` | Qur’on ma’lumotlarini qayta yuklab, `public/data`ni yangilash |
| `npm run icons` | PWA ikonkalarini qayta yaratish |

> **Windows haqida muhim eslatma.** Ba’zi korporativ kompyuterlarda Windows Application Control `@rollup/rollup-win32-x64-msvc` native faylini bloklaydi. Shu sababli loyiha Rollup’ning WASM variantidan foydalanadi (`package.json` dagi `overrides` va `devDependencies`). Bu qatorlarni o‘chirmang — aks holda build `ERR_DLOPEN_FAILED` bilan to‘xtashi mumkin.

---

## Loyiha tuzilishi

```text
nur-quron/
├─ public/
│  ├─ audio/azan.mp3          # Ilovaga biriktirilgan azon
│  ├─ data/
│  │  ├─ index.json           # 114 sura metama’lumoti
│  │  ├─ daily.json           # “Bugungi oyat” tanlovi
│  │  ├─ meta.json            # Ma’lumot manbalari va statistika
│  │  └─ surah/1…114.json     # Har bir sura: matn, tarjima, audio havolalari
│  ├─ icons/                  # PWA ikonkalari
│  └─ favicon.svg
├─ scripts/
│  ├─ build-data.mjs          # API’lardan ma’lumot yig‘ish
│  ├─ build-icons.mjs         # Ikonka generatori
│  └─ translit.mjs            # Lotin → kirill transliteratsiyasi
├─ src/
│  ├─ components/             # Layout, AudioDock, AyahCard, NextPrayerCard…
│  ├─ context/                # Auth, Settings, Player, Prayer
│  ├─ data/                   # Alifbo, shaharlar, namoz qo‘llanmasi
│  ├─ lib/                    # Qur’on loader, prayer, storage, notifications…
│  ├─ pages/                  # Home, Surahs, Reader, Memorize, Alphabet…
│  ├─ styles/                 # Dizayn tizimi va sahifa uslublari
│  ├─ App.tsx                 # Marshrutlar
│  └─ main.tsx                # Providerlar va PWA ro‘yxatdan o‘tkazish
├─ vercel.json
└─ vite.config.ts
```

### Marshrutlar

| Manzil | Sahifa |
| --- | --- |
| `/` | Bosh sahifa |
| `/quron` | Suralar ro‘yxati |
| `/quron/:surah` | O‘qish sahifasi |
| `/yodlash` | Yodlash zanjiri |
| `/alifbo` | Arab alifbosi |
| `/namoz` | Namoz vaqtlari |
| `/namozni-organish` | Tahorat va namoz qo‘llanmasi |
| `/sozlamalar` | Sozlamalar va akkaunt |

---

## Ma’lumotlar

Barcha sura fayllari `public/data/surah/` ichida oldindan yig‘ilgan. Ilova ishga tushganda ular mahalliy serverdan yuklanadi; service worker ularni keshlaydi. Audio esa birinchi tinglashda CDN’dan olinadi va keyin keshda saqlanadi.

Ma’lumotlarni yangilash:

```bash
npm run data
```

Skript `.cache/` ichida oraliq javoblarni saqlaydi. Tarmoq xatosi bo‘lsa, keshdan foydalanadi.

### Manbalar

- Qur’on matni: [alquran.cloud](https://alquran.cloud) — `quran-uthmani` (Tanzil Usmoniy).
- Tarjima: [QuranEnc](https://quranenc.com) — Muhammad Sodiq Muhammad Yusuf, `uzbek_sadiq`.
- Qiroat: [cdn.islamic.network](https://cdn.islamic.network) — Mishary Rashid Alafasy, 128 kbps (64 kbps zaxira).
- Namoz vaqtlari: [Aladhan API](https://aladhan.com/prayer-times-api).
- Shriftlar: Google Fonts — Manrope, Cormorant Garamond, Amiri Quran, Noto Naskh Arabic.

> Ishlab chiqarish (production) uchun matn, tarjima va audio litsenziyalarini o‘zingiz tekshiring. Azon ovozi namuna sifatida biriktirilgan; tijoriy foydalanishdan oldin huquq egasidan ruxsat oling yoki o‘z audiongiz bilan almashtiring.

---

## Supabase: akkaunt va sinxronlash (ixtiyoriy)

Ilova Supabase’siz ham to‘liq ishlaydi. Akkaunt, qurilmalar orasida sinxronlash va bulut zaxirasi uchun quyidagilarni bajaring.

### 1. Loyiha yaratish

[supabase.com](https://supabase.com) da yangi loyiha oching.

### 2. Jadval va ruxsatlar

Supabase **SQL Editor**da quyidagini ishga tushiring:

```sql
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

create policy "Foydalanuvchi o'z holatini o'qiydi"
  on public.user_state for select
  using (auth.uid() = user_id);

create policy "Foydalanuvchi o'z holatini yaratadi"
  on public.user_state for insert
  with check (auth.uid() = user_id);

create policy "Foydalanuvchi o'z holatini yangilaydi"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Ilova `user_state` jadvaliga `upsert` qiladi, shuning uchun `insert` va `update` siyosatlari ikkalasi ham kerak.

### 3. Auth sozlamalari

- **Authentication → Providers → Email** yoqilgan bo‘lsin.
- Sinov uchun **Confirm email**ni o‘chirish mumkin; haqiqiy foydalanishda yoqib qo‘ying.
- **Authentication → URL Configuration**da saytingiz manzilini qo‘shing:
  - `Site URL`: `https://sizning-saytingiz.vercel.app`
  - `Redirect URLs`: shu manzil va `http://localhost:5173`

### 4. Kalitlarni ulash

Loyiha ildizida `.env.local` yarating:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Kalitlarni **Project Settings → API** bo‘limidan oling. `service_role` kalitini hech qachon frontendga qo‘ymang.

Dev serverni qayta ishga tushiring. Sozlamalar sahifasida akkaunt formasi paydo bo‘ladi.

### Qanday sinxronlanadi?

- Kirgandan so‘ng ilova bulutdagi `data`ni oladi va mahalliy sozlamalar bilan birlashtiradi.
- Yodlashda har bir sura uchun eng yangi `updatedAt` g‘olib bo‘ladi.
- Xatcho‘plar birlashtiriladi, oxirgi o‘qilgan joy eng yangisi bilan almashtiriladi.
- O‘zgarishlar 1,2 soniyalik debounce bilan bulutga yuboriladi.
- Jadval yo‘q bo‘lsa, sozlamalar sahifasida tushunarli xato ko‘rsatiladi.

---

## Vercel’ga joylashtirish

### 1-usul: GitHub orqali

1. Loyihani GitHub’ga yuklang.
2. [vercel.com/new](https://vercel.com/new) da repozitoriyani tanlang.
3. Sozlamalar odatda avtomatik aniqlanadi:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment Variables** bo‘limiga Supabase kalitlarini qo‘shing (agar kerak bo‘lsa).
5. **Deploy** ni bosing.

`vercel.json` SPA yo‘naltirishini sozlaydi: barcha marshrutlar `index.html`ga qaytadi, shuning uchun `/quron/1` kabi manzillar yangilanganda ham 404 bermaydi.

### 2-usul: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Hozirgi production loyiha: `shukurov2009s-projects/nur-quron` → [nur-quron.vercel.app](https://nur-quron.vercel.app).

> **Muhim:** Vercel’dagi npm `rollup` uchun `overrides` bilan to‘g‘ridan-to‘g‘ri dependency birga bo‘lsa, `EOVERRIDE` xatosi beradi. Shuning uchun `rollup` faqat `overrides`da turadi, `devDependencies`da takrorlanmaydi.

### Deploydan keyin

- Supabase **Site URL** va **Redirect URLs**ni yangi domen bilan yangilang.
- HTTPS ishlatilishiga ishonch hosil qiling — GPS va service worker uchun zarur.
- Birinchi ochilishda barcha ma’lumotlar keshlanadi; keyingi tashriflar tezroq bo‘ladi.

---

## PWA: telefonga o‘rnatish

Production build HTTPS orqali ochilganda brauzer o‘rnatishni taklif qiladi.

- **Android / Chrome:** menyu → **Ilovani o‘rnatish** yoki **Bosh ekranga qo‘shish**.
- **iPhone / Safari:** **Ulashish** → **Bosh ekranga qo‘shish**.
- **Kompyuter / Chrome, Edge:** manzil qatori yonidagi o‘rnatish belgisi.

O‘rnatilgandan so‘ng ilova alohida oynada ochiladi va oflayn rejimda asosiy bo‘limlarni ko‘rsatadi.

---

## Bildirishnomalar va azon

Sozlamalarda uch rejim bor:

| Rejim | Natija |
| --- | --- |
| **Azon** | Namoz vaqtida azon ovozi qo‘yiladi va bildirishnoma chiqadi |
| **Jim** | Faqat ovozsiz bildirishnoma |
| **O‘chiq** | Eslatma yuborilmaydi |

Muhim cheklovlar:

- Brauzer bildirishnomalari **ilova yoki sahifa ochiq turganda** ishlaydi. Yopilgan ilovaga push yuborish uchun alohida push server (masalan, Supabase Edge Functions + Web Push) kerak — bu versiyada mavjud emas.
- Brauzerlar audio avtomatik ijro etishni bloklaydi. Ilova birinchi bosishda audio ruxsatini “ochadi”; shundan keyingi eslatmalar ijro etiladi. Sinov tugmasi ham foydalanuvchi bosishini talab qiladi.
- iOS’da PWA bildirishnomalari cheklangan; Safari sozlamalarida ruxsat berilishi kerak.
- Ruxsat rad etilgan bo‘lsa, brauzer sozlamalaridan qo‘lda yoqish kerak.

---

## Namoz vaqtlari haqida

- Standart hisoblash usuli: **Muslim World League (MWL, method 3)**.
- Asr: **Hanafiy** (school 1). Sozlamalarda standart (Shofeiy)ga o‘zgartirish mumkin.
- Shahar ro‘yxati `src/data/cities.ts` da; GPS ham ishlaydi.
- Vaqtlar tanlangan shaharning vaqt zonasida ko‘rsatiladi, qurilma vaqt zonasidan qat’i nazar.
- Oylik jadval Aladhan’dan yuklanadi.
- Qibla shimolga nisbatan hisoblangan; aniq yo‘nalish uchun telefon kompasi va mahalliy belgilarga tayaning.
- Mahalliy masjid taqvimi bilan bir necha daqiqa farq bo‘lishi mumkin. Rasmiy vaqt sifatida mahalliy masjid taqvimini oling.

---

## Ma’lumotlarni saqlash va tozalash

`localStorage` kalitlari:

- `nur-settings-v1` — sozlamalar, xatcho‘plar, yodlash, oxirgi o‘qilgan joy.
- `nur-prayer:*` — namoz vaqtlari keshi (6 soat).
- `nur-learn-progress` — tahorat/namoz qo‘llanmasi progressi.

**Sozlamalar → Ma’lumotlarni tozalash** barcha mahalliy progressni o‘chiradi. Supabase’dagi nusxa saqlanib qoladi; akkauntga qayta kirganingizda bulutdan tiklanadi.

---

## Muammolarni bartaraf etish

| Muammo | Yechim |
| --- | --- |
| Build `ERR_DLOPEN_FAILED` | `package.json` dagi Rollup WASM aliasini saqlang; `rm -rf node_modules package-lock.json` qilib qayta `npm install` qiling |
| `/quron/1` ni yangilaganda 404 | `vercel.json` rewrites ishlatilishini tekshiring |
| Namoz vaqtlari yuklanmaydi | Internetni, shahar koordinatalarini va Aladhan’ga kirishni tekshiring |
| Supabase’da `user_state jadvali yaratilmagan` | Yuqoridagi SQL’ni ishga tushiring |
| Bildirishnoma chiqmaydi | Brauzer ruxsatini va rejimni tekshiring; sahifa ochiq turishi kerak |
| Azon eshitilmaydi | Sahifaga bir marta bosing, qurilma ovozini yoqing, sinov tugmasini ishlating |
| Audio ijro etilmaydi | CDN’ga kirishni tekshiring; birinchi tinglash internet talab qiladi |
| GPS ishlamaydi | HTTPS (yoki localhost) va joylashuv ruxsatini tekshiring |

---

## Litsenziya va minnatdorchilik

Loyiha kodi o‘quv maqsadida yaratilgan. Qur’on matni, tarjima, qiroat va azon audiosi tegishli manbalar va huquq egalariga tegishli. Ishlatishdan oldin ularning litsenziya shartlarini tekshiring.

**Manbalar:** Tanzil / alquran.cloud, QuranEnc, Islamic Network CDN, Aladhan, Google Fonts.
