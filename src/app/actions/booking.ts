"use server";

import { revalidatePath } from "next/cache";
import {
  createBooking,
  updateBookingStatus,
  saveHaircutRecipe,
  getHaircutRecipes,
} from "@/lib/store";
import { getSession } from "@/lib/auth";

export async function submitOnlineBookingAction(data: {
  branchId: string;
  barberId: string;
  customerName?: string;
  customerPhone?: string;
  bookingDate: string;
  slotTime: string;
  serviceIds: string[];
}) {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Wajib login ke akun pelanggan untuk memesan jadwal potong rambut online.",
    };
  }

  const customerName = session.name || data.customerName || "Pelanggan";
  const customerPhone = data.customerPhone || session.phone || "0812-xxx";

  if (!data.branchId || !data.barberId || !data.slotTime || !data.serviceIds.length) {
    return { success: false, error: "Cabang, barber, jam slot, dan layanan wajib dipilih." };
  }

  try {
    const booking = await createBooking({
      ...data,
      customerId: session.userId,
      customerName,
      customerPhone,
      bookingType: "online_slot",
    });

    revalidatePath("/queue");
    revalidatePath(`/dashboard/branch/${data.branchId}/queue`);
    revalidatePath("/dashboard/owner");

    return { success: true, booking };
  } catch (error) {
    return { success: false, error: "Gagal membuat reservasi: " + (error as Error).message };
  }
}

export async function submitWalkInAction(data: {
  branchId: string;
  barberId: string;
  customerName: string;
  customerPhone?: string;
  serviceIds: string[];
}) {
  if (!data.branchId || !data.barberId || !data.customerName || !data.serviceIds.length) {
    return { success: false, error: "Pilih barber, layanan, dan masukkan nama pelanggan." };
  }

  const today = new Date().toISOString().split("T")[0];

  try {
    const booking = await createBooking({
      ...data,
      bookingDate: today,
      bookingType: "walk_in",
    });

    revalidatePath(`/dashboard/branch/${data.branchId}/queue`);
    revalidatePath("/queue");
    revalidatePath("/dashboard/owner");

    return { success: true, booking };
  } catch (error) {
    return { success: false, error: "Gagal input walk-in: " + (error as Error).message };
  }
}

export async function updateQueueStatusAction(
  bookingId: string,
  branchId: string,
  status: "waiting" | "in_progress" | "completed" | "cancelled",
  paymentMethod?: "cash" | "qris"
) {
  try {
    const updated = await updateBookingStatus(bookingId, status, paymentMethod);
    if (!updated) {
      return { success: false, error: "Booking tidak ditemukan." };
    }

    revalidatePath(`/dashboard/branch/${branchId}/queue`);
    revalidatePath("/queue");
    revalidatePath("/dashboard/owner");

    return { success: true, booking: updated };
  } catch (error) {
    return { success: false, error: "Gagal update status: " + (error as Error).message };
  }
}

export async function saveHaircutBlueprintAction(data: {
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
  branchId?: string;
}) {
  try {
    const recipe = await saveHaircutRecipe(data);
    if (data.branchId) {
      revalidatePath(`/dashboard/branch/${data.branchId}/recipe`);
    }
    revalidatePath("/profile/history");
    return { success: true, recipe };
  } catch (error) {
    return { success: false, error: "Gagal simpan resep: " + (error as Error).message };
  }
}

export async function searchCustomerRecipesAction(query: string) {
  return getHaircutRecipes(query);
}
