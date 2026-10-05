"use client";

import { useState } from "react";
import { BranchItem, BarberItem, ServiceItem, BookingRecord, HaircutBlueprint } from "@/lib/types";
import { updateQueueStatusAction } from "@/app/actions/booking";
import { HaircutBlueprintDialog } from "@/components/recipe/haircut-blueprint-dialog";
import { WalkInForm } from "./walk-in-form";
import { QueueBookingCard } from "./queue-booking-card";
import { Scissors, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface BranchQueuePosProps {
  branch: BranchItem;
  barbers: BarberItem[];
  services: ServiceItem[];
  bookings: BookingRecord[];
  recipes: HaircutBlueprint[];
}

export function BranchQueuePos({
  branch,
  barbers,
  services,
  bookings,
  recipes,
}: BranchQueuePosProps) {
  const router = useRouter();

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Haircut Blueprint Dialog state
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);
  const [activeBookingForRecipe, setActiveBookingForRecipe] = useState<BookingRecord | null>(null);

  const handleStatusChange = async (
    booking: BookingRecord,
    nextStatus: "waiting" | "in_progress" | "completed" | "cancelled"
  ) => {
    if (nextStatus === "completed") {
      setActiveBookingForRecipe(booking);
      setIsBlueprintOpen(true);
      await updateQueueStatusAction(booking.id, branch.id, "completed", "cash");
      router.refresh();
      return;
    }

    await updateQueueStatusAction(booking.id, branch.id, nextStatus);
    router.refresh();
  };

  // Group bookings
  const waitingBookings = bookings.filter((b) => b.status === "waiting");
  const inProgressBookings = bookings.filter((b) => b.status === "in_progress");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const todayRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Find existing blueprint for active booking if any
  const existingRecipe = recipes.find(
    (r) =>
      (activeBookingForRecipe?.customerId && r.customerId === activeBookingForRecipe.customerId) ||
      r.customerName.toLowerCase() === activeBookingForRecipe?.customerName.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Top Banner / Cashier Stats */}
      <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">
            POS & Papan Antrean Cabang
          </span>
          <h1 className="text-2xl font-black text-white">{branch.name}</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{branch.address}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="block text-[11px] text-zinc-400">Total Tamu Hari Ini</span>
            <span className="text-xl font-bold text-white">
              {bookings.length} Pelanggan
            </span>
          </div>
          <div className="text-right border-l border-[#2D3139] pl-6">
            <span className="block text-[11px] text-zinc-400">Omzet Selesai Kasir</span>
            <span className="text-xl font-black text-amber-400">
              Rp {todayRevenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Fast Walk-In Entry Form */}
      <WalkInForm
        branch={branch}
        barbers={barbers}
        services={services}
        onSuccess={(text) => {
          setMessage({ type: "success", text });
          setTimeout(() => setMessage(null), 4000);
        }}
        onError={(text) => setMessage({ type: "error", text })}
      />

      {/* Live Active Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kursi Sedang Dicukur (In Progress) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
              <span>Sedang Di Kursi Cukur ({inProgressBookings.length})</span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">Live Service</span>
          </div>

          {inProgressBookings.length === 0 ? (
            <div className="bg-[#1A1D21] border border-dashed border-[#2D3139] rounded-2xl p-8 text-center text-xs text-zinc-500">
              Belum ada pelanggan yang sedang dicukur saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {inProgressBookings.map((b) => (
                <QueueBookingCard
                  key={b.id}
                  booking={b}
                  hasBlueprint={recipes.some(
                    (r) =>
                      (b.customerId && r.customerId === b.customerId) ||
                      r.customerName.toLowerCase() === b.customerName.toLowerCase()
                  )}
                  onOpenBlueprint={(booking) => {
                    setActiveBookingForRecipe(booking);
                    setIsBlueprintOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Antrean Menunggu (Waiting) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Antrean Menunggu ({waitingBookings.length})</span>
            </div>
            <span className="text-xs text-zinc-400">Next In Line</span>
          </div>

          {waitingBookings.length === 0 ? (
            <div className="bg-[#1A1D21] border border-dashed border-[#2D3139] rounded-2xl p-8 text-center text-xs text-zinc-500">
              Tidak ada antrean yang sedang menunggu.
            </div>
          ) : (
            <div className="space-y-3">
              {waitingBookings.map((b) => (
                <QueueBookingCard
                  key={b.id}
                  booking={b}
                  hasBlueprint={recipes.some(
                    (r) =>
                      (b.customerId && r.customerId === b.customerId) ||
                      r.customerName.toLowerCase() === b.customerName.toLowerCase()
                  )}
                  onOpenBlueprint={(booking) => {
                    setActiveBookingForRecipe(booking);
                    setIsBlueprintOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Haircut Anatomy Recipe Blueprint Dialog */}
      {activeBookingForRecipe && (
        <HaircutBlueprintDialog
          isOpen={isBlueprintOpen}
          onClose={() => {
            setIsBlueprintOpen(false);
            setActiveBookingForRecipe(null);
          }}
          customerName={activeBookingForRecipe.customerName}
          customerId={activeBookingForRecipe.customerId}
          barberId={activeBookingForRecipe.barberId}
          barberName={activeBookingForRecipe.barberName}
          branchId={branch.id}
          existingRecipe={existingRecipe}
          onSaved={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
