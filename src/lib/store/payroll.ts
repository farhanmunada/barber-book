import { db } from "@/db";
import { users, bookings, payrolls } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { PayrollRecord } from "@/lib/types";
import { getBranches } from "./branches";

export function getCurrentWeekRange(): { periodStart: string; periodEnd: string } {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday
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

  // 1. Fetch active staff
  const staffUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "staff"));

  const allBranches = await getBranches();

  // 2. Fetch existing payroll rows for current week
  const existingPayrolls = await db
    .select()
    .from(payrolls)
    .where(
      and(
        eq(payrolls.periodStart, range.periodStart),
        eq(payrolls.periodEnd, range.periodEnd)
      )
    );

  // 3. Fetch completed bookings within date range for commission & bonus calculations
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

  // 4. Calculate total revenue per branch for target bonus eligibility
  const branchRevenueMap: Record<string, number> = {};
  for (const b of completedBookings) {
    branchRevenueMap[b.branchId] = (branchRevenueMap[b.branchId] || 0) + b.totalPrice;
  }

  // 5. Build/sync payroll records for all active staff
  const results: PayrollRecord[] = [];

  for (const staff of staffUsers) {
    const branch = allBranches.find((b) => b.id === staff.branchId);
    const branchName = branch?.name || "Cabang Barbershop";

    const staffBookings = completedBookings.filter((b) => b.barberId === staff.id);
    const completedServicesCount = staffBookings.length;
    const staffServiceRevenue = staffBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const commissionRate = staff.commissionRate || 20;
    const serviceCommission = Math.round(staffServiceRevenue * (commissionRate / 100));

    // Branch target bonus pool: 2.5% of branch revenue if >= 100M IDR, split equally among active staff
    const branchRevenue = branchRevenueMap[staff.branchId || ""] || 0;
    let branchTargetBonus = 0;
    if (branchRevenue >= 100000000) {
      const activeStaffInBranch = staffUsers.filter((s) => s.branchId === staff.branchId).length || 1;
      const bonusPool = Math.round(branchRevenue * 0.025);
      branchTargetBonus = Math.round(bonusPool / activeStaffInBranch);
    }

    const baseSalary = staff.baseSalaryWeekly || 1337500;
    const calculatedTotal = baseSalary + serviceCommission + branchTargetBonus;

    const existing = existingPayrolls.find((p) => p.staffId === staff.id);

    if (existing) {
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
