import { getBranches, getServices, getBarbers } from "@/lib/store";
import { ShieldCheck, Plus, Scissors, MapPin, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [branches, services, barbers] = await Promise.all([
    getBranches(),
    getServices(),
    getBarbers(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3139] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operational Admin Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            Manajemen Master Data & Cabang
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Kelola master katalog layanan, tarif per cabang, dan penugasan barber.
          </p>
        </div>

        <Link
          href="/dashboard/owner"
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors self-start md:self-auto"
        >
          Lihat Analitik Bisnis
        </Link>
      </div>

      {/* Section 1: Master Layanan & Tarif */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-500 -rotate-45" />
            <span>Katalog Layanan & Tarif Barbershop</span>
          </h2>
          <span className="text-xs text-zinc-400">{services.length} Layanan Aktif</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 flex flex-col justify-between space-y-3"
            >
              <div>
                <h3 className="font-bold text-sm text-white">{s.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-[#262A31] flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {s.durationMinutes} m
                </span>
                <span className="text-sm font-bold text-amber-400">
                  Rp {s.price.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Cabang & Penugasan Barber */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-amber-500" />
          <span>Konfigurasi 3 Cabang & Shift Barber</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => {
            const branchBarbers = barbers.filter((barber) => barber.branchId === b.id);
            return (
              <div
                key={b.id}
                className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-4"
              >
                <div>
                  <h3 className="font-bold text-base text-white">{b.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{b.address}</p>
                  <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded bg-[#252A31] text-amber-400">
                    Jam Buka: {b.openTime} - {b.closeTime}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#262A31] space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Barberman Bertugas ({branchBarbers.length}):
                  </span>
                  <div className="space-y-1.5">
                    {branchBarbers.map((barber) => (
                      <div
                        key={barber.id}
                        className="px-3 py-2 rounded-lg bg-[#141619] border border-[#262A31] flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-white">{barber.name}</span>
                        <span className="text-[11px] text-zinc-400">{barber.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/dashboard/branch/${b.id}/queue`}
                    className="w-full py-2 rounded-xl bg-[#252A31] hover:bg-[#303642] text-zinc-200 text-center text-xs font-semibold block transition-colors"
                  >
                    Buka Papan Antrean Cabang
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
