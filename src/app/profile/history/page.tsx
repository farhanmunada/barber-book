import { getHaircutRecipes } from "@/lib/store";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Scissors, Sparkles, User, Calendar, Tag, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();
  
  // Search query priority: search query param, or session user name, or default
  const searchQuery = q !== undefined ? q : session?.name || "";
  const recipes = await getHaircutRecipes(searchQuery);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#2D3139] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <Scissors className="w-3.5 h-3.5 -rotate-45" />
          <span>Barber Blueprint Identity</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          Resep Gaya Potong Tersimpan
        </h1>
        <p className="text-sm text-zinc-400">
          Setiap detail potongan rambut Anda (sepatu mesin, teknik fade, dan pusaran rambut) dicatat oleh barber untuk hasil konsisten di semua cabang.
        </p>
      </div>

      {/* Search Bar for customer name */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex gap-2" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Cari berdasarkan nama pelanggan (Contoh: Raditya, Budi)..."
            className="flex-1 bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
          >
            Cari
          </button>
        </form>

        <Link
          href="/book"
          className="px-5 py-2.5 rounded-xl bg-[#252A31] hover:bg-[#2F3642] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Booking Ulang</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
        </Link>
      </div>

      {/* Recipes List */}
      <div className="space-y-6">
        {recipes.length === 0 ? (
          <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-12 text-center space-y-4">
            <Scissors className="w-10 h-10 text-zinc-600 mx-auto -rotate-45" />
            <h3 className="text-base font-bold text-white">Belum Ada Resep Potong Ditemukan</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Resep potong akan otomatis dibuat oleh barber setelah Anda selesai potong rambut di kursi toko kami.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all"
            >
              Pesan Potong Sekarang
            </Link>
          </div>
        ) : (
          recipes.map((rcp) => (
            <div
              key={rcp.id}
              className="bg-[#1A1D21] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-amber-500/5 hover:border-amber-500 transition-colors"
            >
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2D3139]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-xl">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{rcp.customerName}</h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span>Barber: {rcp.barberName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        {new Date(rcp.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Verified Blueprint
                  </span>
                </div>
              </div>

              {/* Anatomi Blueprint Grid (5 Zones) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Teknik Samping
                  </span>
                  <span className="text-sm font-bold text-amber-400 block mt-0.5">
                    {rcp.sideTechnique}
                  </span>
                </div>

                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Baseline Guard
                  </span>
                  <span className="text-sm font-bold text-amber-400 block mt-0.5">
                    {rcp.baselineGuard}
                  </span>
                </div>

                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Model Atas (Siluet)
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {rcp.topStyle}
                  </span>
                </div>

                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Teknik Gunting
                  </span>
                  <span className="text-sm font-bold text-zinc-300 block mt-0.5">
                    {rcp.topTechnique}
                  </span>
                </div>

                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Garis Tengkuk
                  </span>
                  <span className="text-sm font-bold text-zinc-300 block mt-0.5">
                    {rcp.neckline}
                  </span>
                </div>

                <div className="bg-[#141619] border border-[#262A31] p-3.5 rounded-2xl">
                  <span className="text-[11px] text-zinc-500 block uppercase font-semibold">
                    Styling Product
                  </span>
                  <span className="text-sm font-bold text-zinc-300 block mt-0.5">
                    {rcp.stylingProduct}
                  </span>
                </div>
              </div>

              {/* Head Quirks / Anatomi Khusus */}
              {rcp.headQuirks && rcp.headQuirks.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Karakteristik & Pusaran Khusus:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {rcp.headQuirks.map((q) => (
                      <span
                        key={q}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {rcp.notes && (
                <div className="bg-[#121316] border border-[#262A31] rounded-2xl p-4 text-xs text-zinc-300">
                  <span className="font-bold text-zinc-400 block mb-1">Catatan Barber:</span>
                  &ldquo;{rcp.notes}&rdquo;
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
