export interface BranchItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}

export interface BarberItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  branchId: string;
  avatarUrl: string;
  specialty: string;
  rating: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export interface BookingRecord {
  id: string;
  branchId: string;
  barberId: string;
  barberName: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  queueNumber: string;
  bookingType: "online_slot" | "walk_in";
  bookingDate: string;
  slotTime?: string;
  status: "waiting" | "in_progress" | "completed" | "cancelled";
  totalPrice: number;
  paymentStatus: "unpaid" | "paid";
  paymentMethod?: "cash" | "qris";
  services: string[];
  createdAt: string;
}

export interface HaircutBlueprint {
  id: string;
  customerId?: string;
  customerName: string;
  barberId: string;
  barberName: string;
  bookingId?: string;
  sideTechnique: string;
  baselineGuard: string;
  topStyle: string;
  topTechnique: string;
  neckline: string;
  headQuirks: string[];
  stylingProduct: string;
  notes?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "owner" | "admin" | "staff" | "customer";
  jobTitle?: string;
  branchId?: string | null;
  phone?: string;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  baseSalaryWeekly?: number;
  commissionRate?: number;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  staffRole: string;
  jobTitle?: string;
  branchId: string;
  branchName: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  baseSalary: number;
  completedServicesCount: number;
  serviceCommission: number;
  branchTargetBonus: number;
  totalPayout: number;
  status: "pending" | "paid";
  paidAt?: string | null;
  paymentReference?: string | null;
  notes?: string | null;
  createdAt: string;
}
