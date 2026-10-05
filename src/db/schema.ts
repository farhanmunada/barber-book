import { pgTable, text, integer, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";

// 1. Cabang Barbershop
export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  openTime: text("open_time").notNull().default("09:00"),
  closeTime: text("close_time").notNull().default("21:00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Pengguna & Hak Akses (RBAC)
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "admin", "staff", "customer"] }).notNull().default("customer"),
  branchId: uuid("branch_id").references(() => branches.id), // Staff/barber terikat ke 1 cabang
  avatarUrl: text("avatar_url"),
  // Info Penggajian & Rekening Bank
  bankName: text("bank_name"), // BCA, Mandiri, BRI, BNI, dll.
  bankAccountNumber: text("bank_account_number"),
  bankAccountHolder: text("bank_account_holder"),
  baseSalaryWeekly: integer("base_salary_weekly").notNull().default(1337500), // Default DKI Jakarta (~Rp 5.35jt/bln : 4)
  commissionRate: integer("commission_rate").notNull().default(20), // Persentase komisi service (20%)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Master Layanan & Tarif
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  price: integer("price").notNull(), // dalam rupiah
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Jadwal Kerja / Shift Barber
export const barberSchedules = pgTable("barber_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("21:00"),
  isOff: boolean("is_off").notNull().default(false),
});

// 5. Antrean & Booking (Hybrid: Online Slot + Walk-in)
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  customerId: uuid("customer_id").references(() => users.id), // Nullable jika walk-in anonim
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  queueNumber: text("queue_number").notNull(), // Format: "K-01", "B-03"
  bookingType: text("booking_type", { enum: ["online_slot", "walk_in"] }).notNull(),
  bookingDate: date("booking_date").notNull(), // "YYYY-MM-DD"
  slotTime: text("slot_time"), // "14:00" jika online_slot, null jika walk_in
  status: text("status", { enum: ["waiting", "in_progress", "completed", "cancelled"] }).notNull().default("waiting"),
  totalPrice: integer("total_price").notNull().default(0),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid"] }).notNull().default("unpaid"),
  paymentMethod: text("payment_method", { enum: ["cash", "qris"] }),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Relasi Layanan Terpilih pada Booking
export const bookingServices = pgTable("booking_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  priceAtBooking: integer("price_at_booking").notNull(),
});

// 7. Resep Anatomi Potong Rambut (Barber Blueprint)
export const haircutRecords = pgTable("haircut_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  
  // Zona Anatomi
  sideTechnique: text("side_technique"),       // 'Skin Fade', 'Low Fade', 'Mid Fade', 'Taper', dll.
  baselineGuard: text("baseline_guard"),       // '#0.5', '#1', '#1.5', '#2', dll.
  topStyle: text("top_style"),                 // 'French Crop', 'Two Block', 'Side Part', dll.
  topTechnique: text("top_technique"),         // 'Point Cut', 'Thinning', dll.
  neckline: text("neckline"),                  // 'Tapered', 'Blocked', 'Rounded'
  headQuirks: text("head_quirks").array(),     // ['Double Crown', 'Flat Occipital', 'Cowlick', 'Scalp Scar']
  stylingProduct: text("styling_product"),     // 'Matte Clay', 'Pomade', 'Powder', dll.
  notes: text("notes"),                        // Catatan mikro opsional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Penggajian Mingguan Karyawan (Weekly Payroll)
export const payrolls = pgTable("payrolls", {
  id: uuid("id").defaultRandom().primaryKey(),
  staffId: uuid("staff_id").references(() => users.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  periodStart: date("period_start").notNull(), // Awal minggu (Senin) YYYY-MM-DD
  periodEnd: date("period_end").notNull(),     // Akhir minggu (Minggu) YYYY-MM-DD
  baseSalary: integer("base_salary").notNull().default(0), // Gaji pokok mingguan
  completedServicesCount: integer("completed_services_count").notNull().default(0),
  serviceCommission: integer("service_commission").notNull().default(0), // 20% total service
  branchTargetBonus: integer("branch_target_bonus").notNull().default(0), // Bonus target omzet cabang >= 100jt
  totalPayout: integer("total_payout").notNull().default(0), // Total gapok + komisi + bonus
  status: text("status", { enum: ["pending", "paid"] }).notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  paymentReference: text("payment_reference"), // Catatan transfer / no referensi bank
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
