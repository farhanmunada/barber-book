"use client";

import { useState } from "react";
import { BranchItem, BarberItem, ServiceItem, BookingRecord } from "@/lib/types";
import { submitOnlineBookingAction } from "@/app/actions/booking";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Sparkles } from "lucide-react";
import { BranchSelector } from "./branch-selector";
import { ServiceSelector } from "./service-selector";
import { BarberSelector } from "./barber-selector";
import { SlotSelector } from "./slot-selector";
import { CustomerInfoCard } from "./customer-info-card";

interface BookingWizardProps {
  branches: BranchItem[];
  barbers: BarberItem[];
  services: ServiceItem[];
  existingBookings?: BookingRecord[];
  initialBranchId?: string;
  customerProfile: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export function BookingWizard({
  branches,
  barbers,
  services,
  existingBookings = [],
  initialBranchId,
  customerProfile,
}: BookingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchParam = searchParams.get("branch") || initialBranchId;

  // Selected state
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branchParam || branches[0]?.id || ""
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    services[0]?.id || "",
  ]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");

  // 7-day date window
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = i === 0 ? "Hari Ini" : i === 1 ? "Besok" : d.toLocaleDateString("id-ID", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    return { dateStr, dayName, formattedDate };
  });

  const [selectedDate, setSelectedDate] = useState<string>(next7Days[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // Customer contact state
  const customerName = customerProfile.name;
  const [customerPhone, setCustomerPhone] = useState<string>(customerProfile.phone || "");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available barbers in selected branch
  const availableBarbers = barbers.filter((b) => b.branchId === selectedBranchId);

  // Auto-select first barber if not chosen
  if (!selectedBarberId && availableBarbers.length > 0) {
    setSelectedBarberId(availableBarbers[0].id);
  }

  // Totals calculation
  const selectedServicesList = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServicesList.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesList.reduce((sum, s) => sum + s.durationMinutes, 0);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const handleBooking = async () => {
    setErrorMessage(null);
    if (!customerName.trim()) {
      setErrorMessage("Silakan isi nama Anda.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("Silakan isi nomor WhatsApp Anda untuk notifikasi antrean.");
      return;
    }
    if (!selectedSlot) {
      setErrorMessage("Silakan pilih slot jam yang tersedia.");
      return;
    }

    setLoading(true);
    const res = await submitOnlineBookingAction({
      branchId: selectedBranchId,
      barberId: selectedBarberId,
      customerName,
      customerPhone,
      bookingDate: selectedDate,
      slotTime: selectedSlot,
      serviceIds: selectedServiceIds,
    });

    setLoading(false);

    if (res.success && res.booking) {
      router.push(`/queue?highlight=${res.booking.id}`);
    } else {
      setErrorMessage(res.error || "Terjadi kesalahan saat memproses booking.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Step 1: Branch Selector */}
      <BranchSelector
        branches={branches}
        selectedBranchId={selectedBranchId}
        barbers={barbers}
        onSelectBranch={(branchId, autoBarberId) => {
          setSelectedBranchId(branchId);
          if (autoBarberId) setSelectedBarberId(autoBarberId);
        }}
      />

      {/* Step 2: Service Multi-selector */}
      <ServiceSelector
        services={services}
        selectedServiceIds={selectedServiceIds}
        onToggleService={toggleService}
      />

      {/* Step 3: Barber Selector */}
      <BarberSelector
        barbers={availableBarbers}
        selectedBarberId={selectedBarberId}
        onSelectBarber={setSelectedBarberId}
      />

      {/* Step 4: Schedule and Slot Selector */}
      <SlotSelector
        days={next7Days}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        selectedBranchId={selectedBranchId}
        selectedBarberId={selectedBarberId}
        existingBookings={existingBookings}
      />

      {/* Step 5: Customer Profile Contact Info */}
      <CustomerInfoCard
        customerName={customerName}
        customerEmail={customerProfile.email}
        customerPhone={customerPhone}
        onChangePhone={setCustomerPhone}
      />

      {/* Sticky Bottom Summary Action Bar */}
      <div className="sticky bottom-4 z-20 bg-[#16181C]/95 backdrop-blur border border-amber-500/30 rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">
              Estimasi Total ({selectedServicesList.length} Layanan)
            </span>
            <span className="text-xl font-black text-amber-400">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="h-8 w-px bg-[#2B3039] hidden sm:block" />

          <div className="text-xs text-zinc-300 hidden sm:block">
            <span>Durasi: ~{totalDuration} Menit</span>
            <span className="block text-[11px] text-zinc-400">
              Slot: {selectedSlot ? `${selectedSlot} WIB` : "Belum dipilih"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBooking}
          disabled={loading || !selectedSlot}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Memproses..." : "Konfirmasi & Ambil Nomor Antrean"}</span>
        </button>
      </div>
    </div>
  );
}
