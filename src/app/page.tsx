import Link from "next/link";
import { getBranches, getBookings } from "@/lib/store";
import { Scissors, Clock, Sparkles, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const branches = await getBranches();
  const bookings = await getBookings();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#2D3139]/80 bg-gradient-to-b from-[#181B20] to-[#121316]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hybrid Queue & Grooming Blueprint</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
            Grooming Presisi. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-200">
              Antrean Nyata Tanpa Menebak.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-400 text-base sm:text-lg leading-relaxed">
            Pesan slot jam tanpa antre berjam-jam, simpan resep spesifik gradasi dan siluet rambutmu, atau pantau nomor antrean langsung dari smartphone.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Scissors className="w-4 h-4 -rotate-45" />
              <span>Booking Slot Sekarang</span>
            </Link>

            <Link
              href="/queue"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#20242B] hover:bg-[#282D36] text-zinc-200 font-semibold text-sm border border-[#343A46] transition-all active:scale-95"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Cek Status Antrean Live</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Branches Live Status Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              3 Cabang Aktif
            </h2>
            <p className="text-sm text-zinc-400">Pilih cabang terdekat untuk booking atau pantau antrean toko.</p>
          </div>
          <Link
            href="/book"
            className="text-amber-400 hover:text-amber-300 text-xs font-semibold inline-flex items-center gap-1 group"
          >
            <span>Mulai Reservasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => {
            const branchToday = bookings.filter(
              (bk) => bk.branchId === b.id && bk.bookingDate === today
            );
            const inProgressCount = branchToday.filter((bk) => bk.status === "in_progress").length;
            const waitingCount = branchToday.filter((bk) => bk.status === "waiting").length;

            return (
              <div
                key={b.id}
                className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-colors group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#252A31] text-amber-400 border border-[#343A46]">
                      {b.openTime} - {b.closeTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Buka
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{b.address}</p>
                    <p className="text-xs text-zinc-500 mt-1">WA/Telp: {b.phone}</p>
                  </div>

                  {/* Live Status Indicators */}
                  <div className="bg-[#141619] rounded-xl p-3 grid grid-cols-2 gap-2 text-center border border-[#262A31]">
                    <div>
                      <span className="block text-[11px] text-zinc-400">Kursi Terisi</span>
                      <span className="text-base font-bold text-emerald-400">{inProgressCount} Kursi</span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-zinc-400">Antrean Tunggu</span>
                      <span className="text-base font-bold text-amber-400">{waitingCount} Orang</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-2">
                  <Link
                    href={`/book?branch=${b.id}`}
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-center font-bold text-xs transition-colors"
                  >
                    Pesan Di Sini
                  </Link>
                  <Link
                    href={`/dashboard/branch/${b.id}/queue`}
                    className="px-3 py-2.5 rounded-lg bg-[#252A31] hover:bg-[#2C333D] text-zinc-300 text-xs font-medium border border-[#353B47] transition-colors"
                    title="Buka Papan Antrean Cabang"
                  >
                    Board
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Pillars (Anti-AI Slop & Barber DNA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16181C] border border-[#2D3139] rounded-3xl p-8 md:p-12 space-y-10">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Bukan Sekadar Aplikasi Tiket Biasa.
            </h2>
            <p className="text-sm md:text-base text-zinc-400 mt-2">
              Didesain khusus untuk ritme kerja barbershop profesional dengan minim pengetikan (tap-first).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scissors className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Haircut Blueprint (Resep Potong)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Data spesifik clipper guard (#1, #1.5), teknik gradasi (Low/Mid/Skin Fade), siluet atas, hingga pusaran rambut tersimpan rapi. Ganti barber atau cabang tanpa takut salah potong.
              </p>
            </div>

            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Hybrid Queue Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mengharmonisasikan reservasi slot jam online dengan tamu walk-in yang langsung datang ke toko. Mencegah tabrakan kursi antar-pelanggan.
              </p>
            </div>

            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Typing POS Kasir</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kasir & barber dapat mendaftarkan tamu walk-in dan menyelesaikan tiket dalam hitungan detik via ketukan chip layar sentuh.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo Access Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Akses Instan Multi-Role</h4>
              <p className="text-xs text-zinc-300">Coba login 1-tap sebagai Owner (Analitik 3 Cabang), Kasir/Barber, atau Pelanggan.</p>
            </div>
          </div>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold whitespace-nowrap transition-colors"
          >
            Buka Portal Peran
          </Link>
        </div>
      </section>
    </div>
  );
}
