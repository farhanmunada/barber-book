"use client";

import { useState } from "react";
import { BranchItem } from "@/lib/types";
import { createBranchAction } from "@/app/actions/admin";
import { Store, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface BranchesTabProps {
  branches: BranchItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function BranchesTab({ branches, onSuccess, onError }: BranchesTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createBranchAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess("Cabang baru berhasil didaftarkan!");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      onError(res.error || "Gagal membuat cabang.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Branch Form */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Store className="w-4 h-4 text-amber-500" />
          <span>Buka Cabang Baru (Ekspansi Bisnis)</span>
        </div>

        <form onSubmit={handleCreateBranch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Nama Cabang *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: BarberCraft BSD City"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Nomor WhatsApp / Telp Cabang *
              </label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="0812-xxxx-xxxx"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Buka
                </label>
                <input
                  type="text"
                  name="openTime"
                  defaultValue="09:00"
                  className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Tutup
                </label>
                <input
                  type="text"
                  name="closeTime"
                  defaultValue="21:00"
                  className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Alamat Lengkap Cabang *
              </label>
              <input
                type="text"
                name="address"
                required
                placeholder="Jl. Pahlawan Serpong No. 8, Tangerang Selatan"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Menyimpan..." : "Daftarkan Cabang"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">{b.name}</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#252A31] text-amber-400 font-semibold">
                {b.openTime} - {b.closeTime}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{b.address}</p>
            <p className="text-[11px] text-zinc-500">Kontak: {b.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
