# PRD: Barbershop Multi-Branch Booking & Digital Queue System

## 1. Ringkasan Eksekutif & Sasaran
Sistem manajemen operasional barbershop multi-cabang (1 pemilik, 3 cabang, min 2 barber per cabang) yang menggabungkan reservasi slot online dengan antrean digital walk-in secara harmonis (hybrid queue), disertai perekaman resep anatomi potong rambut per pelanggan dan analitik bisnis lintas-cabang.

---

## 2. Persona & Peran Pengguna (RBAC)

| Peran | Pengguna Riil | Tanggung Jawab & Fitur Utama |
|---|---|---|
| **Owner** | Pemilik Bisnis | Akses analitik performa 3 cabang: omzet harian/bulanan, rasio okupansi kursi, performa barber terlaris, retensi pelanggan. |
| **Admin** | Manajer Operasional | Manajemen master data: cabang, master layanan & tarif per cabang, penugasan barber & shift kerja. |
| **Staff / Barber / Kasir** | Staf Cabang | Papan antrean live cabang, input tamu walk-in (<10 detik), update status antrean (`waiting` -> `in-progress` -> `completed`), catat resep potong rambut pelanggan (tap-first). |
| **Customer** | Pelanggan Barbershop | Booking slot online, pilih barber & cabang, pantau live tracker posisi antrean, lihat riwayat resep potong rambut pribadi. |

---

## 3. Spesifikasi Fitur Utama

### 3.1. Hybrid Queue Engine (Online Slot + Walk-in)
- **Reservasi Slot Online**: Pelanggan memilih tanggal, cabang, barber, dan slot jam (misal 14:00 - 14:45).
- **Walk-in Fast Entry**: Tamu datang langsung dilayani kasir. Kasir cukup tap 1-2 layanan, pilih barber tersedia, klik "Generate Antrean".
- **Nomor Antrean Cerdas**:
  - `A-01`, `B-02` (Kode Cabang/Barber + Urutan Harian).
- **State Machine Antrean**:
  - `waiting` (Menunggu giliran)
  - `in_progress` (Sedang dipotong di kursi barber)
  - `completed` (Selesai dipotong & pembayaran dicatat)
  - `cancelled` / `no_show` (Batal atau tidak hadir)
- **Constraint Barber**: Satu barber hanya dapat memiliki 1 pelanggan dengan status `in_progress` pada satu waktu.

### 3.2. Modular Haircut Blueprint (Resep Gaya Potong)
- Input resep berbasis chip/tap tanpa ketik:
  - Sides & Back: `Skin Fade`, `Low Fade`, `Mid Fade`, `High Fade`, `Taper`, `Classic Scissor Cut`, `Undercut`.
  - Baseline Guard: `#0`, `#0.5`, `#1`, `#1.5`, `#2`, `#3`, `#4`.
  - Top Style: `French Crop`, `Two Block`, `Side Part`, `Quiff`, `Pompadour`, `Slick Back`, `Buzz Cut`, `Mullet`.
  - Top Technique: `Point Cut`, `Thinning`, `Blunt Cut`, `Razor`.
  - Neckline: `Tapered`, `Blocked`, `Rounded`.
  - Head Quirks: Multi-select `Double Crown`, `Flat Occipital`, `Cowlick`, `Scalp Scar`.
  - Styling Product: `Matte Clay`, `Pomade`, `Powder`, `Sea Salt`, `Beard Oil`, `None`.
  - Quick Feature: Tombol "Salin Resep Terakhir" (1-tap clone).

### 3.3. Multi-Branch Operations
- Mendukung 3 cabang dengan jam operasional, daftar barber, dan layanan masing-masing.
- Owner dapat berpindah view analitik antar cabang atau melihat agregat seluruh cabang.

### 3.4. Tap-First UI/UX Standard
- Desain visual: Industrial Modern Craft (Dark Charcoal `#121316`, Amber/Brass `#F59E0B`, Slate `#1A1D21`).
- Kontras tinggi dan ukuran target sentuh minimal 44x44px untuk kemudahan navigasi perangkat tablet/mobile kasir.
- 90% aksi diselesaikan tanpa keyboard virtual.

---

## 4. Batasan & Out of Scope (Fase 1)
- Pembayaran via integrasi payment gateway otomatis ditiadakan (dicatat kasir via cash/QRIS statis).
- Mobile native application (iOS/Android store) ditiadakan; menggunakan web responsive mobile-first / PWA.
- Notifikasi SMS/WhatsApp API berbayar ditiadakan; menggunakan layar status web live queue.

---

## 5. Kriteria Keberhasilan (Acceptance Criteria)
1. Pelanggan dapat menyelesaikan booking online dalam waktu < 45 detik.
2. Kasir dapat mendaftarkan pelanggan walk-in dalam waktu < 10 detik.
3. Barber dapat menyimpan resep potong rambut pelanggan dalam waktu < 15 detik hanya dengan tap chip.
4. Riwayat resep potong dapat dilihat kembali oleh barber saat pelanggan melakukan kunjungan berikutnya.
5. Owner dapat melihat ringkasan omzet dan jumlah antrean dari ketiga cabang dalam 1 layar.
