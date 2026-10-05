import { Suspense } from "react";
import { getBranches, getBarbers, getServices } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Scissors } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [branches, barbers, services, session] = await Promise.all([
    getBranches(),
    getBarbers(),
    getServices(),
    getSession(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#2D3139] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <Scissors className="w-3.5 h-3.5 -rotate-45" />
          <span>Formulir Reservasi Slot</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          Pesan Jadwal Potong Rambut
        </h1>
        <p className="text-sm text-zinc-400">
          Pilih cabang, layanan, barber favorit, dan jam kedatangan Anda dalam 5 ketukan mudah.
        </p>
      </div>

      <Suspense fallback={<div className="text-zinc-400 py-12 text-center">Memuat jadwal...</div>}>
        <BookingWizard
          branches={branches}
          barbers={barbers}
          services={services}
          initialBranchId={resolvedParams.branch}
          initialCustomerName={session?.role === "customer" ? session.name : ""}
        />
      </Suspense>
    </div>
  );
}
