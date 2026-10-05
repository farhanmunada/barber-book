"use client";

import { Phone, CheckCircle2, Lock } from "lucide-react";

interface CustomerInfoCardProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onChangePhone: (phone: string) => void;
}

export function CustomerInfoCard({
  customerName,
  customerEmail,
  customerPhone,
  onChangePhone,
}: CustomerInfoCardProps) {
  return (
    <section className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
            5
          </span>
          <Phone className="w-5 h-5 text-amber-500" />
          <h2>Identitas Pemesan (Terkoneksi Akun)</h2>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Akun Terverifikasi
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Nama Lengkap Pelanggan
          </label>
          <div className="relative">
            <input
              type="text"
              value={customerName}
              readOnly
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl pl-4 pr-10 py-3 text-sm text-zinc-200 cursor-not-allowed font-medium focus:outline-none"
            />
            <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Nama otomatis sinkron dari akun login ({customerEmail}).
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Nomor WhatsApp / HP Konfirmasi *
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => onChangePhone(e.target.value)}
            required
            placeholder="Contoh: 081299887711"
            className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 font-medium"
          />
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Digunakan untuk notifikasi tiket antrean live & verifikasi kasir.
          </span>
        </div>
      </div>
    </section>
  );
}
