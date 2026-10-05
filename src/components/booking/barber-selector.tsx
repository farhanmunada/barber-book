"use client";

import { BarberItem } from "@/lib/types";
import { User } from "lucide-react";

interface BarberSelectorProps {
  barbers: BarberItem[];
  selectedBarberId: string;
  onSelectBarber: (barberId: string) => void;
}

export function BarberSelector({
  barbers,
  selectedBarberId,
  onSelectBarber,
}: BarberSelectorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-white font-bold text-lg">
        <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
          3
        </span>
        <User className="w-5 h-5 text-amber-500" />
        <h2>Pilih Barberman</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {barbers.map((barber) => {
          const isSelected = selectedBarberId === barber.id;
          return (
            <button
              key={barber.id}
              type="button"
              onClick={() => onSelectBarber(barber.id)}
              className={`p-3.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500"
                  : "bg-[#1A1D21] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#252A31] border border-zinc-700 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={barber.avatarUrl}
                  alt={barber.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white truncate">{barber.name}</span>
                  <span className="text-[11px] text-amber-400 font-bold ml-1">
                    ★ {barber.rating}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{barber.specialty}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
