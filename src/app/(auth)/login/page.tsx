import { quickLoginAsRoleAction } from "@/app/actions/auth";
import { Scissors, ShieldCheck, User, Store, ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <Scissors className="w-7 h-7 -rotate-45" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Portal Masuk Barbercraft
        </h1>
        <p className="text-xs text-zinc-400">
          Pilih profil akses instan untuk evaluasi atau login dengan kredensial.
        </p>
      </div>

      {/* 1-Tap Demo Role Switchers */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-3xl p-6 space-y-4">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
          Akses Cepat 1-Tap (Demo Role)
        </span>

        <div className="space-y-2.5">
          {/* Owner */}
          <form action={quickLoginAsRoleAction.bind(null, "owner")}>
            <button
              type="submit"
              className="w-full p-3.5 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Owner Bisnis (3 Cabang)
                  </h4>
                  <p className="text-[11px] text-zinc-400">Dashboard omzet & KPI</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Admin */}
          <form action={quickLoginAsRoleAction.bind(null, "admin")}>
            <button
              type="submit"
              className="w-full p-3.5 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    Admin Operasional
                  </h4>
                  <p className="text-[11px] text-zinc-400">Katalog layanan & shift</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Staff / Barber */}
          <form action={quickLoginAsRoleAction.bind(null, "staff")}>
            <button
              type="submit"
              className="w-full p-3.5 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Barber / Kasir Cabang
                  </h4>
                  <p className="text-[11px] text-zinc-400">Papan antrean & walk-in POS</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Customer */}
          <form action={quickLoginAsRoleAction.bind(null, "customer")}>
            <button
              type="submit"
              className="w-full p-3.5 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                    Pelanggan (Raditya Dika)
                  </h4>
                  <p className="text-[11px] text-zinc-400">Booking & resep tersimpan</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
