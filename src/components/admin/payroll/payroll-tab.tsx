"use client";

import { PayrollRecord } from "@/lib/types";
import { PayrollCard } from "./payroll-card";
import { Calendar, CreditCard, Sparkles } from "lucide-react";

interface PayrollTabProps {
  payrolls: PayrollRecord[];
  currentWeek: { periodStart: string; periodEnd: string };
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PayrollTab({
  payrolls,
  currentWeek,
  onSuccess,
  onError,
}: PayrollTabProps) {
  const pendingPayrolls = payrolls.filter((p) => p.status === "pending");
  const paidPayrolls = payrolls.filter((p) => p.status === "paid");
  const pendingTotalPayout = pendingPayrolls.reduce((sum, p) => sum + p.totalPayout, 0);
  const totalPayrollAmount = payrolls.reduce((sum, p) => sum + p.totalPayout, 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 block font-medium">Periode Kerja Mingguan</span>
          <div className="flex items-center gap-1.5 text-white font-bold text-sm">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>{currentWeek.periodStart} s/d {currentWeek.periodEnd}</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Siklus gaji: Setiap 1 minggu</span>
        </div>

        <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 block font-medium">Total Beban Gaji Minggu Ini</span>
          <span className="text-xl font-black text-white block">
            Rp {totalPayrollAmount.toLocaleString("id-ID")}
          </span>
          <span className="text-[10px] text-zinc-500 block">Gapok + Komisi 20% + Bonus Target</span>
        </div>

        <div className="bg-[#1A1D21] border border-red-500/30 rounded-2xl p-4 space-y-1 bg-red-500/5">
          <span className="text-[11px] text-red-400 block font-bold">Wajib Transfer (Pending)</span>
          <span className="text-xl font-black text-red-400 block">
            {pendingPayrolls.length} Karyawan
          </span>
          <span className="text-[10px] text-zinc-400 block">
            Rp {pendingTotalPayout.toLocaleString("id-ID")} belum ditransfer
          </span>
        </div>

        <div className="bg-[#1A1D21] border border-emerald-500/30 rounded-2xl p-4 space-y-1 bg-emerald-500/5">
          <span className="text-[11px] text-emerald-400 block font-bold">Sudah Ditransfer (Lunas)</span>
          <span className="text-xl font-black text-emerald-400 block">
            {paidPayrolls.length} Karyawan
          </span>
          <span className="text-[10px] text-zinc-400 block">Telah diverifikasi Admin</span>
        </div>
      </div>

      {/* Rules and SOP banner */}
      <div className="bg-[#16181C] border border-[#262A31] rounded-2xl p-4 text-xs text-zinc-300 space-y-2">
        <div className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
          <Sparkles className="w-4 h-4" />
          <span>SOP & Aturan Penggajian Barbershop:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-zinc-400">
          <div className="bg-[#1F2228] p-3 rounded-xl border border-[#2D3139]">
            <strong className="text-white block mb-0.5">1. Gaji Pokok (UMR / 4)</strong>
            DKI Jakarta: Rp 1.337.500/minggu. Tangsel: Rp 1.237.500/minggu. Tanpa tunjangan.
          </div>
          <div className="bg-[#1F2228] p-3 rounded-xl border border-[#2D3139]">
            <strong className="text-white block mb-0.5">2. Komisi Layanan (20%)</strong>
            Barber menerima 20% dari total rupiah setiap layanan pelanggan yang selesai dicukur.
          </div>
          <div className="bg-[#1F2228] p-3 rounded-xl border border-[#2D3139]">
            <strong className="text-white block mb-0.5">3. Bonus Target Cabang &ge; 100 Jt</strong>
            Pool 2.5% omzet cabang cair & dibagi rata jika omzet cabang &ge; Rp 100.000.000 dalam 1 minggu.
          </div>
        </div>
      </div>

      {/* Staff Payroll Cards List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-500" />
          <span>Rincian Penggajian Staf & Eksekusi Transfer Mandiri</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {payrolls.map((p) => (
            <PayrollCard
              key={p.id}
              payroll={p}
              onSuccess={onSuccess}
              onError={onError}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
