import { registerCustomerAction } from "@/app/actions/auth";
import Link from "next/link";
import { Scissors, User, Mail, Phone, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
          <Scissors className="w-6 h-6 -rotate-45" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-tight">
          Daftar Akun Pelanggan
        </h1>
        <p className="text-xs text-zinc-400">
          Buat akun untuk simpan resep potong rambut & riwayat booking.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{decodeURIComponent(error)}</span>
        </div>
      )}

      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-4">
        <form action={registerCustomerAction} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Email / Username
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="nama@email.com"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                placeholder="0812xxxxxxx"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
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
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide uppercase transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            Daftar & Lanjut Booking
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-zinc-400 border-t border-[#262A31]">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-amber-400 hover:underline font-semibold">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
