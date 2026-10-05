"use client";

import { useState } from "react";
import { BranchItem, BarberItem, ServiceItem, BookingRecord, HaircutBlueprint } from "@/lib/mock-data";
import { submitWalkInAction, updateQueueStatusAction } from "@/app/actions/booking";
import { HaircutBlueprintDialog } from "@/components/recipe/haircut-blueprint-dialog";
import {
  Scissors,
  UserPlus,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  FileText,
  User,
} from "lucide-react";
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

  // Fast Walk-in Form state (<10 seconds entry)
  const [walkInName, setWalkInName] = useState<string>("");
  const [walkInPhone, setWalkInPhone] = useState<string>("");
  const [selectedBarberId, setSelectedBarberId] = useState<string>(
    barbers[0]?.id || ""
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    services[0]?.id || "",
  ]);

  const [isSubmittingWalkIn, setIsSubmittingWalkIn] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Haircut Blueprint Dialog state
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);
  const [activeBookingForRecipe, setActiveBookingForRecipe] = useState<BookingRecord | null>(
    null
  );

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) {
      setMessage({ type: "error", text: "Nama tamu walk-in wajib diisi." });
      return;
    }

    setIsSubmittingWalkIn(true);
    setMessage(null);

    const res = await submitWalkInAction({
      branchId: branch.id,
      barberId: selectedBarberId,
      customerName: walkInName,
      customerPhone: walkInPhone || undefined,
      serviceIds: selectedServiceIds,
    });

    setIsSubmittingWalkIn(false);

    if (res.success && res.booking) {
      setMessage({
        type: "success",
        text: `Tiket ${res.booking.queueNumber} (${res.booking.customerName}) berhasil diterbitkan!`,
      });
      setWalkInName("");
      setWalkInPhone("");
      router.refresh();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menerbitkan tiket walk-in." });
    }
  };

  const handleStatusChange = async (
    booking: BookingRecord,
    nextStatus: "waiting" | "in_progress" | "completed" | "cancelled"
  ) => {
    if (nextStatus === "completed") {
      // Trigger blueprint dialog on finish
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

      {/* FAST WALK-IN ENTRY FORM (<10 seconds entry) */}
      <section className="bg-[#16181C] border-2 border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-lg shadow-amber-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <UserPlus className="w-4 h-4 text-amber-500" />
            <span>Fast Walk-In Entry (Tamu Datang Langsung)</span>
          </div>
          <span className="text-[11px] text-amber-400 font-semibold">1-Tap Assign</span>
        </div>

        <form onSubmit={handleWalkInSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Input Nama Tamu */}
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

            {/* Input HP Opsional */}
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

            {/* Barber Selector */}
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

          {/* Quick Service Chips */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-semibold text-zinc-300">
              Layanan (Ketuk untuk pilih):
            </span>
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
                        ? "bg-amber-500 text-black border-amber-500 font-bold"
                        : "bg-[#20242B] border-[#2D3139] text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="ml-1 opacity-80">(Rp {s.price / 1000}k)</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmittingWalkIn}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 active:scale-95 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmittingWalkIn ? "Menerbitkan..." : "Cetak & Masuk Antrean"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* LIVE KANBAN QUEUE BOARD (Waiting, In-Progress, Completed) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KOLOM 1: MENUNGGU (WAITING) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2D3139]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Menunggu ({waitingBookings.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-400">Queue List</span>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {waitingBookings.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#1A1D21]/50 border border-[#2D3139] text-center text-xs text-zinc-500">
                Tidak ada antrean menunggu
              </div>
            ) : (
              waitingBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#1A1D21] border border-[#2D3139] rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base font-black text-amber-400 font-sans">
                        {b.queueNumber}
                      </span>
                      <h4 className="font-bold text-white text-sm">{b.customerName}</h4>
                      <p className="text-xs text-zinc-400">Barber: {b.barberName}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#252A31] text-zinc-300 font-semibold">
                      {b.bookingType === "online_slot" ? b.slotTime : "Walk-in"}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 pt-2 border-t border-[#262A31]">
                    {b.services.join(", ")}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b, "in_progress")}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Duduk di Kursi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b, "cancelled")}
                      className="p-1.5 rounded-lg bg-[#252A31] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Batalkan / Tamu Tidak Hadir"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KOLOM 2: SEDANG DIPOTONG (IN-PROGRESS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2D3139]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Scissors className="w-4 h-4 text-emerald-400" />
              <span>Di Kursi Potong ({inProgressBookings.length})</span>
            </h3>
            <span className="text-[11px] text-emerald-400 font-bold">Cutting</span>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {inProgressBookings.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#1A1D21]/50 border border-[#2D3139] text-center text-xs text-zinc-500">
                Semua kursi barber kosong
              </div>
            ) : (
              inProgressBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#1A1D21] border-2 border-emerald-500/60 rounded-xl p-4 space-y-3 shadow-lg shadow-emerald-500/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-lg font-black text-emerald-400 font-sans">
                        {b.queueNumber}
                      </span>
                      <h4 className="font-bold text-white text-sm">{b.customerName}</h4>
                      <p className="text-xs text-zinc-400">Barber: {b.barberName}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase">
                      Active
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 pt-2 border-t border-[#262A31]">
                    {b.services.join(", ")}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(b, "completed")}
                      className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Selesai & Catat Resep</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KOLOM 3: SELESAI (COMPLETED) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#2D3139]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
              <span>Selesai Dipotong ({completedBookings.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-400">History Today</span>
          </div>

          <div className="space-y-3 min-h-[200px]">
            {completedBookings.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#1A1D21]/50 border border-[#2D3139] text-center text-xs text-zinc-500">
                Belum ada tiket selesai hari ini
              </div>
            ) : (
              completedBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#1A1D21] border border-[#2D3139] rounded-xl p-3.5 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-400 text-xs">{b.queueNumber}</span>
                      <h4 className="font-semibold text-white text-xs">{b.customerName}</h4>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      Barber: {b.barberName} &bull; Rp {b.totalPrice.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <span className="text-emerald-400 text-xs font-bold">Lunas</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* MODAL BLUEPRINT RESEP POTONG RAMBUT */}
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
          existingRecipe={recipes.find(
            (r) =>
              r.customerName.toLowerCase() ===
              activeBookingForRecipe.customerName.toLowerCase()
          )}
          onSaved={() => {
            setMessage({
              type: "success",
              text: `Resep gaya potong ${activeBookingForRecipe.customerName} berhasil disimpan ke sistem!`,
            });
            setTimeout(() => setMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
}
