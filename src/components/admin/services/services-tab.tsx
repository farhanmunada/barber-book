"use client";

import { useState } from "react";
import { ServiceItem } from "@/lib/types";
import { createServiceAction } from "@/app/actions/admin";
import { Scissors, Plus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ServicesTabProps {
  services: ServiceItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ServicesTab({ services, onSuccess, onError }: ServicesTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createServiceAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess("Layanan baru & tarif berhasil ditambahkan!");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      onError(res.error || "Gagal menambah layanan.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Service Form */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
          <span>Tambah Layanan & Tarif Baru</span>
        </div>

        <form onSubmit={handleCreateService} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Nama Layanan *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Hair Coloring Premium"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Tarif (Rupiah) *
              </label>
              <input
                type="number"
                name="price"
                required
                step="1000"
                placeholder="120000"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Durasi (Menit) *
              </label>
              <input
                type="number"
                name="durationMinutes"
                required
                defaultValue="45"
                className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Deskripsi Singkat Layanan
              </label>
              <input
                type="text"
                name="description"
                placeholder="Pewarnaan rambut semi-permanen dengan bleaching lembut dan nutrisi keratin."
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
              <span>{isSubmitting ? "Menyimpan..." : "Tambah Layanan"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-sm">{s.name}</h4>
                <span className="font-black text-amber-400 text-sm">
                  Rp {s.price.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.description}</p>
            </div>
            <div className="pt-2 border-t border-[#262A31] flex items-center justify-between text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {s.durationMinutes} Menit
              </span>
              <span className="text-emerald-400 font-semibold">Aktif</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
