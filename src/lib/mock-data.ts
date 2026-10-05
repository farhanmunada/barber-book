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
  services: string[]; // names of services
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
  branchId?: string | null;
  phone?: string;
  createdAt: string;
}

export const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: "branch-kemang",
    name: "BarberCraft Kemang",
    slug: "kemang",
    address: "Jl. Kemang Raya No. 42, Jakarta Selatan",
    phone: "0812-8888-101",
    openTime: "09:00",
    closeTime: "21:00",
  },
  {
    id: "branch-senopati",
    name: "BarberCraft Senopati",
    slug: "senopati",
    address: "Jl. Senopati No. 18, Jakarta Selatan",
    phone: "0812-8888-102",
    openTime: "10:00",
    closeTime: "22:00",
  },
  {
    id: "branch-bintaro",
    name: "BarberCraft Bintaro Sektor 9",
    slug: "bintaro",
    address: "Ruko Bintaro Sektor 9 Blok A-3, Tangerang Selatan",
    phone: "0812-8888-103",
    openTime: "09:00",
    closeTime: "21:00",
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: "srv-gentleman-cut",
    name: "Gentleman Haircut & Styling",
    description: "Konsultasi bentuk wajah, precision haircut, wash dingin, styling pomade.",
    durationMinutes: 45,
    price: 85000,
  },
  {
    id: "srv-beard-trim",
    name: "Beard Sculpting & Hot Towel",
    description: "Cukur janggut rapi, handuk hangat aromaterapi, soothing aftershave lotion.",
    durationMinutes: 30,
    price: 55000,
  },
  {
    id: "srv-executive-combo",
    name: "Executive Grooming (All-in)",
    description: "Haircut lengkap + beard trim + hair wash & scalp massage + hot towel.",
    durationMinutes: 60,
    price: 135000,
  },
  {
    id: "srv-scalp-wash",
    name: "Hair Wash & Menthol Scalp Therapy",
    description: "Keramas deep-cleanse dengan sensasi dingin menthol dan pijat kepala relaksasi.",
    durationMinutes: 20,
    price: 40000,
  },
];

export const INITIAL_BARBERS: BarberItem[] = [
  // Kemang
  {
    id: "barber-rian",
    name: "Rian Santoso",
    email: "rian@barber.com",
    phone: "0811-111-222",
    branchId: "branch-kemang",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    specialty: "Skin Fade & French Crop Specialist",
    rating: 4.9,
  },
  {
    id: "barber-bima",
    name: "Bima Pratama",
    email: "bima@barber.com",
    phone: "0811-111-223",
    branchId: "branch-kemang",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    specialty: "Classic Scissor & Pompadour",
    rating: 4.8,
  },
  // Senopati
  {
    id: "barber-eko",
    name: "Eko 'The Razor'",
    email: "eko@barber.com",
    phone: "0811-111-224",
    branchId: "branch-senopati",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    specialty: "Taper Fade & Beard Artistry",
    rating: 5.0,
  },
  {
    id: "barber-andre",
    name: "Andre Wijaya",
    email: "andre@barber.com",
    phone: "0811-111-225",
    branchId: "branch-senopati",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    specialty: "Two-Block & Textured Quiff",
    rating: 4.9,
  },
  // Bintaro
  {
    id: "barber-dimas",
    name: "Dimas Ardi",
    email: "dimas@barber.com",
    phone: "0811-111-226",
    branchId: "branch-bintaro",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    specialty: "Drop Fade & Mullet Modern",
    rating: 4.7,
  },
  {
    id: "barber-faris",
    name: "Faris Maulana",
    email: "faris@barber.com",
    phone: "0811-111-227",
    branchId: "branch-bintaro",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    specialty: "Classic Side-Part & Shave",
    rating: 4.8,
  },
];

export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: "book-101",
    branchId: "branch-kemang",
    barberId: "barber-rian",
    barberName: "Rian Santoso",
    customerId: "cust-01",
    customerName: "Raditya Dika",
    customerPhone: "0812-9988-7766",
    queueNumber: "K-01",
    bookingType: "online_slot",
    bookingDate: new Date().toISOString().split("T")[0],
    slotTime: "14:00",
    status: "in_progress",
    totalPrice: 85000,
    paymentStatus: "paid",
    paymentMethod: "qris",
    services: ["Gentleman Haircut & Styling"],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "book-102",
    branchId: "branch-kemang",
    barberId: "barber-bima",
    barberName: "Bima Pratama",
    customerName: "Pak Hendra (Walk-in)",
    customerPhone: "0813-1122-3344",
    queueNumber: "K-02",
    bookingType: "walk_in",
    bookingDate: new Date().toISOString().split("T")[0],
    status: "waiting",
    totalPrice: 135000,
    paymentStatus: "unpaid",
    services: ["Executive Grooming (All-in)"],
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "book-103",
    branchId: "branch-kemang",
    barberId: "barber-rian",
    barberName: "Rian Santoso",
    customerName: "Aldi (Online)",
    customerPhone: "0856-7788-9900",
    queueNumber: "K-03",
    bookingType: "online_slot",
    bookingDate: new Date().toISOString().split("T")[0],
    slotTime: "15:15",
    status: "waiting",
    totalPrice: 85000,
    paymentStatus: "unpaid",
    services: ["Gentleman Haircut & Styling"],
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const INITIAL_RECIPES: HaircutBlueprint[] = [
  {
    id: "rcp-01",
    customerId: "cust-01",
    customerName: "Raditya Dika",
    barberId: "barber-rian",
    barberName: "Rian Santoso",
    sideTechnique: "Low Fade",
    baselineGuard: "#1 (3mm)",
    topStyle: "French Crop",
    topTechnique: "Point Cut (Tekstur)",
    neckline: "Tapered (Alami)",
    headQuirks: ["Double Crown (2 Pusaran)"],
    stylingProduct: "Matte Clay",
    notes: "Poni jangan dipotong terlalu pendek di atas alis. Bagian pusaran belakang biarkan sedikit berbobot.",
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr-owner",
    name: "Bapak Hendarto",
    email: "owner@barber.com",
    passwordHash: "$2b$10$OYlgtqJ/RTeRSg2Pv0zvN.lPETCH09dvo2PSyIifnO5q9L8AtdCrC",
    role: "owner",
    phone: "0812-0000-001",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-admin",
    name: "Siti Rahma (Admin Ops)",
    email: "admin@barber.com",
    passwordHash: "$2b$10$RLGGW.tKs/GbIvN/b7sJZ.nfwE/h058mgWVtbdUGvlKIXjWqUTMBu",
    role: "admin",
    phone: "0812-0000-002",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-kasir-kemang",
    name: "Kasir Kemang",
    email: "kasir.kemang@barber.com",
    passwordHash: "$2b$10$UbZXA7LQfTSfqPb8uDzTDeHUQO3nrbpr17T5pbAARV2QLalWbj.e6",
    role: "staff",
    branchId: "branch-kemang",
    phone: "0812-0000-003",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-budi",
    name: "Budi Santoso",
    email: "budi@gmail.com",
    passwordHash: "$2b$10$H.uJyavsFKEjax5aUEkMgOSJmWIPghDhx0e05vQV88XCKnmn.Zhkm",
    role: "customer",
    phone: "0812-9988-7711",
    createdAt: new Date().toISOString(),
  },
];
