# ARCHITECTURE: Barbershop Multi-Branch Booking & Digital Queue System

## 1. Arsitektur Keseluruhan

Sistem dibangun sebagai aplikasi monolit Next.js fullstack (App Router) yang dihubungkan ke database serverless Neon Postgres menggunakan Drizzle ORM.

```
                    +------------------------------------+
                    |        Next.js App Router          |
                    | (React Server Components + Client) |
                    +------------------------------------+
                                      |
                       +--------------+--------------+
                       |                             |
                 [Server Actions]              [Route Handlers]
            (Mutations & Transactions)       (Realtime polling / API)
                       |                             |
                       +--------------+--------------+
                                      |
                               [Drizzle ORM]
                                      |
                           [Neon Serverless Postgres]
```

---

## 2. Skema Database Relasional (Drizzle ORM)

```typescript
// db/schema.ts

// 1. Cabang
export const branches = pgTable('branches', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  openTime: text('open_time').notNull().default('09:00'),
  closeTime: text('close_time').notNull().default('21:00'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. Pengguna & Akses (RBAC)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['owner', 'admin', 'staff', 'customer'] }).notNull().default('customer'),
  branchId: uuid('branch_id').references(() => branches.id), // Staff/barber terikat cabang
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. Layanan & Tarif
export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  price: integer('price').notNull(), // dalam rupiah
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. Jadwal & Shift Barber
export const barberSchedules = pgTable('barber_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  barberId: uuid('barber_id').references(() => users.id).notNull(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 (Minggu) - 6 (Sabtu)
  startTime: text('start_time').notNull(), // "09:00"
  endTime: text('end_time').notNull(),     // "21:00"
  isOff: boolean('is_off').notNull().default(false)
});

// 5. Antrean & Booking (Hybrid)
export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  branchId: uuid('branch_id').references(() => branches.id).notNull(),
  barberId: uuid('barber_id').references(() => users.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id), // Nullable jika walk-in anonim
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone'),
  queueNumber: text('queue_number').notNull(), // e.g. "A-01"
  bookingType: text('booking_type', { enum: ['online_slot', 'walk_in'] }).notNull(),
  bookingDate: date('booking_date').notNull(), // "YYYY-MM-DD"
  slotTime: text('slot_time'), // "14:00" jika online_slot, null jika walk_in
  status: text('status', { enum: ['waiting', 'in_progress', 'completed', 'cancelled'] }).notNull().default('waiting'),
  totalPrice: integer('total_price').notNull().default(0),
  paymentStatus: text('payment_status', { enum: ['unpaid', 'paid'] }).notNull().default('unpaid'),
  paymentMethod: text('payment_method', { enum: ['cash', 'qris'] }),
  notes: text('notes'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 6. Relasi Layanan Terpilih
export const bookingServices = pgTable('booking_services', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').references(() => bookings.id).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  priceAtBooking: integer('price_at_booking').notNull()
});

// 7. Resep Anatomi Potong Rambut (Barber Blueprint)
export const haircutRecords = pgTable('haircut_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => users.id),
  customerName: text('customer_name').notNull(), // Fallback nama walk-in
  barberId: uuid('barber_id').references(() => users.id).notNull(),
  bookingId: uuid('booking_id').references(() => bookings.id),
  // Parameter Terstruktur
  sideTechnique: text('side_technique'),       // 'low_fade', 'mid_fade', 'skin_fade', dll.
  baselineGuard: text('baseline_guard'),       // '#0.5', '#1', '#1.5', dll.
  topStyle: text('top_style'),                 // 'french_crop', 'side_part', dll.
  topTechnique: text('top_technique'),         // 'point_cut', 'thinning', dll.
  neckline: text('neckline'),                  // 'tapered', 'blocked', 'rounded'
  headQuirks: text('head_quirks').array(),     // ['double_crown', 'cowlick']
  stylingProduct: text('styling_product'),     // 'matte_clay', 'pomade', dll.
  notes: text('notes'),                        // Catatan mikro opsional
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

---

## 3. Struktur Direktori Proyek

```
src/
├── app/
│   ├── layout.tsx                     # Root layout dengan tema Dark Industrial
│   ├── page.tsx                       # Landing page & quick action booking
│   ├── (auth)/
│   │   ├── login/page.tsx             # Halaman login multi-role
│   │   └── register/page.tsx          # Registrasi pelanggan
│   ├── book/
│   │   └── page.tsx                   # Flow booking slot online tap-first
│   ├── queue/
│   │   └── page.tsx                   # Live tracker antrean pelanggan
│   ├── profile/
│   │   └── history/page.tsx           # Riwayat kunjungan & resep potong pribadi
│   ├── dashboard/
│   │   ├── layout.tsx                 # Dashboard navigation bar
│   │   ├── owner/page.tsx             # Analitik bisnis 3 cabang
│   │   ├── admin/page.tsx             # Kelola cabang, barber, & tarif layanan
│   │   └── branch/[branchId]/
│   │       ├── queue/page.tsx         # Live queue board & walk-in entry POS
│   │       └── recipe/page.tsx        # Input & pencarian resep potong pelanggan
│   └── api/
│       ├── auth/                      # Session & Auth handler
│       └── queue/live/route.ts        # Polling status antrean real-time
├── db/
│   ├── index.ts                       # Neon connection instance via Drizzle
│   ├── schema.ts                      # Definisi skema tabel di atas
│   └── seed.ts                        # Data awal: 3 cabang, barber, layanan default
├── lib/
│   ├── auth.ts                        # Password hashing (bcryptjs/webcrypto) & JWT session
│   ├── queue-engine.ts                # Logika nomor antrean & validasi slot
│   └── constants.ts                   # Master pilihan anatomi potong rambut
└── components/
    ├── booking/                       # Komponen tap-first booking
    │   ├── branch-selector.tsx
    │   ├── service-pill-picker.tsx
    │   ├── barber-card-picker.tsx
    │   └── slot-grid-picker.tsx
    ├── queue/                         # Papan antrean & walk-in form
    │   ├── live-queue-board.tsx
    │   └── walk-in-fast-entry.tsx
    ├── recipe/                        # Resep potong modular
    │   ├── haircut-blueprint-editor.tsx
    │   └── haircut-recipe-card.tsx
    └── ui/                            # Atoms (Button, Badge, Modal, Card)
```

---

## 4. Mekanisme State Antrean & Validasi Bentrok

1. **Aturan Hybrid**:
   - Jika jam saat ini `14:00`, slot online yang direservasi pada `14:00` diprioritaskan.
   - Walk-in yang datang disisipkan dengan urutan `waiting`. Jika barber sedang memegang pelanggan (`in_progress`), walk-in menunggu sampai status barber berubah menjadi `completed`.
2. **Nomor Antrean**:
   - Prefix format: `[Inisial Cabang]-[Urutan Harian]` (Contoh: `K-01`, `K-02` untuk Kemang).
3. **Penyimpanan Resep**:
   - Setelah tiket antrean di-mark `completed`, popup modal resep potong otomatis muncul untuk barber mengonfirmasi gaya yang baru saja dipotong (default terisi dari kunjungan sebelumnya).
