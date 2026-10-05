import { Suspense } from "react";
import { getBranches, getBarbers, getServices, getBookings, getUserById } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Scissors, UserCheck } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const session = await getSession();

  // Wajib memiliki akun & login untuk booking online
  if (!session) {
    redirect("/login?from=/book&reason=booking_required");
  }

  const resolvedParams = await searchParams;
  const [branches, barbers, services, bookings, userAccount] = await Promise.all([
    getBranches(),
    getBarbers(),
    getServices(),
    getBookings(),
    getUserById(session.userId),
  ]);

  const customerProfile = {
    id: session.userId,
    name: userAccount?.name || session.name,
    email: userAccount?.email || session.email,
    phone: userAccount?.phone || session.phone || "",
    role: session.role,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3139] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5 -rotate-45" />
            <span>Reservasi Online Mandiri</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase">
            Pesan Jadwal Potong Rambut
          </h1>
          <p className="text-sm text-zinc-400">
            Pilih cabang, layanan, barber favorit, dan jam kedatangan Anda dalam 5 ketukan mudah.
          </p>
        </div>

        {/* Info Pelanggan Terautentikasi */}
        <div className="flex items-center gap-3 bg-[#1A1D21] border border-[#2D3139] px-4 py-2.5 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-zinc-400 block leading-tight">Terhubung Sebagai</span>
            <span className="text-xs font-bold text-white block leading-tight">
              {customerProfile.name}
            </span>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="text-zinc-400 py-12 text-center">Memuat jadwal...</div>}>
        <BookingWizard
          branches={branches}
          barbers={barbers}
          services={services}
          existingBookings={bookings}
          initialBranchId={resolvedParams.branch}
          customerProfile={customerProfile}
        />
      </Suspense>
    </div>
  );
}
