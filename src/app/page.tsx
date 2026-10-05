import Link from "next/link";
import { getBranches, getBookings } from "@/lib/store";
import { Scissors, Clock, MapPin, ArrowRight, ShieldCheck, CheckCircle2, CalendarCheck, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const branches = await getBranches();
  const bookings = await getBookings();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section: Langsung fokus ke Booking & Bebas Antre */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#2D3139]/80 bg-gradient-to-b from-[#181B20] to-[#121316]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pesan Online &bull; Bebas Antre Panjang</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
            Potong Rambut Tepat Waktu. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-200">
              Pilih Barber & Jam Sesukamu.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-300 text-base sm:text-lg leading-relaxed">
            Pesan slot potong rambut dari HP dalam 1 menit. Datang langsung dilayani tanpa perlu buang waktu menunggu berjam-jam di toko.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95 uppercase"
            >
              <Scissors className="w-4 h-4 -rotate-45" />
              <span>Booking Jadwal Sekarang</span>
            </Link>

            <Link
              href="/queue"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-xl bg-[#20242B] hover:bg-[#282D36] text-zinc-200 font-bold text-sm border border-[#343A46] transition-all active:scale-95"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Lihat Antrean Cabang</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Cabang Barbershop */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" />
              Pilih Cabang Terdekat
            </h2>
            <p className="text-sm text-zinc-400">
              Tersedia 3 cabang aktif di lokasi strategis. Pilih cabang untuk langsung reservasi jadwal.
            </p>
          </div>
          <Link
            href="/book"
            className="text-amber-400 hover:text-amber-300 text-xs font-bold inline-flex items-center gap-1 group"
          >
            <span>Lihat Semua Jadwal</span>
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
                className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-colors group shadow-lg shadow-black/20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#252A31] text-amber-400 border border-[#343A46]">
                      {b.openTime} - {b.closeTime} WIB
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Buka Hari Ini
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{b.address}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Kontak: {b.phone}</p>
                  </div>

                  {/* Info Kursi & Antrean */}
                  <div className="bg-[#141619] rounded-xl p-3 grid grid-cols-2 gap-2 text-center border border-[#262A31]">
                    <div>
                      <span className="block text-[11px] text-zinc-400">Sedang Dicukur</span>
                      <span className="text-base font-bold text-emerald-400">{inProgressCount} Kursi</span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-zinc-400">Antrean Tunggu</span>
                      <span className="text-base font-bold text-amber-400">{waitingCount} Orang</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    href={`/book?branch=${b.id}`}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-center font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 active:scale-95"
                  >
                    <span>Pesan Jadwal di Sini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Keuntungan Nyata untuk Pelanggan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#16181C] border border-[#2D3139] rounded-3xl p-8 md:p-12 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Kenapa Booking di BarberCraft?
            </h2>
            <p className="text-sm md:text-base text-zinc-400 mt-2">
              Pengalaman potong rambut lebih nyaman, teratur, dan hasil selalu konsisten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pasti Dapat Jam</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pilih jam yang pas dengan jadwal harianmu. Saat kamu tiba di toko, barber pilihanmu sudah siap memotong rambutmu.
              </p>
            </div>

            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <h3 className="text-base font-bold text-white">Catatan Gaya Rambut Tersimpan</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nomor ukuran clipper, teknik gradasi, dan gaya favoritmu tersimpan rapi di akun. Tidak perlu capek menjelaskan ulang setiap datang.
              </p>
            </div>

            <div className="bg-[#1C1F25] border border-[#2D3139] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Pantau Antrean dari Smartphone</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cek live posisi tiket antrean secara real-time. Kamu bisa santai ngopi dulu dan baru masuk saat giliranmu hampir tiba.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/15 via-[#1A1D21] to-[#1A1D21] border border-amber-500/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
              Mau Tampil Rapi Hari Ini?
            </h2>
            <p className="text-sm text-zinc-300">
              Amankan slot jam potong rambutmu sekarang sebelum slot favorit penuh.
            </p>
          </div>
          <Link
            href="/book"
            className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm uppercase tracking-wide transition-all shadow-xl shadow-amber-500/20 active:scale-95 whitespace-nowrap"
          >
            Booking Jadwal Sekarang
          </Link>
        </div>
      </section>
    </div>
  );
}
