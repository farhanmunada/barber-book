import { db } from "@/db";
import { bookings, users, services } from "@/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { BookingRecord } from "@/lib/types";
import { getBranchById } from "./branches";

export async function getBookings(filter?: string | { branchId?: string }): Promise<BookingRecord[]> {
  const branchId = typeof filter === "object" ? filter?.branchId : filter;

  const query = db
    .select({
      booking: bookings,
      barberName: users.name,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.barberId, users.id))
    .orderBy(desc(bookings.createdAt));

  const rows = branchId
    ? await query.where(eq(bookings.branchId, branchId))
    : await query;

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
    services: ["Potong & Styling Premium"],
    createdAt: b.createdAt.toISOString(),
  }));
}

export async function getBookingById(id: string): Promise<BookingRecord | undefined> {
  const rows = await db
    .select({
      booking: bookings,
      barberName: users.name,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.barberId, users.id))
    .where(eq(bookings.id, id))
    .limit(1);

  if (!rows[0]) return undefined;
  const { booking: b, barberName } = rows[0];

  return {
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
    services: ["Potong & Styling Premium"],
    createdAt: b.createdAt.toISOString(),
  };
}

export async function createBooking(data: {
  branchId: string;
  barberId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  bookingType: "online_slot" | "walk_in";
  bookingDate: string;
  slotTime?: string;
  serviceIds: string[];
}): Promise<BookingRecord> {
  const branch = await getBranchById(data.branchId);
  const barberRows = await db.select().from(users).where(eq(users.id, data.barberId)).limit(1);
  const barber = barberRows[0];

  // 1. Online slot validation: prevent duplicates and past time slots
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

  // 2. Calculate daily queue sequence for branch
  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(and(eq(bookings.branchId, data.branchId), eq(bookings.bookingDate, data.bookingDate)));

  const totalToday = Number(countRes[0]?.count || 0);
  const branchPrefix = (branch?.name || "B").charAt(0).toUpperCase();
  const queueSequence = String(totalToday + 1).padStart(2, "0");
  const queueNumber = `${branchPrefix}-${queueSequence}`;

  // 3. Calculate total service price
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

  // 4. Insert booking record into database
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
  // ponytail: simplified partial update payload; replace with typed update schema if validation layer added
  const updateData: {
    status: "waiting" | "in_progress" | "completed" | "cancelled";
    paymentStatus?: "unpaid" | "paid";
    paymentMethod?: "cash" | "qris";
    startedAt?: Date;
    completedAt?: Date;
  } = { status };

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
