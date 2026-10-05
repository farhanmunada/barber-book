"use client";

import { useState } from "react";
import { BranchItem, BookingRecord } from "@/lib/mock-data";
import { Clock, Scissors, UserCheck, AlertCircle, Sparkles, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface LiveQueueTrackerProps {
  branches: BranchItem[];
  bookings: BookingRecord[];
  highlightId?: string;
}

export function LiveQueueTracker({
  branches,
  bookings,
  highlightId,
}: LiveQueueTrackerProps) {
  const router = useRouter();
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branches[0]?.id || ""
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const branchBookings = bookings.filter((b) => b.branchId === selectedBranchId);
  const inProgressList = branchBookings.filter((b) => b.status === "in_progress");
  const waitingList = branchBookings.filter((b) => b.status === "waiting");
  const completedList = branchBookings.filter((b) => b.status === "completed").slice(0, 5);

  const highlightedBooking = bookings.find((b) => b.id === highlightId);

  return (
    <div className="space-y-8">
      {/* Highlighted Booking Ticket if just booked */}
      {highlightedBooking && (
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500 rounded-3xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Tiket Antrean Anda
            </span>
            <span className="text-xs text-amber-400 font-bold">
              {highlightedBooking.bookingType === "online_slot" ? "Reservasi Online" : "Walk-in"}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div>
              <span className="text-xs text-zinc-400 block">Nomor Antrean</span>
              <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight font-sans">
                {highlightedBooking.queueNumber}
              </span>
              <p className="text-sm font-semibold text-white mt-1">
                {highlightedBooking.customerName} &bull; {highlightedBooking.barberName}
              </p>
              {highlightedBooking.slotTime && (
                <p className="text-xs text-zinc-400 mt-0.5">
                  Slot Jam: <span className="text-white font-bold">{highlightedBooking.slotTime}</span> WIB
                </p>
              )}
            </div>

            <div className="bg-[#121316]/80 border border-amber-500/30 rounded-2xl p-4 md:w-80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Status Saat Ini:</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold capitalize">
                  {highlightedBooking.status === "waiting"
                    ? "Menunggu Giliran"
                    : highlightedBooking.status === "in_progress"
                    ? "Sedang Dipotong"
                    : "Selesai"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Layanan:</span>
                <span className="text-zinc-200 font-medium truncate max-w-[160px]">
                  {highlightedBooking.services.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Branch Tabs & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {branches.map((b) => {
            const isSelected = selectedBranchId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBranchId(b.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20"
                    : "bg-[#1A1D21] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A1D21] hover:bg-[#252A31] border border-[#2D3139] text-xs font-semibold text-zinc-300 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Live Board Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Sedang Dipotong (In-Progress) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Scissors className="w-4 h-4 text-emerald-400" />
              <span>Sedang Di Kursi Potong ({inProgressList.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Live Barber Chair</span>
          </div>

          {inProgressList.length === 0 ? (
            <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">
                Saat ini semua kursi sedang kosong atau menunggu giliran berikutnya.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inProgressList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1D21] border-2 border-emerald-500/50 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg shadow-emerald-500/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl">
                      {item.queueNumber}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">{item.customerName}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Barber: <span className="text-emerald-400 font-semibold">{item.barberName}</span>
                      </p>
                      <span className="inline-block text-[11px] text-zinc-500 mt-1">
                        {item.services.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                      Cutting
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kolom 2: Antrean Menunggu (Waiting) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Menunggu Giliran ({waitingList.length})</span>
            </h3>
            <span className="text-xs text-zinc-400">Urutan Antrean Hari Ini</span>
          </div>

          {waitingList.length === 0 ? (
            <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-8 text-center space-y-2">
              <UserCheck className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-semibold text-zinc-400">
                Tidak ada antrean menunggu saat ini. Silakan langsung pesan atau walk-in!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {waitingList.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-lg">
                      {item.queueNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.customerName}</h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252A31] text-zinc-400">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Barber: <span className="text-zinc-200">{item.barberName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">
                      {item.slotTime ? `Slot ${item.slotTime}` : "Walk-in"}
                    </span>
                    <span className="text-[10px] text-zinc-500">Estimasi ~{25 * (index + 1)} m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Selesai Hari Ini */}
      {completedList.length > 0 && (
        <div className="bg-[#16181C] border border-[#2D3139] rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Selesai Dipotong Hari Ini ({selectedBranchId.replace("branch-", "")})
          </h4>
          <div className="flex flex-wrap gap-2">
            {completedList.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-lg bg-[#20242B] border border-[#2D3139] text-xs text-zinc-300 font-medium flex items-center gap-2"
              >
                <span className="font-bold text-zinc-400">{c.queueNumber}</span>
                <span>{c.customerName}</span>
                <span className="text-emerald-400 text-[10px]">✓</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
