"use server";

import { revalidatePath } from "next/cache";
import {
  createBranch,
  createService,
  createUser,
  deleteUser,
  markPayrollPaid,
  updateStaffPayrollSettings,
} from "@/lib/store";
import { hashPassword, getSession } from "@/lib/auth";

// Guard: Only admin can execute admin actions
async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    throw new Error("Akses ditolak: Hanya Admin yang berhak mengelola data bisnis.");
  }
}

export async function createBranchAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  const phone = formData.get("phone")?.toString().trim();
  const openTime = formData.get("openTime")?.toString().trim() || "09:00";
  const closeTime = formData.get("closeTime")?.toString().trim() || "21:00";

  if (!name || !address || !phone) {
    return { success: false, error: "Nama cabang, alamat, dan nomor kontak wajib diisi." };
  }

  try {
    const branch = await createBranch({ name, address, phone, openTime, closeTime });
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/owner");
    revalidatePath("/");
    revalidatePath("/book");
    return { success: true, branch };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createServiceAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const durationMinutes = Number(formData.get("durationMinutes")) || 45;
  const price = Number(formData.get("price")) || 0;

  if (!name || price <= 0) {
    return { success: false, error: "Nama layanan dan tarif valid wajib diisi." };
  }

  try {
    const service = await createService({ name, description, durationMinutes, price });
    revalidatePath("/dashboard/admin");
    revalidatePath("/book");
    return { success: true, service };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createUserAction(formData: FormData) {
  await requireAdmin();
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const rawPassword = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() as "owner" | "admin" | "staff";
  const jobTitle = formData.get("jobTitle")?.toString().trim() || "Barberman";
  const branchId = formData.get("branchId")?.toString().trim() || null;
  const phone = formData.get("phone")?.toString().trim();

  // Bank & Payroll data
  const bankName = formData.get("bankName")?.toString().trim() || "BCA";
  const bankAccountNumber = formData.get("bankAccountNumber")?.toString().trim() || null;
  const bankAccountHolder = formData.get("bankAccountHolder")?.toString().trim() || name;
  const baseSalaryWeekly = Number(formData.get("baseSalaryWeekly")) || 1337500;
  const commissionRate = Number(formData.get("commissionRate")) || (jobTitle.toLowerCase().includes("barber") ? 20 : 0);

  if (!name || !email || !rawPassword || !role) {
    return { success: false, error: "Nama, email/username, password, dan role karyawan wajib diisi." };
  }

  if (role === "staff" && !branchId) {
    return { success: false, error: "Karyawan cabang (Barber / Kasir) wajib ditugaskan ke salah satu cabang." };
  }

  try {
    const passwordHash = await hashPassword(rawPassword);
    const user = await createUser({
      name,
      email,
      passwordHash,
      role,
      jobTitle,
      branchId,
      phone,
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      baseSalaryWeekly,
      commissionRate,
    });

    revalidatePath("/dashboard/admin");
    return { success: true, user };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteUserAction(userId: string) {
  await requireAdmin();
  try {
    await deleteUser(userId);
    revalidatePath("/dashboard/admin");
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function markPayrollPaidAction(
  payrollId: string,
  paymentReference?: string,
  notes?: string
) {
  await requireAdmin();
  try {
    const success = await markPayrollPaid(payrollId, paymentReference, notes);
    revalidatePath("/dashboard/admin");
    return { success };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateStaffPayrollSettingsAction(userId: string, formData: FormData) {
  await requireAdmin();
  const bankName = formData.get("bankName")?.toString().trim() || "BCA";
  const bankAccountNumber = formData.get("bankAccountNumber")?.toString().trim();
  const bankAccountHolder = formData.get("bankAccountHolder")?.toString().trim();
  const baseSalaryWeekly = Number(formData.get("baseSalaryWeekly")) || 1337500;
  const commissionRate = Number(formData.get("commissionRate")) || 20;

  if (!bankAccountNumber || !bankAccountHolder) {
    return { success: false, error: "Nomor rekening dan nama pemilik rekening wajib diisi." };
  }

  try {
    const success = await updateStaffPayrollSettings(userId, {
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      baseSalaryWeekly,
      commissionRate,
    });
    revalidatePath("/dashboard/admin");
    return { success };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
