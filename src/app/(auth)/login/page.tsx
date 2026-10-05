import { quickLoginAsRoleAction, loginWithEmailAction } from "@/app/actions/auth";
import { Scissors, ShieldCheck, User, Store, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <Scissors className="w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Portal Masuk Barbercraft
        </h1>
        <p className="text-xs text-zinc-400">
          Login menggunakan akun atau pilih akses demo 1-tap.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      {from && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
          Silakan login terlebih dahulu untuk mengakses halaman <strong>{from}</strong>.
        </div>
      )}

      {/* Form Login Kredensial Email & Password */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>Login Akun</span>
        </div>

        <form action={loginWithEmailAction} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                defaultValue="owner@barbercraft.com"
                placeholder="nama@email.com"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                defaultValue="barber123"
                placeholder="Password"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            Masuk ke Sistem
          </button>
        </form>
      </div>

      {/* 1-Tap Demo Role Switchers */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
          Akses Cepat 1-Tap (Demo Role)
        </span>

        <div className="space-y-2">
          {/* Owner */}
          <form action={quickLoginAsRoleAction.bind(null, "owner")}>
            <button
              type="submit"
              className="w-full p-3 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                    Owner Bisnis (3 Cabang)
                  </h4>
                  <p className="text-[10px] text-zinc-400">Dashboard omzet & KPI</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Admin */}
          <form action={quickLoginAsRoleAction.bind(null, "admin")}>
            <button
              type="submit"
              className="w-full p-3 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                    Admin Operasional
                  </h4>
                  <p className="text-[10px] text-zinc-400">Katalog layanan & shift</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Staff / Barber */}
          <form action={quickLoginAsRoleAction.bind(null, "staff")}>
            <button
              type="submit"
              className="w-full p-3 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Barber / Kasir Cabang
                  </h4>
                  <p className="text-[10px] text-zinc-400">Papan antrean & walk-in POS</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>

          {/* Customer */}
          <form action={quickLoginAsRoleAction.bind(null, "customer")}>
            <button
              type="submit"
              className="w-full p-3 rounded-xl bg-[#20242B] hover:bg-[#282E37] border border-[#303642] flex items-center justify-between text-left group transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
                    Pelanggan (Raditya Dika)
                  </h4>
                  <p className="text-[10px] text-zinc-400">Booking & resep tersimpan</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
