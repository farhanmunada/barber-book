"use client";

import { useState } from "react";
import { PayrollRecord } from "@/lib/types";
import { markPayrollPaidAction, updateStaffPayrollSettingsAction } from "@/app/actions/admin";
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Landmark,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PayrollCardProps {
  payroll: PayrollRecord;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function PayrollCard({ payroll: p, onSuccess, onError }: PayrollCardProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRefInput, setPaymentRefInput] = useState("");

  const isPaid = p.status === "paid";

  const handleCopy = () => {
    navigator.clipboard.writeText(p.bankAccountNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleMarkPaid = async () => {
    setIsSubmitting(true);
    const res = await markPayrollPaidAction(
      p.id,
      paymentRefInput || "Transfer Manual m-Banking",
      "Dikonfirmasi Admin"
    );
    setIsSubmitting(false);
    setIsPaying(false);
    setPaymentRefInput("");

    if (res.success) {
      onSuccess("Gaji staf berhasil ditandai Lunas Transfer!");
      router.refresh();
    } else {
      onError(res.error || "Gagal memperbarui status penggajian.");
    }
  };

  const handleUpdateStaffPayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateStaffPayrollSettingsAction(p.staffId, formData);
    setIsSubmitting(false);
    setIsEditing(false);

    if (res.success) {
      onSuccess("Data rekening & gapok staf berhasil diperbarui!");
      router.refresh();
    } else {
      onError(res.error || "Gagal memperbarui data staf.");
    }
  };

  return (
    <div
      className={`bg-[#1A1D21] border rounded-2xl p-5 space-y-4 transition-all ${
        isPaid ? "border-[#2D3139]" : "border-amber-500/40 shadow-lg shadow-amber-500/5"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262A31] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base">{p.staffName}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-[#252A31] text-amber-400 border border-[#3A404D]">
              {p.branchName}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">{p.staffEmail}</p>
        </div>

        <div className="flex items-center gap-3">
          {isPaid ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lunas Ditransfer</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Menunggu Transfer</span>
            </span>
          )}
          <span className="text-xl font-black text-amber-400">
            Rp {p.totalPayout.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Breakdown and Bank details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bank account */}
        <div className="bg-[#141619] border border-[#262A31] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-amber-500" />
              Rekening Bank Tujuan
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? "Batal" : "Ubah Rekening/Gapok"}</span>
            </button>
          </div>

          <div className="flex items-center justify-between bg-[#1B1E24] p-2.5 rounded-lg border border-[#2D3139]">
            <div>
              <span className="text-xs font-black text-white block">
                {p.bankName} - {p.bankAccountNumber}
              </span>
              <span className="text-[11px] text-zinc-400 block">
                a.n. {p.bankAccountHolder}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-[#252A31] hover:bg-[#303642] text-xs font-semibold text-zinc-200 flex items-center gap-1.5 transition-colors border border-[#3A404D]"
              title="Salin Nomor Rekening"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[11px]">Salin</span>
                </>
              )}
            </button>
          </div>

          {p.paymentReference && (
            <div className="text-[10px] text-zinc-500 pt-1">
              Catatan/Ref: <span className="text-zinc-300">{p.paymentReference}</span>
            </div>
          )}
        </div>

        {/* Salary components */}
        <div className="bg-[#141619] border border-[#262A31] rounded-xl p-3.5 space-y-2">
          <span className="text-[11px] font-bold text-zinc-400 block">
            Rincian Penghasilan Mingguan
          </span>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Gaji Pokok Mingguan:</span>
              <span className="font-semibold text-white">
                Rp {p.baseSalary.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Komisi Potong ({p.completedServicesCount} Kepala Selesai):</span>
              <span className="font-semibold text-emerald-400">
                + Rp {p.serviceCommission.toLocaleString("id-ID")}
              </span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Bonus Target Cabang 100 Jt:</span>
              <span className={p.branchTargetBonus > 0 ? "font-bold text-amber-400" : "text-zinc-500"}>
                {p.branchTargetBonus > 0
                  ? `+ Rp ${p.branchTargetBonus.toLocaleString("id-ID")}`
                  : "Rp 0 (Belum tembus)"}
              </span>
            </div>
            <div className="pt-1.5 border-t border-[#262A31] flex justify-between font-bold">
              <span className="text-white">Total Take Home Pay:</span>
              <span className="text-amber-400 text-sm">
                Rp {p.totalPayout.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editing form */}
      {isEditing && (
        <form
          onSubmit={handleUpdateStaffPayroll}
          className="p-4 rounded-xl bg-[#141619] border border-[#2D3139] space-y-3"
        >
          <h5 className="text-xs font-bold text-amber-400">
            Pengaturan Rekening & Tarif Penggajian: {p.staffName}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Nama Bank</label>
              <input
                type="text"
                name="bankName"
                defaultValue={p.bankName}
                required
                className="w-full bg-[#1B1E24] border border-[#2D3139] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Nomor Rekening</label>
              <input
                type="text"
                name="bankAccountNumber"
                defaultValue={p.bankAccountNumber}
                required
                className="w-full bg-[#1B1E24] border border-[#2D3139] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Nama Pemilik Rekening</label>
              <input
                type="text"
                name="bankAccountHolder"
                defaultValue={p.bankAccountHolder}
                required
                className="w-full bg-[#1B1E24] border border-[#2D3139] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Gaji Pokok Mingguan (Rp)</label>
              <input
                type="number"
                name="baseSalaryWeekly"
                defaultValue={p.baseSalary}
                required
                step="1000"
                className="w-full bg-[#1B1E24] border border-[#2D3139] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 mb-1">Persen Komisi Service (%)</label>
              <input
                type="number"
                name="commissionRate"
                defaultValue="20"
                required
                min="0"
                max="100"
                className="w-full bg-[#1B1E24] border border-[#2D3139] rounded-lg px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-[#252A31] text-zinc-300 text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      )}

      {/* Manual transfer confirmation action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <span className="text-[11px] text-zinc-500">
          Transfer manual via m-Banking admin, lalu konfirmasi setelah transfer berhasil.
        </span>

        {!isPaid && (
          <div className="flex items-center gap-2">
            {isPaying ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={paymentRefInput}
                  onChange={(e) => setPaymentRefInput(e.target.value)}
                  placeholder="No. Ref / Catatan transfer"
                  className="bg-[#141619] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleMarkPaid}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all active:scale-95"
                >
                  {isSubmitting ? "Menyimpan..." : "Konfirmasi Lunas"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaying(false)}
                  className="px-3 py-2 rounded-xl bg-[#252A31] text-zinc-400 text-xs"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPaying(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black font-black text-xs uppercase tracking-wider transition-all border border-emerald-500/30 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Tandai Sudah Ditransfer</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
