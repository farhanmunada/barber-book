"use client";

import { BranchItem, BarberItem } from "@/lib/types";
import { MapPin, CheckCircle2 } from "lucide-react";

interface BranchSelectorProps {
  branches: BranchItem[];
  selectedBranchId: string;
  barbers: BarberItem[];
  onSelectBranch: (branchId: string, autoBarberId?: string) => void;
}

export function BranchSelector({
  branches,
  selectedBranchId,
  barbers,
  onSelectBranch,
}: BranchSelectorProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-white font-bold text-lg">
        <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
          1
        </span>
        <MapPin className="w-5 h-5 text-amber-500" />
        <h2>Pilih Cabang Barbershop</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {branches.map((b) => {
          const isSelected = selectedBranchId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                const firstBarber = barbers.find((brb) => brb.branchId === b.id);
                onSelectBranch(b.id, firstBarber?.id);
              }}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? "bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                  : "bg-[#1A1D21] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{b.name}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{b.address}</p>
              <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded bg-[#121316] text-zinc-400 border border-[#2B303A]">
                {b.openTime} - {b.closeTime}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
