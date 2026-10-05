"use client";

import { useState } from "react";
import { BranchItem, BarberItem, ServiceItem } from "@/lib/types";
import { submitWalkInAction } from "@/app/actions/booking";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface WalkInFormProps {
  branch: BranchItem;
  barbers: BarberItem[];
  services: ServiceItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function WalkInForm({
  branch,
  barbers,
  services,
  onSuccess,
  onError,
}: WalkInFormProps) {
  const router = useRouter();
  const [walkInName, setWalkInName] = useState<string>("");
  const [walkInPhone, setWalkInPhone] = useState<string>("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    barbers[0]?.id || ""
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    services[0]?.id || "",
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      onError("Nama tamu walk-in wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitWalkInAction({
      branchId: branch.id,
      barberId: selectedBarberId,
      customerName: walkInName,
      customerPhone: walkInPhone || undefined,
      serviceIds: selectedServiceIds,
    });
    setIsSubmitting(false);

    if (res.success && res.booking) {
      onSuccess(`Tiket ${res.booking.queueNumber} (${res.booking.customerName}) berhasil diterbitkan!`);
      setWalkInName("");
      setWalkInPhone("");
      router.refresh();
    } else {
      onError(res.error || "Gagal menerbitkan tiket walk-in.");
    }
  };

  return (
    <section className="bg-[#16181C] border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-500/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <UserPlus className="w-4 h-4 text-amber-500" />
          <span>Fast Walk-In Entry (Tamu Datang Langsung)</span>
        </div>
        <span className="text-[11px] text-amber-400 font-semibold">1-Tap Assign</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Nama Tamu (Cepat) *
            </label>
            <input
              type="text"
              required
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="Contoh: Pak Budi"
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Nomor WhatsApp (Opsional)
            </label>
            <input
              type="tel"
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              placeholder="0812xxxx"
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
              Pilih Barberman Bertugas
            </label>
            <select
              value={selectedBarberId}
              onChange={(e) => setSelectedBarberId(e.target.value)}
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Layanan Chips */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
            Layanan Terpilih:
          </label>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const active = selectedServiceIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    active
                      ? "bg-amber-500 text-black border-amber-500"
                      : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                  }`}
                >
                  {s.name} - Rp {s.price.toLocaleString("id-ID")}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? "Menerbitkan..." : "Terbitkan Tiket Walk-In (<10 Detik)"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
