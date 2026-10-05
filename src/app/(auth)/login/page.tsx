import { loginWithCredentialsAction } from "@/app/actions/auth";
import Link from "next/link";
import { Scissors, Lock, Mail, AlertCircle, Info } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { error, from } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <Scissors className="w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Masuk ke Akun Anda
        </h1>
        <p className="text-xs text-zinc-400">
          Masukkan username / email dan password terdaftar.
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
          Silakan login terlebih dahulu untuk mengakses menu <strong>{from}</strong>.
        </div>
      )}

      {/* Form Login Kredensial Nyata */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
        <form action={loginWithCredentialsAction} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Username atau Email
            </label>
            <div className="relative">
              <input
                type="text"
                name="identifier"
                required
                placeholder="nama@email.com atau username"
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
                placeholder="Masukkan password"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-[#262A31]">
          Pelanggan baru?{" "}
          <Link href="/register" className="text-amber-400 hover:underline font-semibold">
            Daftar akun di sini
          </Link>
        </div>
      </div>

      {/* Info Kredensial Awal untuk Evaluasi / Admin */}
      <div className="bg-[#16181C] border border-[#262A31] rounded-2xl p-4 space-y-2 text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Info className="w-3.5 h-3.5" />
          <span>Daftar Kredensial Awal Sistem:</span>
        </div>
        <ul className="space-y-1 pl-5 list-disc text-zinc-300">
          <li>
            <strong>Admin Operasional</strong>: <code className="text-amber-300">admin@barber.com</code> / <code className="text-amber-300">admin123</code> (Kelola semua data & akun staf)
          </li>
          <li>
            <strong>Owner Bisnis</strong>: <code className="text-amber-300">owner@barber.com</code> / <code className="text-amber-300">owner123</code> (Dashboard pantau omzet 3 cabang)
          </li>
          <li>
            <strong>Kasir / Barber Cabang</strong>: <code className="text-amber-300">kasir.kemang@barber.com</code> / <code className="text-amber-300">kasir123</code> (Papan antrean & walk-in)
          </li>
          <li>
            <strong>Pelanggan Terdaftar</strong>: <code className="text-amber-300">budi@gmail.com</code> / <code className="text-amber-300">budi123</code> (Booking & riwayat potong)
          </li>
        </ul>
      </div>
    </div>
  );
}
