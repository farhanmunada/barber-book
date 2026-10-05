import { getOwnerAnalytics, getBarbers } from "@/lib/store";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Store,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Award,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OwnerDashboardPage() {
  const [analytics, barbers] = await Promise.all([
    getOwnerAnalytics(),
    getBarbers(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3139] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Executive Business Portal</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            Dashboard Bisnis 3 Cabang
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitoring omzet kasir, volume antrean toko, dan performa barber lintas-cabang hari ini ({analytics.today}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="px-4 py-2 rounded-xl bg-[#252A31] hover:bg-[#303640] border border-[#3A404D] text-xs font-semibold text-zinc-200 transition-colors"
          >
            Kelola Master Data
          </Link>
          <Link
            href="/book"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
          >
            + Buat Booking
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Omzet Kasir</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-sans">
            Rp {analytics.totalRevenue.toLocaleString("id-ID")}
          </span>
          <span className="text-[11px] text-zinc-500 block">Akumulasi tiket lunas</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Antrean Masuk</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-white font-sans">
            {analytics.totalBookings} Pelanggan
          </span>
          <span className="text-[11px] text-zinc-500 block">Gabungan slot online & walk-in</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Cabang Aktif</span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-blue-400 font-sans">
            3 Cabang
          </span>
          <span className="text-[11px] text-zinc-500 block">Kemang, Senopati, Bintaro</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Barber Bertugas</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-2xl font-black text-purple-400 font-sans">
            {barbers.length} Barber
          </span>
          <span className="text-[11px] text-zinc-500 block">Rata-rata 2 barber/cabang</span>
        </div>
      </div>

      {/* Per-Branch Breakdown Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span>Performa Real-Time Per Cabang</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analytics.branchSummaries.map((bs) => (
            <div
              key={bs.branchId}
              className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#2D3139]">
                  <h3 className="font-bold text-white text-base">{bs.name}</h3>
                  <span className="text-xs font-black text-amber-400 uppercase">
                    {bs.slug}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#242831]">
                    <span className="text-zinc-400">Omzet Selesai:</span>
                    <span className="font-bold text-emerald-400">
                      Rp {bs.revenue.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#242831]">
                    <span className="text-zinc-400">Total Tiket Hari Ini:</span>
                    <span className="font-bold text-white">{bs.todayQueueCount} Tamu</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#242831]">
                    <span className="text-zinc-400">Sedang Dipotong:</span>
                    <span className="font-bold text-emerald-400">{bs.inProgress} Kursi</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#242831]">
                    <span className="text-zinc-400">Antrean Menunggu:</span>
                    <span className="font-bold text-amber-400">{bs.activeWaiting} Orang</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Selesai:</span>
                    <span className="font-bold text-zinc-300">{bs.totalCompleted} Tamu</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/dashboard/branch/${bs.branchId}/queue`}
                  className="w-full py-2.5 rounded-xl bg-[#252A31] hover:bg-amber-500 hover:text-black text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Buka POS Cabang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Staff Leaderboard / Rosters */}
      <section className="bg-[#16181C] border border-[#2D3139] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Daftar Barberman & Rating Performa</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {barbers.map((b) => (
            <div
              key={b.id}
              className="bg-[#1F232A] border border-[#2D3139] rounded-xl p-4 flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.avatarUrl}
                  alt={b.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white truncate">{b.name}</h4>
                  <span className="text-amber-400 font-bold text-xs ml-1">
                    ★ {b.rating}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{b.specialty}</p>
                <span className="text-[10px] text-zinc-500 block mt-1">
                  Cabang: {b.branchId.replace("branch-", "").toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
