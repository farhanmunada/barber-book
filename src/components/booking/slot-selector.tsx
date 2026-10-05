"use client";

import { BookingRecord } from "@/lib/types";
import { TIME_SLOTS } from "@/lib/constants";
import { Calendar, Lock } from "lucide-react";

interface SlotSelectorProps {
  days: Array<{ dateStr: string; dayName: string; formattedDate: string }>;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  selectedBranchId: string;
  selectedBarberId: string;
  existingBookings: BookingRecord[];
}

export function SlotSelector({
  days,
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  selectedBranchId,
  selectedBarberId,
  existingBookings,
}: SlotSelectorProps) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const isDateToday = selectedDate === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-white font-bold text-lg">
        <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
          4
        </span>
        <Calendar className="w-5 h-5 text-amber-500" />
        <h2>Pilih Jadwal & Slot Waktu</h2>
      </div>

      {/* 7-Day Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d) => {
          const isSelected = selectedDate === d.dateStr;
          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => onSelectDate(d.dateStr)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-amber-500 text-black border-amber-500 font-bold"
                  : "bg-[#1A1D21] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
              }`}
            >
              <span className="block text-xs uppercase tracking-wider">{d.dayName}</span>
              <span className="block text-sm font-semibold mt-0.5">{d.formattedDate}</span>
            </button>
          );
        })}
      </div>

      {/* Slot Grid */}
      <div className="bg-[#16181C] border border-[#2D3139] rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 gap-1">
          <span>Pilih jam kedatangan ({selectedDate}):</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Tersedia
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Penuh
            </span>
            <span className="flex items-center gap-1 text-zinc-600">
              <span className="w-2 h-2 rounded-full bg-zinc-700" /> Terlewat
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot;

            const [slotH, slotM] = slot.split(":").map(Number);
            const slotMinutes = slotH * 60 + slotM;
            const isPast = isDateToday && slotMinutes <= currentMinutes;

            const isBooked = existingBookings.some(
              (b) =>
                b.branchId === selectedBranchId &&
                b.barberId === selectedBarberId &&
                b.bookingDate === selectedDate &&
                b.slotTime === slot &&
                b.status !== "cancelled"
            );

            const isLocked = isPast || isBooked;

            return (
              <button
                key={slot}
                type="button"
                disabled={isLocked}
                onClick={() => !isLocked && onSelectSlot(slot)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border flex flex-col items-center justify-center gap-0.5 ${
                  isBooked
                    ? "bg-red-500/10 border-red-500/30 text-red-400 opacity-60 cursor-not-allowed"
                    : isPast
                    ? "bg-[#141518] border-[#22252C] text-zinc-600 opacity-40 cursor-not-allowed line-through"
                    : isSelected
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20 font-bold"
                    : "bg-[#1F232A] border-[#2D3139] text-zinc-200 hover:border-amber-500/40"
                }`}
              >
                <span className="text-sm">{slot}</span>
                {isBooked ? (
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Penuh
                  </span>
                ) : isPast ? (
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                    Terlewat
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">Tersedia</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
