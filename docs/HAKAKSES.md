Perubahan arsitektur & hak akses:

1. Owner (owner@barber.com / owner123): Mode pantau omzet & antrean 3 cabang (view-only). Tombol kelola POS/data cabang cabut.
2. Admin (admin@barber.com / admin123): Kelola seluruh elemen bisnis di /dashboard/admin (buka cabang baru, master layanan & tarif, CRUD akun & password staf).
3. Kasir (kasir.kemang@barber.com / kasir123): Otomatis redirect ke papan antrean POS cabang terikat.
4. Customer (budi@gmail.com / budi123 atau daftar baru di /register): Akses form booking /book & resep potong rambut.
5. Autentikasi kredensial: Bypass 1-klik buang. Wajib input username/email + password terenkripsi bcrypt.
