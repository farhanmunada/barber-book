import { loginWithCredentialsAction, loginWithGoogleAction } from "@/app/actions/auth";
import Link from "next/link";
import { Scissors, Lock, Mail, AlertCircle, Info, UserPlus } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string; reason?: string }>;
}) {
  const { error, from, reason } = await searchParams;

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
          Gunakan username / email atau akun Google terdaftar.
        </p>
      </div>

      {reason === "booking_required" && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <Info className="w-4 h-4" />
            <span>Akun Diperlukan untuk Booking Online</span>
          </div>
          <p className="text-zinc-300">
            Pelanggan wajib memiliki akun login agar riwayat potongan rambut, tiket antrean, dan data reservasi tersimpan rapi.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      {from && from !== "/book" && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
          Silakan login terlebih dahulu untuk mengakses menu <strong>{from}</strong>.
        </div>
      )}

      {/* Box Login */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-5 shadow-xl shadow-black/40">
        {/* 1. Opsi Login Google (Neon Auth OAuth) */}
        <form action={loginWithGoogleAction}>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#252A31] hover:bg-[#2F3642] border border-[#3A404D] text-zinc-200 text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Akun Google</span>
          </button>
        </form>

        {/* Pemisah ATAU */}
        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#2D3139] w-full" />
          <span className="bg-[#1A1D21] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            Atau Email & Password
          </span>
          <div className="border-t border-[#2D3139] w-full" />
        </div>

        {/* 2. Form Login Kredensial Registrasi Sendiri */}
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
            Masuk ke Akun
          </button>
        </form>

        {/* CTA Daftar Akun Mandiri */}
        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-[#262A31]">
          Belum punya akun pelanggan?{" "}
          <Link
            href="/register"
            className="text-amber-400 hover:underline font-bold inline-flex items-center gap-1 ml-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Daftar Akun Baru
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
            <strong>Admin Operasional</strong>: <code className="text-amber-300">admin@barber.com</code> / <code className="text-amber-300">admin123</code>
          </li>
          <li>
            <strong>Owner Bisnis</strong>: <code className="text-amber-300">owner@barber.com</code> / <code className="text-amber-300">owner123</code> (Mode monitor)
          </li>
          <li>
            <strong>Kasir / Barber Cabang</strong>: <code className="text-amber-300">kasir.kemang@barber.com</code> / <code className="text-amber-300">kasir123</code>
          </li>
          <li>
            <strong>Pelanggan Terdaftar</strong>: <code className="text-amber-300">budi@gmail.com</code> / <code className="text-amber-300">budi123</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
