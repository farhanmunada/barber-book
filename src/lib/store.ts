import {
  INITIAL_BRANCHES,
  INITIAL_BARBERS,
  INITIAL_SERVICES,
  INITIAL_BOOKINGS,
  INITIAL_RECIPES,
  BranchItem,
  BarberItem,
  ServiceItem,
  BookingRecord,
  HaircutBlueprint,
} from "./mock-data";

// In-memory global store to ensure persistence across dev hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __barber_store: {
    branches: BranchItem[];
    barbers: BarberItem[];
    services: ServiceItem[];
    bookings: BookingRecord[];
    recipes: HaircutBlueprint[];
  } | undefined;
}

if (!global.__barber_store) {
  global.__barber_store = {
    branches: [...INITIAL_BRANCHES],
    barbers: [...INITIAL_BARBERS],
    services: [...INITIAL_SERVICES],
    bookings: [...INITIAL_BOOKINGS],
    recipes: [...INITIAL_RECIPES],
  };
}

const store = global.__barber_store;

export async function getBranches(): Promise<BranchItem[]> {
  return store.branches;
}

export async function getBranchById(id: string): Promise<BranchItem | undefined> {
  return store.branches.find((b) => b.id === id || b.slug === id);
}

export async function getBarbers(branchId?: string): Promise<BarberItem[]> {
  if (branchId) {
    return store.barbers.filter((b) => b.branchId === branchId);
  }
  return store.barbers;
}

export async function getBarberById(id: string): Promise<BarberItem | undefined> {
  return store.barbers.find((b) => b.id === id);
}

export async function getServices(): Promise<ServiceItem[]> {
  return store.services;
}

export async function getBookings(filters?: {
  branchId?: string;
  status?: string;
  date?: string;
}): Promise<BookingRecord[]> {
  let list = store.bookings;
  if (filters?.branchId) {
    list = list.filter((b) => b.branchId === filters.branchId);
  }
  if (filters?.status) {
    list = list.filter((b) => b.status === filters.status);
  }
  if (filters?.date) {
    list = list.filter((b) => b.bookingDate === filters.date);
  }
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getBookingById(id: string): Promise<BookingRecord | undefined> {
  return store.bookings.find((b) => b.id === id);
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
  const branch = store.branches.find((b) => b.id === data.branchId);
  const barber = store.barbers.find((b) => b.id === data.barberId);
  const selectedServices = store.services.filter((s) => data.serviceIds.includes(s.id));
  
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Validasi slot online: Cegah duplikat booking dan cegah slot yang sudah lewat
  if (data.bookingType === "online_slot" && data.slotTime) {
    const isAlreadyBooked = store.bookings.some(
      (b) =>
        b.branchId === data.branchId &&
        b.barberId === data.barberId &&
        b.bookingDate === data.bookingDate &&
        b.slotTime === data.slotTime &&
        b.status !== "cancelled"
    );
    if (isAlreadyBooked) {
      throw new Error(`Slot jam ${data.slotTime} sudah dipesan oleh pelanggan lain. Silakan pilih slot lain.`);
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

  // Generate queue number: Branch initial + sequence today
  const branchPrefix = (branch?.name || "B").charAt(0).toUpperCase();
  const todayBookings = store.bookings.filter(
    (b) => b.branchId === data.branchId && b.bookingDate === data.bookingDate
  );
  const queueSequence = String(todayBookings.length + 1).padStart(2, "0");
  const queueNumber = `${branchPrefix}-${queueSequence}`;

  const newBooking: BookingRecord = {
    id: `book-${Date.now()}`,
    branchId: data.branchId,
    barberId: data.barberId,
    barberName: barber?.name || "Barber",
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    queueNumber,
    bookingType: data.bookingType,
    bookingDate: data.bookingDate,
    slotTime: data.slotTime,
    status: "waiting",
    totalPrice,
    paymentStatus: "unpaid",
    services: selectedServices.map((s) => s.name),
    createdAt: new Date().toISOString(),
  };

  store.bookings.unshift(newBooking);
  return newBooking;
}

export async function updateBookingStatus(
  id: string,
  status: "waiting" | "in_progress" | "completed" | "cancelled",
  paymentMethod?: "cash" | "qris"
): Promise<BookingRecord | null> {
  const booking = store.bookings.find((b) => b.id === id);
  if (!booking) return null;

  booking.status = status;
  if (status === "completed") {
    booking.paymentStatus = "paid";
    if (paymentMethod) booking.paymentMethod = paymentMethod;
  }
  return { ...booking };
}

export async function getHaircutRecipes(query?: string): Promise<HaircutBlueprint[]> {
  if (!query) return store.recipes;
  const q = query.toLowerCase();
  return store.recipes.filter(
    (r) =>
      r.customerName.toLowerCase().includes(q) ||
      (r.customerId && r.customerId.toLowerCase().includes(q))
  );
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
  const recipe: HaircutBlueprint = {
    id: `rcp-${Date.now()}`,
    customerName: data.customerName,
    customerId: data.customerId,
    barberId: data.barberId,
    barberName: data.barberName,
    sideTechnique: data.sideTechnique,
    baselineGuard: data.baselineGuard,
    topStyle: data.topStyle,
    topTechnique: data.topTechnique,
    neckline: data.neckline,
    headQuirks: data.headQuirks,
    stylingProduct: data.stylingProduct,
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  store.recipes.unshift(recipe);
  return recipe;
}

export async function getOwnerAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  
  const branchSummaries = store.branches.map((branch) => {
    const branchBookings = store.bookings.filter((b) => b.branchId === branch.id);
    const todayBookings = branchBookings.filter((b) => b.bookingDate === today);
    const completed = branchBookings.filter((b) => b.status === "completed");
    const revenue = completed.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      branchId: branch.id,
      name: branch.name,
      slug: branch.slug,
      todayQueueCount: todayBookings.length,
      activeWaiting: todayBookings.filter((b) => b.status === "waiting").length,
      inProgress: todayBookings.filter((b) => b.status === "in_progress").length,
      totalCompleted: completed.length,
      revenue,
    };
  });

  const totalRevenue = branchSummaries.reduce((sum, b) => sum + b.revenue, 0);
  const totalBookings = store.bookings.length;

  return {
    today,
    totalRevenue,
    totalBookings,
    branchSummaries,
  };
}
