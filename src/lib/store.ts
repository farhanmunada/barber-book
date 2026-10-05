import { db } from "@/db";
import {
  branches,
  users,
  services,
  bookings,
  haircutRecords,
  bookingServices,
  payrolls,
} from "@/db/schema";
import { eq, and, or, desc, sql, ilike, gte, lte } from "drizzle-orm";
import {
  BranchItem,
  BarberItem,
  ServiceItem,
  BookingRecord,
  HaircutBlueprint,
  UserAccount,
  PayrollRecord,
} from "./mock-data";

// 1. Cabang (Branches) - Direct from Neon Postgres
export async function getBranches(): Promise<BranchItem[]> {
  const rows = await db.select().from(branches).orderBy(branches.name);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address,
    phone: r.phone,
    openTime: r.openTime,
    closeTime: r.closeTime,
  }));
}

export async function getBranchById(id: string): Promise<BranchItem | undefined> {
  const rows = await db
    .select()
    .from(branches)
    .where(or(eq(branches.id, id), eq(branches.slug, id)))
    .limit(1);

  if (!rows[0]) return undefined;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address,
    phone: r.phone,
    openTime: r.openTime,
    closeTime: r.closeTime,
  };
}

// 2. Barber Staff - Direct from Neon Postgres (Role = 'staff')
export async function getBarbers(branchId?: string): Promise<BarberItem[]> {
  const condition = branchId
    ? and(eq(users.role, "staff"), eq(users.branchId, branchId))
    : eq(users.role, "staff");

  const rows = await db.select().from(users).where(condition);
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "-",
    branchId: u.branchId || "",
    avatarUrl:
      u.avatarUrl ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    specialty: "Professional Barberman",
    rating: 4.9,
  }));
}

// 3. Layanan (Services) - Direct from Neon Postgres
export async function getServices(): Promise<ServiceItem[]> {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.price);

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
    durationMinutes: s.durationMinutes,
    price: s.price,
  }));
}

// 4. Antrean & Booking (Bookings) - Direct from Neon Postgres
export async function getBookings(filters?: {
  branchId?: string;
  status?: string;
  date?: string;
}): Promise<BookingRecord[]> {
  const conditions = [];

  if (filters?.branchId) {
    conditions.push(eq(bookings.branchId, filters.branchId));
  }
  if (filters?.status) {
    conditions.push(eq(bookings.status, filters.status as any));
  }
  if (filters?.date) {
    conditions.push(eq(bookings.bookingDate, filters.date));
  }

  const query = db
    .select({
      booking: bookings,
      barberName: users.name,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.barberId, users.id))
    .orderBy(desc(bookings.createdAt));

  const rows = conditions.length > 0 ? await query.where(and(...conditions)) : await query;

  return rows.map(({ booking: b, barberName }) => ({
    id: b.id,
    branchId: b.branchId,
    barberId: b.barberId,
    barberName: barberName || "Barber",
    customerId: b.customerId || undefined,
    customerName: b.customerName,
    customerPhone: b.customerPhone || undefined,
    queueNumber: b.queueNumber,
    bookingType: b.bookingType,
    bookingDate: b.bookingDate,
    slotTime: b.slotTime || undefined,
    status: b.status,
    totalPrice: b.totalPrice,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod || undefined,
    services: ["Gentleman Grooming"],
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function createBooking(data: {
  branchId: string;
  barberId: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  bookingType: "online_slot" | "walk_in";
  bookingDate: string;
  slotTime?: string;
  serviceIds: string[];
}): Promise<BookingRecord> {
  const branch = await getBranchById(data.branchId);
  const barberRows = await db.select().from(users).where(eq(users.id, data.barberId)).limit(1);
  const barber = barberRows[0];

  // 1. Validasi slot online: Cegah duplikat booking dan waktu terlewat
  if (data.bookingType === "online_slot" && data.slotTime) {
    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.branchId, data.branchId),
          eq(bookings.barberId, data.barberId),
          eq(bookings.bookingDate, data.bookingDate),
          eq(bookings.slotTime, data.slotTime),
          sql`${bookings.status} != 'cancelled'`
        )
      );

    if (existing.length > 0) {
      throw new Error(`Slot jam ${data.slotTime} sudah dipesan di database oleh pelanggan lain.`);
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    if (data.bookingDate === todayStr) {
      const [sh, sm] = data.slotTime.split(":").map(Number);
      const slotMinutes = sh * 60 + sm;
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (slotMinutes <= currentMinutes) {
        throw new Error(`Slot jam ${data.slotTime} sudah terlewat untuk hari ini.`);
      }
    }
  }

  // 2. Hitung nomor antrean harian cabang di database
  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.branchId, data.branchId), eq(bookings.bookingDate, data.bookingDate)));

  const totalToday = Number(countRes[0]?.count || 0);
  const branchPrefix = (branch?.name || "B").charAt(0).toUpperCase();
  const queueSequence = String(totalToday + 1).padStart(2, "0");
  const queueNumber = `${branchPrefix}-${queueSequence}`;

  // 3. Hitung total tarif layanan
  let totalPrice = 85000;
  if (data.serviceIds.length > 0) {
    const srvRows = await db
      .select()
      .from(services)
      .where(or(...data.serviceIds.map((id) => eq(services.id, id))));
    if (srvRows.length > 0) {
      totalPrice = srvRows.reduce((sum, s) => sum + s.price, 0);
    }
  }

  // 4. Insert langsung ke Neon Postgres
  const inserted = await db
    .insert(bookings)
    .values({
      branchId: data.branchId,
      barberId: data.barberId,
      customerId: data.customerId || null,
      customerName: data.customerName,
      customerPhone: data.customerPhone || null,
      queueNumber,
      bookingType: data.bookingType,
      bookingDate: data.bookingDate,
      slotTime: data.slotTime || null,
      status: "waiting",
      totalPrice,
      paymentStatus: "unpaid",
    })
    .returning();

  const b = inserted[0];

  return {
    id: b.id,
    branchId: b.branchId,
    barberId: b.barberId,
    barberName: barber?.name || "Barber",
    customerId: b.customerId || undefined,
    customerName: b.customerName,
    customerPhone: b.customerPhone || undefined,
    queueNumber: b.queueNumber,
    bookingType: b.bookingType,
    bookingDate: b.bookingDate,
    slotTime: b.slotTime || undefined,
    status: b.status,
    totalPrice: b.totalPrice,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod || undefined,
    services: ["Layanan Terpilih"],
    createdAt: b.createdAt.toISOString(),
  };
}

export async function updateBookingStatus(
  id: string,
  status: "waiting" | "in_progress" | "completed" | "cancelled",
  paymentMethod?: "cash" | "qris"
): Promise<BookingRecord | null> {
  const updateData: any = { status };
  if (status === "completed") {
    updateData.paymentStatus = "paid";
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    updateData.completedAt = new Date();
  }
  if (status === "in_progress") {
    updateData.startedAt = new Date();
  }

  const updated = await db
    .update(bookings)
    .set(updateData)
    .where(eq(bookings.id, id))
    .returning();

  if (!updated[0]) return null;
  const b = updated[0];

  return {
    id: b.id,
    branchId: b.branchId,
    barberId: b.barberId,
    barberName: "Barber",
    customerId: b.customerId || undefined,
    customerName: b.customerName,
    customerPhone: b.customerPhone || undefined,
    queueNumber: b.queueNumber,
    bookingType: b.bookingType,
    bookingDate: b.bookingDate,
    slotTime: b.slotTime || undefined,
    status: b.status,
    totalPrice: b.totalPrice,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod || undefined,
    services: ["Layanan Terpilih"],
    createdAt: b.createdAt.toISOString(),
  };
}

// 5. Haircut Blueprint (Resep Potong) - Direct from Neon Postgres
export async function getHaircutRecipes(query?: string): Promise<HaircutBlueprint[]> {
  const rows = query
    ? await db
        .select({
          recipe: haircutRecords,
          barberName: users.name,
        })
        .from(haircutRecords)
        .leftJoin(users, eq(haircutRecords.barberId, users.id))
        .where(ilike(haircutRecords.customerName, `%${query.trim()}%`))
        .orderBy(desc(haircutRecords.createdAt))
    : await db
        .select({
          recipe: haircutRecords,
          barberName: users.name,
        })
        .from(haircutRecords)
        .leftJoin(users, eq(haircutRecords.barberId, users.id))
        .orderBy(desc(haircutRecords.createdAt));

  return rows.map(({ recipe: r, barberName }) => ({
    id: r.id,
    customerId: r.customerId || undefined,
    customerName: r.customerName,
    barberId: r.barberId,
    barberName: barberName || "Barber",
    bookingId: r.bookingId || undefined,
    sideTechnique: r.sideTechnique || "-",
    baselineGuard: r.baselineGuard || "-",
    topStyle: r.topStyle || "-",
    topTechnique: r.topTechnique || "-",
    neckline: r.neckline || "-",
    headQuirks: r.headQuirks || [],
    stylingProduct: r.stylingProduct || "-",
    notes: r.notes || undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function saveHaircutRecipe(data: {
  customerName: string;
  customerId?: string;
  barberId: string;
  barberName: string;
  sideTechnique: string;
  baselineGuard: string;
  topStyle: string;
  topTechnique: string;
  neckline: string;
  headQuirks: string[];
  stylingProduct: string;
  notes?: string;
}): Promise<HaircutBlueprint> {
  const inserted = await db
    .insert(haircutRecords)
    .values({
      customerName: data.customerName,
      customerId: data.customerId || null,
      barberId: data.barberId,
      sideTechnique: data.sideTechnique,
      baselineGuard: data.baselineGuard,
      topStyle: data.topStyle,
      topTechnique: data.topTechnique,
      neckline: data.neckline,
      headQuirks: data.headQuirks,
      stylingProduct: data.stylingProduct,
      notes: data.notes || null,
    })
    .returning();

  const r = inserted[0];
  return {
    id: r.id,
    customerName: r.customerName,
    customerId: r.customerId || undefined,
    barberId: r.barberId,
    barberName: data.barberName,
    sideTechnique: r.sideTechnique || "-",
    baselineGuard: r.baselineGuard || "-",
    topStyle: r.topStyle || "-",
    topTechnique: r.topTechnique || "-",
    neckline: r.neckline || "-",
    headQuirks: r.headQuirks || [],
    stylingProduct: r.stylingProduct || "-",
    notes: r.notes || undefined,
    createdAt: r.createdAt.toISOString(),
  };
}

// 6. Owner Analytics - Direct from Neon Postgres
export async function getOwnerAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const allBranches = await getBranches();
  const allBookings = await db.select().from(bookings);

  const branchSummaries = allBranches.map((branch) => {
    const bList = allBookings.filter((b) => b.branchId === branch.id);
    const todayList = bList.filter((b) => b.bookingDate === today);
    const completedList = bList.filter((b) => b.status === "completed");
    const revenue = completedList.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      branchId: branch.id,
      name: branch.name,
      slug: branch.slug,
      todayQueueCount: todayList.length,
      activeWaiting: todayList.filter((b) => b.status === "waiting").length,
      inProgress: todayList.filter((b) => b.status === "in_progress").length,
      totalCompleted: completedList.length,
      revenue,
    };
  });

  const totalRevenue = branchSummaries.reduce((sum, b) => sum + b.revenue, 0);
  const totalBookings = allBookings.length;

  return {
    today,
    totalRevenue,
    totalBookings,
    branchSummaries,
  };
}

// 7. Pengguna & Kredensial (Users) - Direct from Neon Postgres
export async function getUsers(): Promise<UserAccount[]> {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    branchId: u.branchId,
    phone: u.phone || undefined,
    bankName: u.bankName,
    bankAccountNumber: u.bankAccountNumber,
    bankAccountHolder: u.bankAccountHolder,
    baseSalaryWeekly: u.baseSalaryWeekly,
    commissionRate: u.commissionRate,
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function getUserById(id: string): Promise<UserAccount | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!rows[0]) return undefined;
  const u = rows[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    branchId: u.branchId,
    phone: u.phone || undefined,
    bankName: u.bankName,
    bankAccountNumber: u.bankAccountNumber,
    bankAccountHolder: u.bankAccountHolder,
    baseSalaryWeekly: u.baseSalaryWeekly,
    commissionRate: u.commissionRate,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function getUserByEmail(emailOrUsername: string): Promise<UserAccount | undefined> {
  const q = emailOrUsername.trim().toLowerCase();
  const rows = await db
    .select()
    .from(users)
    .where(or(eq(users.email, q), ilike(users.name, q)))
    .limit(1);

  if (!rows[0]) return undefined;
  const u = rows[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    branchId: u.branchId,
    phone: u.phone || undefined,
    bankName: u.bankName,
    bankAccountNumber: u.bankAccountNumber,
    bankAccountHolder: u.bankAccountHolder,
    baseSalaryWeekly: u.baseSalaryWeekly,
    commissionRate: u.commissionRate,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "staff" | "customer";
  branchId?: string | null;
  phone?: string;
}): Promise<UserAccount> {
  const inserted = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
      branchId: data.branchId || null,
      phone: data.phone || null,
    })
    .returning();

  const u = inserted[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    branchId: u.branchId,
    phone: u.phone || undefined,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  const deleted = await db.delete(users).where(eq(users.id, id)).returning();
  return deleted.length > 0;
}

// 8. Tambah Cabang - Direct from Neon Postgres
export async function createBranch(data: {
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}): Promise<BranchItem> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const inserted = await db
    .insert(branches)
    .values({
      name: data.name,
      slug,
      address: data.address,
      phone: data.phone,
      openTime: data.openTime || "09:00",
      closeTime: data.closeTime || "21:00",
    })
    .returning();

  const b = inserted[0];
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
    phone: b.phone,
    openTime: b.openTime,
    closeTime: b.closeTime,
  };
}

// 9. Tambah Layanan - Direct from Neon Postgres
export async function createService(data: {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}): Promise<ServiceItem> {
  const inserted = await db
    .insert(services)
    .values({
      name: data.name,
      description: data.description,
      durationMinutes: Number(data.durationMinutes) || 45,
      price: Number(data.price) || 50000,
    })
    .returning();

  const s = inserted[0];
  return {
    id: s.id,
    name: s.name,
    description: s.description || "",
    durationMinutes: s.durationMinutes,
    price: s.price,
  };
}

// 10. Penggajian Mingguan (Payroll System)
export function getCurrentWeekRange(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    periodStart: monday.toISOString().split("T")[0],
    periodEnd: sunday.toISOString().split("T")[0],
  };
}

export async function getWeeklyPayrolls(
  periodStart?: string,
  periodEnd?: string
): Promise<PayrollRecord[]> {
  const range = periodStart && periodEnd ? { periodStart, periodEnd } : getCurrentWeekRange();

  // 1. Ambil semua staf aktif
  const staffUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "staff"));

  const allBranches = await getBranches();

  // 2. Ambil payroll yang sudah tersimpan di database untuk rentang ini
  const existingPayrolls = await db
    .select()
    .from(payrolls)
    .where(
      and(
        eq(payrolls.periodStart, range.periodStart),
        eq(payrolls.periodEnd, range.periodEnd)
      )
    );

  // 3. Ambil data booking completed dalam periode tersebut untuk perhitungan komisi & bonus target
  const completedBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "completed"),
        gte(bookings.bookingDate, range.periodStart),
        lte(bookings.bookingDate, range.periodEnd)
      )
    );

  // 4. Hitung omzet per cabang minggu ini untuk bonus target 100jt
  const branchRevenueMap: Record<string, number> = {};
  for (const b of completedBookings) {
    branchRevenueMap[b.branchId] = (branchRevenueMap[b.branchId] || 0) + b.totalPrice;
  }

  // 5. Pastikan setiap staf memiliki baris payroll di DB
  const results: PayrollRecord[] = [];

  for (const staff of staffUsers) {
    const branch = allBranches.find((b) => b.id === staff.branchId);
    const branchName = branch?.name || "Cabang Barbershop";

    // Hitung transaksi barber ini
    const staffBookings = completedBookings.filter((b) => b.barberId === staff.id);
    const completedServicesCount = staffBookings.length;
    const staffServiceRevenue = staffBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const commissionRate = staff.commissionRate || 20;
    const serviceCommission = Math.round(staffServiceRevenue * (commissionRate / 100));

    // Bonus Target Cabang >= 100jt (Pool 2.5% dibagi staf aktif cabang)
    const branchRevenue = branchRevenueMap[staff.branchId || ""] || 0;
    let branchTargetBonus = 0;
    if (branchRevenue >= 100000000) {
      const activeStaffInBranch = staffUsers.filter((s) => s.branchId === staff.branchId).length || 1;
      const bonusPool = Math.round(branchRevenue * 0.025); // 2.5%
      branchTargetBonus = Math.round(bonusPool / activeStaffInBranch);
    }

    const baseSalary = staff.baseSalaryWeekly || 1337500;
    const calculatedTotal = baseSalary + serviceCommission + branchTargetBonus;

    const existing = existingPayrolls.find((p) => p.staffId === staff.id);

    if (existing) {
      // Jika status masih pending, sinkronkan nilai terkini dengan booking terbaru
      if (existing.status === "pending") {
        await db
          .update(payrolls)
          .set({
            baseSalary,
            completedServicesCount,
            serviceCommission,
            branchTargetBonus,
            totalPayout: calculatedTotal,
          })
          .where(eq(payrolls.id, existing.id));

        existing.baseSalary = baseSalary;
        existing.completedServicesCount = completedServicesCount;
        existing.serviceCommission = serviceCommission;
        existing.branchTargetBonus = branchTargetBonus;
        existing.totalPayout = calculatedTotal;
      }

      results.push({
        id: existing.id,
        staffId: staff.id,
        staffName: staff.name,
        staffEmail: staff.email,
        staffRole: staff.role,
        branchId: staff.branchId || "",
        branchName,
        bankName: staff.bankName || "BCA",
        bankAccountNumber: staff.bankAccountNumber || "Belum diisi",
        bankAccountHolder: staff.bankAccountHolder || staff.name,
        periodStart: existing.periodStart,
        periodEnd: existing.periodEnd,
        baseSalary: existing.baseSalary,
        completedServicesCount: existing.completedServicesCount,
        serviceCommission: existing.serviceCommission,
        branchTargetBonus: existing.branchTargetBonus,
        totalPayout: existing.totalPayout,
        status: existing.status as "pending" | "paid",
        paidAt: existing.paidAt ? existing.paidAt.toISOString() : null,
        paymentReference: existing.paymentReference,
        notes: existing.notes,
        createdAt: existing.createdAt.toISOString(),
      });
    } else {
      // Buat baru baris pending payroll
      const inserted = await db
        .insert(payrolls)
        .values({
          staffId: staff.id,
          branchId: staff.branchId || allBranches[0]?.id,
          periodStart: range.periodStart,
          periodEnd: range.periodEnd,
          baseSalary,
          completedServicesCount,
          serviceCommission,
          branchTargetBonus,
          totalPayout: calculatedTotal,
          status: "pending",
        })
        .returning();

      const p = inserted[0];
      results.push({
        id: p.id,
        staffId: staff.id,
        staffName: staff.name,
        staffEmail: staff.email,
        staffRole: staff.role,
        branchId: staff.branchId || "",
        branchName,
        bankName: staff.bankName || "BCA",
        bankAccountNumber: staff.bankAccountNumber || "Belum diisi",
        bankAccountHolder: staff.bankAccountHolder || staff.name,
        periodStart: p.periodStart,
        periodEnd: p.periodEnd,
        baseSalary: p.baseSalary,
        completedServicesCount: p.completedServicesCount,
        serviceCommission: p.serviceCommission,
        branchTargetBonus: p.branchTargetBonus,
        totalPayout: p.totalPayout,
        status: "pending",
        paidAt: null,
        paymentReference: null,
        notes: null,
        createdAt: p.createdAt.toISOString(),
      });
    }
  }

  return results;
}

export async function markPayrollPaid(
  payrollId: string,
  paymentReference?: string,
  notes?: string
): Promise<boolean> {
  const updated = await db
    .update(payrolls)
    .set({
      status: "paid",
      paidAt: new Date(),
      paymentReference: paymentReference || "Transfer Mandiri m-Banking",
      notes: notes || null,
    })
    .where(eq(payrolls.id, payrollId))
    .returning();

  return updated.length > 0;
}

export async function updateStaffPayrollSettings(
  userId: string,
  data: {
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    baseSalaryWeekly: number;
    commissionRate: number;
  }
): Promise<boolean> {
  const updated = await db
    .update(users)
    .set({
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      bankAccountHolder: data.bankAccountHolder,
      baseSalaryWeekly: data.baseSalaryWeekly,
      commissionRate: data.commissionRate,
    })
    .where(eq(users.id, userId))
    .returning();

  return updated.length > 0;
}
