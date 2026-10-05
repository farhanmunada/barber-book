"use client";

import { ServiceItem } from "@/lib/types";
import { Scissors, Clock } from "lucide-react";

interface ServiceSelectorProps {
  services: ServiceItem[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
}

export function ServiceSelector({
  services,
  selectedServiceIds,
  onToggleService,
}: ServiceSelectorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
            2
          </span>
          <Scissors className="w-5 h-5 text-amber-500 -rotate-45" />
          <h2>Pilih Layanan (Multi-Select)</h2>
        </div>
        <span className="text-xs text-zinc-400">Ketuk untuk menambah / hapus</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const isSelected = selectedServiceIds.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggleService(s.id)}
              className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500"
                  : "bg-[#1A1D21] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{s.name}</span>
                  <span className="font-bold text-sm text-amber-400">
                    Rp {s.price.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">{s.description}</p>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 pt-2 border-t border-[#2B3039]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {s.durationMinutes} Menit
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isSelected ? "bg-amber-500 text-black" : "bg-[#252A31] text-zinc-400"
                  }`}
                >
                  {isSelected ? "Terpilih" : "+ Pilih"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
