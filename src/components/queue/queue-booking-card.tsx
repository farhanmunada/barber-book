"use client";

import { BookingRecord, HaircutBlueprint } from "@/lib/types";
import { Scissors, Play, CheckCircle2, XCircle, FileText, User } from "lucide-react";

interface QueueBookingCardProps {
  booking: BookingRecord;
  hasBlueprint: boolean;
  onOpenBlueprint: (booking: BookingRecord) => void;
  onStatusChange: (
    booking: BookingRecord,
    nextStatus: "waiting" | "in_progress" | "completed" | "cancelled"
  ) => void;
}

export function QueueBookingCard({
  booking: b,
  hasBlueprint,
  onOpenBlueprint,
  onStatusChange,
}: QueueBookingCardProps) {
  const isInProgress = b.status === "in_progress";

  return (
    <div
      className={`bg-[#1A1D21] border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        isInProgress
          ? "border-amber-500/50 shadow-md shadow-amber-500/10"
          : "border-[#2D3139]"
      }`}
    >
      <div className="flex items-start sm:items-center gap-4">
        {/* Nomor Antrean */}
        <div
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-black ${
            isInProgress
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-[#252A31] text-white border border-[#3A404D]"
          }`}
        >
          <span className="text-base leading-none">{b.queueNumber}</span>
          <span className="text-[9px] uppercase tracking-wider mt-0.5 opacity-80">
            {b.bookingType === "online_slot" ? "Online" : "Walk-in"}
          </span>
        </div>

        {/* Data Pelanggan */}
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base">{b.customerName}</h4>
            {hasBlueprint && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold flex items-center gap-1">
                <FileText className="w-3 h-3" /> Resep Tersedia
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400 mt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              Barber: <strong className="text-zinc-200">{b.barberName}</strong>
            </span>
            <span>&bull;</span>
            <span>{b.services.join(", ")}</span>
            {b.slotTime && (
              <>
                <span>&bull;</span>
                <span className="text-amber-400 font-semibold">Slot: {b.slotTime} WIB</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        {/* Tombol Buka Blueprint Resep Rambut */}
        <button
          type="button"
          onClick={() => onOpenBlueprint(b)}
          className="p-2 rounded-xl bg-[#252A31] hover:bg-[#303640] border border-[#3A404D] text-zinc-300 hover:text-amber-400 transition-colors"
          title="Buka / Catat Resep Potong Rambut"
        >
          <Scissors className="w-4 h-4" />
        </button>

        {b.status === "waiting" && (
          <>
            <button
              type="button"
              onClick={() => onStatusChange(b, "in_progress")}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Mulai Cukur</span>
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(b, "cancelled")}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
              title="Batalkan Antrean"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {b.status === "in_progress" && (
          <button
            type="button"
            onClick={() => onStatusChange(b, "completed")}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Selesai & Kasir</span>
          </button>
        )}
      </div>
    </div>
  );
}
