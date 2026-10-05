import { pgTable, text, integer, boolean, timestamp, date, uuid } from "drizzle-orm/pg-core";

// 1. Barbershop Branches
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

// 2. Users & RBAC
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["owner", "admin", "staff", "customer"] }).notNull().default("customer"),
  branchId: uuid("branch_id").references(() => branches.id), // Staff/barber assigned branch
  avatarUrl: text("avatar_url"),
  // Bank account & payroll configuration
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountHolder: text("bank_account_holder"),
  baseSalaryWeekly: integer("base_salary_weekly").notNull().default(1337500), // Default DKI Jakarta weekly base
  commissionRate: integer("commission_rate").notNull().default(20), // Service commission percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Master Services & Pricing
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  price: integer("price").notNull(), // Price in IDR
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Barber Working Schedules & Shifts
export const barberSchedules = pgTable("barber_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: text("start_time").notNull().default("09:00"),
  endTime: text("end_time").notNull().default("21:00"),
  isOff: boolean("is_off").notNull().default(false),
});

// 5. Hybrid Queue & Bookings (Online Slot + Walk-in)
export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  customerId: uuid("customer_id").references(() => users.id), // Nullable for anonymous walk-in
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  queueNumber: text("queue_number").notNull(), // Daily queue format: "K-01", "B-03"
  bookingType: text("booking_type", { enum: ["online_slot", "walk_in"] }).notNull(),
  bookingDate: date("booking_date").notNull(), // "YYYY-MM-DD"
  slotTime: text("slot_time"), // e.g. "14:00" for online_slot, null for walk_in
  status: text("status", { enum: ["waiting", "in_progress", "completed", "cancelled"] }).notNull().default("waiting"),
  totalPrice: integer("total_price").notNull().default(0),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid"] }).notNull().default("unpaid"),
  paymentMethod: text("payment_method", { enum: ["cash", "qris"] }),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Booking Services Relation
export const bookingServices = pgTable("booking_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id).notNull(),
  serviceId: uuid("service_id").references(() => services.id).notNull(),
  priceAtBooking: integer("price_at_booking").notNull(),
});

// 7. Haircut Blueprint (Customer Anatomy Recipe)
export const haircutRecords = pgTable("haircut_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => users.id),
  customerName: text("customer_name").notNull(),
  barberId: uuid("barber_id").references(() => users.id).notNull(),
  bookingId: uuid("booking_id").references(() => bookings.id),
  
  // Anatomical Zones
  sideTechnique: text("side_technique"),
  baselineGuard: text("baseline_guard"),
  topStyle: text("top_style"),
  topTechnique: text("top_technique"),
  neckline: text("neckline"),
  headQuirks: text("head_quirks").array(),
  stylingProduct: text("styling_product"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Weekly Staff Payroll
export const payrolls = pgTable("payrolls", {
  id: uuid("id").defaultRandom().primaryKey(),
  staffId: uuid("staff_id").references(() => users.id).notNull(),
  branchId: uuid("branch_id").references(() => branches.id).notNull(),
  periodStart: date("period_start").notNull(), // Week start date (Monday) YYYY-MM-DD
  periodEnd: date("period_end").notNull(),     // Week end date (Sunday) YYYY-MM-DD
  baseSalary: integer("base_salary").notNull().default(0),
  completedServicesCount: integer("completed_services_count").notNull().default(0),
  serviceCommission: integer("service_commission").notNull().default(0),
  branchTargetBonus: integer("branch_target_bonus").notNull().default(0),
  totalPayout: integer("total_payout").notNull().default(0),
  status: text("status", { enum: ["pending", "paid"] }).notNull().default("pending"),
  paidAt: timestamp("paid_at"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
