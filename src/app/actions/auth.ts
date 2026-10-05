"use server";

import { setSession, clearSession, getSession, SessionPayload } from "@/lib/auth";
import { redirect } from "next/navigation";

const ROLE_PROFILES: Record<string, SessionPayload> = {
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

export async function quickLoginAsRoleAction(role: "owner" | "admin" | "staff" | "customer"): Promise<void> {
  const payload = ROLE_PROFILES[role];
  if (!payload) return;

  await setSession(payload);

  if (role === "owner") redirect("/dashboard/owner");
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "staff") redirect("/dashboard/branch/branch-kemang/queue");
  redirect("/book");
}

export async function loginWithEmailAction(formData: FormData): Promise<void> {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    redirect("/login?error=Email+dan+password+wajib+diisi");
  }

  // Pre-configured accounts for testing
  const accounts: Record<string, { pass: string; profile: SessionPayload }> = {
    "owner@barbercraft.com": {
      pass: "barber123",
      profile: ROLE_PROFILES.owner,
    },
    "admin@barbercraft.com": {
      pass: "barber123",
      profile: ROLE_PROFILES.admin,
    },
    "rian@barber.com": {
      pass: "barber123",
      profile: ROLE_PROFILES.staff,
    },
    "raditya@customer.com": {
      pass: "barber123",
      profile: ROLE_PROFILES.customer,
    },
  };

  const matched = accounts[email];
  if (!matched || matched.pass !== password) {
    redirect("/login?error=Kredensial+salah.+Contoh:+owner@barbercraft.com+/+barber123");
  }

  await setSession(matched.profile);

  if (matched.profile.role === "owner") redirect("/dashboard/owner");
  if (matched.profile.role === "admin") redirect("/dashboard/admin");
  if (matched.profile.role === "staff") {
    redirect(`/dashboard/branch/${matched.profile.branchId || "branch-kemang"}/queue`);
  }
  redirect("/book");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return getSession();
}
