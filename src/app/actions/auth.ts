"use server";

import { setSession, clearSession, getSession, verifyPassword, hashPassword, SessionPayload } from "@/lib/auth";
import { getUserByEmail, createUser } from "@/lib/store";
import { redirect } from "next/navigation";

export async function loginWithCredentialsAction(formData: FormData): Promise<void> {
  const identifier = formData.get("identifier")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!identifier || !password) {
    redirect("/login?error=Username%2FEmail+dan+password+wajib+diisi");
  }

  const user = await getUserByEmail(identifier);
  if (!user) {
    redirect("/login?error=Akun+tidak+ditemukan.+Periksa+kembali+kredensial+Anda.");
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    redirect("/login?error=Password+salah.+Silakan+coba+lagi.");
  }

  const sessionPayload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    branchId: user.branchId,
    phone: user.phone || null,
  };

  await setSession(sessionPayload);

  // Redirection strictly based on role
  if (user.role === "owner") {
    redirect("/dashboard/owner");
  } else if (user.role === "admin") {
    redirect("/dashboard/admin");
  } else if (user.role === "staff") {
    redirect(`/dashboard/branch/${user.branchId || "branch-kemang"}/queue`);
  } else {
    redirect("/book");
  }
}

export async function registerCustomerAction(formData: FormData): Promise<void> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const phone = formData.get("phone")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    redirect("/register?error=Nama%2C+email%2C+dan+password+wajib+diisi");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    redirect("/register?error=Email+sudah+terdaftar.+Silakan+langsung+login.");
  }

  const passwordHash = await hashPassword(password);
  const newUser = await createUser({
    name,
    email,
    passwordHash,
    role: "customer",
    phone,
  });

  const sessionPayload: SessionPayload = {
    userId: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: "customer",
    phone: newUser.phone || null,
  };

  await setSession(sessionPayload);
  redirect("/book");
}

export async function loginWithGoogleAction(formData?: FormData): Promise<void> {
  const googleEmail = formData?.get("googleEmail")?.toString().trim().toLowerCase() || "pelanggan.google@gmail.com";
  const googleName = formData?.get("googleName")?.toString().trim() || "Pelanggan Google";

  // Check if user exists in database
  let user = await getUserByEmail(googleEmail);

  if (!user) {
    // Auto-register google user as customer in Neon Postgres
    const randomPass = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(randomPass);
    user = await createUser({
      name: googleName,
      email: googleEmail,
      passwordHash,
      role: "customer",
      phone: "0812-GoogleAuth",
    });
  }

  const sessionPayload: SessionPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: "customer",
    phone: user.phone || null,
  };

  await setSession(sessionPayload);
  redirect("/book");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  redirect("/login");
}

export async function getCurrentUserAction() {
  return getSession();
}
