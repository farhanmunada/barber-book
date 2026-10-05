import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, or, desc, ilike } from "drizzle-orm";
import { UserAccount, BarberItem } from "@/lib/types";

export async function getUsers(): Promise<UserAccount[]> {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    jobTitle: u.jobTitle || "Barberman",
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
    jobTitle: u.jobTitle || "Barberman",
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
    jobTitle: u.jobTitle || "Barberman",
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

export async function getBarbers(branchId?: string): Promise<BarberItem[]> {
  const baseCondition = branchId
    ? and(eq(users.role, "staff"), eq(users.branchId, branchId))
    : eq(users.role, "staff");

  const rows = await db.select().from(users).where(baseCondition);
  // Filter for barbers (exclude dedicated cashiers from barber haircut selection)
  const barberRows = rows.filter((u) => !u.jobTitle || u.jobTitle.toLowerCase().includes("barber"));
  const activeList = barberRows.length > 0 ? barberRows : rows;

  return activeList.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || "-",
    branchId: u.branchId || "",
    avatarUrl:
      u.avatarUrl ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    specialty: u.jobTitle || "Classic Cut & Modern Fade",
    rating: 4.9,
  }));
}

export async function createUser(data: {
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
}): Promise<UserAccount> {
  const inserted = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role,
      jobTitle: data.jobTitle || (data.role === "staff" ? "Barberman" : "Staf Operasional"),
      branchId: data.branchId || null,
      phone: data.phone || null,
      bankName: data.bankName || "BCA",
      bankAccountNumber: data.bankAccountNumber || null,
      bankAccountHolder: data.bankAccountHolder || data.name,
      baseSalaryWeekly: data.baseSalaryWeekly || (data.role === "staff" ? 1337500 : 0),
      commissionRate: data.commissionRate !== undefined ? data.commissionRate : 20,
    })
    .returning();

  const u = inserted[0];
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    passwordHash: u.passwordHash,
    role: u.role,
    jobTitle: u.jobTitle || "Barberman",
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

export async function deleteUser(id: string): Promise<boolean> {
  const deleted = await db.delete(users).where(eq(users.id, id)).returning();
  return deleted.length > 0;
}
