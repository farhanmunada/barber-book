# RESEARCH: Barbershop Multi-Branch Booking & Digital Queue System

## 1. Domain Problem & Analisis Barbershop Riil

### Masalah Utama Operasional Barbershop
1. **Antrean Fisik Liar (Dead Time)**: Pelanggan walk-in menunggu 1–2 jam tanpa estimasi pasti. Banyak yang pergi (lost revenue).
2. **Tabrakan Antrean Hybrid**: Pelanggan online booking slot 15:00 datang, namun kursi sedang dipakai walk-in yang masuk 14:45. Perlu mekanisme lock kursi & estimasi dinamis.
3. **Loss of Customer Haircut Identity**: Pelanggan gonta-ganti barber dalam 1 barbershop atau antar-cabang, harus mengulang instruksi potong dari nol ("samping tipisin dikit, atas jangan kependekan"). Barber sering salah interpretasi.
4. **Kecepatan Input Kasir/Barber**: Saat jam ramai, barber/kasir tangan kotor/sibuk. Formulir berbasis input teks tradisional lambat dan diabaikan staf.

### Dekonstruksi Anatomi Potong Rambut Profesional (Barber Blueprint)
Potong rambut pria teknis terdiri dari 5 zona modular:
1. **Sides & Back (Gradasi Samping)**:
   - Skin Fade (0mm / foil shaver)
   - Low Fade, Mid Fade, High Fade, Drop Fade
   - Taper Fade (hanya pelipis dan tengkuk)
   - Classic Scissor Cut (full gunting tanpa mesin)
   - Undercut
2. **Clipper Guard (Baseline Step)**:
   - `#0` (0mm/Foil), `#0.5` (1.5mm), `#1` (3mm), `#1.5` (4.5mm), `#2` (6mm), `#3` (10mm), `#4` (13mm)
3. **Top Hair (Siluet Atas)**:
   - French Crop, Two Block, Classic Side Part, Textured Quiff, Pompadour, Slick Back, Buzz Cut, Mullet / Modern Shag
4. **Top Finishing (Tekstur Gunting)**:
   - Point Cut (tekstur acak)
   - Thinning (penipisan volume)
   - Blunt Cut (potong rata padat)
   - Razor Cut (ujung tajam)
5. **Neckline / Nape (Garis Tengkuk)**:
   - Tapered (pudar alami), Blocked (kotak tegas), Rounded (melengkung)
6. **Karakteristik & Anomali Kepala (Head Quirks)**:
   - Double Crown (dua pusaran rambut), Cowlick (pusaran depan membandel), Flat Occipital (tulang belakang datar, butuh volume), Scalp Scar (bekas luka sensitif)
7. **Finishing Product**:
   - Matte Clay, Water-based Pomade, Styling Powder, Sea Salt Spray, Beard Oil, Natural / No Product

---

## 2. Riset UI/UX: Tap-First & Anti-AI Slop

### Arah Visual: Industrial Modern Craft
- Menghindari template pastel / ungu gradien generik AI.
- Nuansa maskulin, taktil, utilitarian, kontras tinggi yang jelas terbaca di bawah lampu sorot cermin barbershop.
- Palet Warna:
  - Dark Charcoal (`#121316`) sebagai background dominan.
  - Card Slate (`#1A1D21`) dengan border kontras (`#2D3139`).
  - Warm Amber / Brass (`#F59E0B`) sebagai aksen status dan tombol utama.
  - Emerald Green (`#10B981`) untuk status in-progress/selesai.
  - Crimson Red (`#EF4444`) untuk pembatalan/alert.
- Tipografi:
  - Headings: `Oswald` / `Syne` (industrial, tegas).
  - Body & Data: `Inter` / `Plus Jakarta Sans` (keterbacaan tinggi angka dan status).

### Prinsip Zero-Typing / Tap-First UX
1. **Booking Pelanggan**:
   - Pemilihan cabang: Card carousel 1 ketukan.
   - Layanan: Multi-select pill chips langsung tampak harga & durasi.
   - Barber: Avatar selection chip (foto, rating, shift).
   - Kalender: Horizontal 7-day strip + grid jam (otomatis disable slot bentrok).
2. **Walk-in Fast Entry Kasir (< 10 detik)**:
   - 1-tap chip paket layanan terpopuler.
   - Numpad digital atau 1 input nama pendek (telepon opsional).
   - Tombol "Cetak / Buat Tiket" langsung assign nomor antrean berikutnya (misal `B-03`).
3. **Pencatatan Resep Potong (Barber Log)**:
   - 1-Tap "Copy Last Recipe" jika pelanggan pernah datang sebelumnya.
   - Horizontal pill selector per zona anatomi potong rambut.
   - Chip tag anomali kepala (`[Double Crown]`, `[Bekas Luka]`).

---

## 3. Riset Teknologi & Stack

### Frontend & Backend: Next.js (App Router + Server Actions)
- Monolit tunggal: Routing, rendering (SSR/RSC), dan API/Server Actions dalam satu codebase.
- Menghindari kompleksitas REST API boilerplate terpisah.
- Fast interactive UI dengan React Server Components dan client-side state minimal.

### Database: Neon Serverless Postgres
- Postgres serverless dengan connection pooling via `@neondatabase/serverless` / standard pooling URL.
- Skalabilitas instan, latency rendah, cocok untuk operasi barbershop multi-cabang.

### ORM: Drizzle ORM
- Type-safe query builder dengan overhead runtime nol.
- Skema terpusat di TypeScript, migrasi cepat via `drizzle-kit`.
- Native support Neon pooling.

### Autentikasi: Jose / Iron-Session / Custom Cookie JWT Session
- Sederhana, aman, tanpa dependensi eksternal berat.
- Role-based authorization: `owner`, `admin`, `staff` (barber/kasir), `customer`.
