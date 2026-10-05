"use client";

import { useState } from "react";
import { BranchItem, BarberItem, ServiceItem, BookingRecord } from "@/lib/mock-data";
import { TIME_SLOTS } from "@/lib/constants";
import { submitOnlineBookingAction } from "@/app/actions/booking";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Sparkles,
  Lock,
} from "lucide-react";

interface BookingWizardProps {
  branches: BranchItem[];
  barbers: BarberItem[];
  services: ServiceItem[];
  existingBookings?: BookingRecord[];
  initialBranchId?: string;
  initialCustomerName?: string;
  initialCustomerPhone?: string;
}

export function BookingWizard({
  branches,
  barbers,
  services,
  existingBookings = [],
  initialBranchId,
  initialCustomerName = "",
  initialCustomerPhone = "",
}: BookingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchParam = searchParams.get("branch") || initialBranchId;

  // Selected states
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    branchParam || branches[0]?.id || ""
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([
    services[0]?.id || "",
  ]);
  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  
  // Date selection: Generate next 7 days
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

  // Customer Contact
  const [customerName, setCustomerName] = useState<string>(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState<string>(initialCustomerPhone);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter barbers by selected branch
  const availableBarbers = barbers.filter((b) => b.branchId === selectedBranchId);

  // Auto-select first barber of branch if not set
  if (!selectedBarberId && availableBarbers.length > 0) {
    setSelectedBarberId(availableBarbers[0].id);
  }

  // Calculate totals
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

      {/* STEP 1: Pilih Cabang */}
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
                  setSelectedBranchId(b.id);
                  const firstBarber = barbers.find((brb) => brb.branchId === b.id);
                  if (firstBarber) setSelectedBarberId(firstBarber.id);
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

      {/* STEP 2: Pilih Layanan (Tap-First Multi-select Chips) */}
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
                onClick={() => toggleService(s.id)}
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

      {/* STEP 3: Pilih Barber */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
            3
          </span>
          <User className="w-5 h-5 text-amber-500" />
          <h2>Pilih Barberman</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {availableBarbers.map((barber) => {
            const isSelected = selectedBarberId === barber.id;
            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => setSelectedBarberId(barber.id)}
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

      {/* STEP 4: Tanggal & Grid Slot Jam (Tap-First) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
            4
          </span>
          <Calendar className="w-5 h-5 text-amber-500" />
          <h2>Pilih Jadwal & Slot Waktu</h2>
        </div>

        {/* 7-Day Date Strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {next7Days.map((d) => {
            const isSelected = selectedDate === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => setSelectedDate(d.dateStr)}
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

        {/* Time Slots Grid (Dengan Proteksi Slot Terlewat & Slot Penuh) */}
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

              // 1. Cek apakah slot sudah lewat untuk hari ini
              const now = new Date();
              const todayStr = now.toISOString().split("T")[0];
              const isDateToday = selectedDate === todayStr;
              const [slotH, slotM] = slot.split(":").map(Number);
              const slotMinutes = slotH * 60 + slotM;
              const currentMinutes = now.getHours() * 60 + now.getMinutes();
              const isPast = isDateToday && slotMinutes <= currentMinutes;

              // 2. Cek apakah slot sudah dibooking di barber & cabang & tanggal ini
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
                  onClick={() => !isLocked && setSelectedSlot(slot)}
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

      {/* STEP 5: Data Kontak & Konfirmasi */}
      <section className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">
            5
          </span>
          <Phone className="w-5 h-5 text-amber-500" />
          <h2>Kontak Pemesan</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nomor WhatsApp / HP
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="0812xxxxxxx"
              className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Ringkasan & Submit */}
        <div className="pt-6 border-t border-[#2D3139] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-zinc-400 block">Total Estimasi ({totalDuration} Menit)</span>
            <span className="text-2xl font-black text-amber-400">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleBooking}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Konfirmasi Reservasi Sekarang</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
