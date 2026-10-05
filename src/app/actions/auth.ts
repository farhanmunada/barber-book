"use server";

import { setSession, clearSession, getSession, SessionPayload } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function quickLoginAsRoleAction(role: "owner" | "admin" | "staff" | "customer"): Promise<void> {
  const roleProfiles: Record<string, SessionPayload> = {
    owner: {
      userId: "usr-owner",
      name: "Bapak Hendarto (Owner)",
      email: "owner@barbercraft.com",
      role: "owner",
    },
    admin: {
      userId: "usr-admin",
      name: "Siti Rahma (Admin Ops)",
      email: "admin@barbercraft.com",
      role: "admin",
    },
    staff: {
      userId: "barber-rian",
      name: "Rian Santoso (Barber Kemang)",
      email: "rian@barber.com",
      role: "staff",
      branchId: "branch-kemang",
    },
    customer: {
      userId: "cust-01",
      name: "Raditya Dika",
      email: "raditya@customer.com",
      role: "customer",
    },
  };

  const payload = roleProfiles[role];
  if (!payload) return;

  await setSession(payload);

  if (role === "owner") redirect("/dashboard/owner");
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "staff") redirect("/dashboard/branch/branch-kemang/queue");
  redirect("/book");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return getSession();
}
