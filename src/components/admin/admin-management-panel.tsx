"use client";

import { useState } from "react";
import { BranchItem, ServiceItem, UserAccount, PayrollRecord } from "@/lib/mock-data";
import {
  createBranchAction,
  createServiceAction,
  createUserAction,
  deleteUserAction,
  markPayrollPaidAction,
  updateStaffPayrollSettingsAction,
} from "@/app/actions/admin";
import {
  Users,
  Store,
  Scissors,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Key,
  Clock,
  Phone,
  MapPin,
  DollarSign,
  Banknote,
  AlertTriangle,
  Copy,
  Check,
  CreditCard,
  Landmark,
  Edit3,
  Calendar,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminManagementPanelProps {
  branches: BranchItem[];
  services: ServiceItem[];
  users: UserAccount[];
  payrolls: PayrollRecord[];
  currentWeek: { periodStart: string; periodEnd: string };
}

export function AdminManagementPanel({
  branches,
  services,
  users,
  payrolls = [],
  currentWeek,
}: AdminManagementPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"payroll" | "users" | "branches" | "services">("payroll");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payroll specific states
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [payingPayrollId, setPayingPayrollId] = useState<string | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState<string>("");

  // Payroll stats
  const pendingPayrolls = payrolls.filter((p) => p.status === "pending");
  const paidPayrolls = payrolls.filter((p) => p.status === "paid");
  const pendingTotalPayout = pendingPayrolls.reduce((sum, p) => sum + p.totalPayout, 0);
  const totalPayrollAmount = payrolls.reduce((sum, p) => sum + p.totalPayout, 0);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Form states
  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Akun pengguna & kredensial berhasil dibuat!" });
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal membuat akun." });
    }
  };

  const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createBranchAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Cabang baru berhasil didaftarkan!" });
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal membuat cabang." });
    }
  };

  const handleCreateService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createServiceAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ type: "success", text: "Layanan baru & tarif berhasil ditambahkan!" });
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal menambah layanan." });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Hapus pengguna ini dari sistem?")) return;
    const res = await deleteUserAction(userId);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || "Gagal menghapus");
    }
  };

  const handleMarkPaid = async (payrollId: string) => {
    setIsSubmitting(true);
    const res = await markPayrollPaidAction(
      payrollId,
      paymentRefInput || "Transfer Manual m-Banking",
      "Dikonfirmasi Admin"
    );
    setIsSubmitting(false);
    setPayingPayrollId(null);
    setPaymentRefInput("");

    if (res.success) {
      setMessage({ type: "success", text: "Gaji staf berhasil ditandai Lunas Transfer!" });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal memperbarui status penggajian." });
    }
  };

  const handleUpdateStaffPayroll = async (e: React.FormEvent<HTMLFormElement>, userId: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateStaffPayrollSettingsAction(userId, formData);
    setIsSubmitting(false);
    setEditingStaffId(null);

    if (res.success) {
      setMessage({ type: "success", text: "Data rekening & gapok staf berhasil diperbarui!" });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: "error", text: res.error || "Gagal memperbarui data staf." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Peringatan Gaji Belum Selesai (Alert Banner) */}
      {pendingPayrolls.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400">
                PERINGATAN: Ada {pendingPayrolls.length} Karyawan Belum Ditransfer Gaji!
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                Periode minggu ini ({currentWeek.periodStart} s/d {currentWeek.periodEnd}). Total yang harus ditransfer mandiri:{" "}
                <strong className="text-white">Rp {pendingTotalPayout.toLocaleString("id-ID")}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("payroll")}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-black text-xs font-black uppercase tracking-wider transition-all self-start sm:self-auto"
          >
            Selesaikan Sekarang
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#2D3139] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("payroll")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === "payroll"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Penggajian Mingguan ({payrolls.length} Staf)</span>
          {pendingPayrolls.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === "users"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Akun & Kredensial Staf ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("branches")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === "branches"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Kelola Cabang ({branches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
            activeTab === "services"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Katalog Layanan & Tarif ({services.length})</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
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

      {/* TAB 1: PENGGAJIAN MINGGUAN (PAYROLL SYSTEM) */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Header Periode & Statistik */}
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

          {/* Aturan & Skema Penggajian Terbuka */}
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

          {/* Daftar Slip Penggajian Staf */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Rincian Penggajian Staf & Eksekusi Transfer Mandiri</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {payrolls.map((p) => {
                const isPaid = p.status === "paid";
                const isEditing = editingStaffId === p.staffId;
                const isPaying = payingPayrollId === p.id;
                const isCopied = copiedAccount === p.id;

                return (
                  <div
                    key={p.id}
                    className={`bg-[#1A1D21] border rounded-2xl p-5 space-y-4 transition-all ${
                      isPaid ? "border-[#2D3139]" : "border-amber-500/40 shadow-lg shadow-amber-500/5"
                    }`}
                  >
                    {/* Header Baris Staf */}
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

                    {/* Rincian Komponen Gaji & Info Bank */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Box 1: Rekening Tujuan Transfer */}
                      <div className="bg-[#141619] border border-[#262A31] rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-amber-500" />
                            Rekening Bank Tujuan
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingStaffId(isEditing ? null : p.staffId)}
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
                            onClick={() => handleCopy(p.bankAccountNumber, p.id)}
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

                      {/* Box 2: Rincian Gaji Pokok & Bonus */}
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
                            <span>
                              Komisi Potong ({p.completedServicesCount} Kepala Selesai):
                            </span>
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

                    {/* Form Edit Rekening & Gapok (Jika Toggle Dibuka) */}
                    {isEditing && (
                      <form
                        onSubmit={(e) => handleUpdateStaffPayroll(e, p.staffId)}
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
                              placeholder="BCA, Mandiri, BRI, BNI"
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
                              placeholder="1234567890"
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
                              placeholder="Nama sesuai buku tabungan"
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
                            onClick={() => setEditingStaffId(null)}
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

                    {/* Aksi Konfirmasi Transfer Mandiri */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <span className="text-[11px] text-zinc-500">
                        Transfer manual via m-Banking admin, lalu klik tombol konfirmasi di samping setelah transfer berhasil.
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
                                onClick={() => handleMarkPaid(p.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all active:scale-95"
                              >
                                {isSubmitting ? "Menyimpan..." : "Konfirmasi Lunas"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setPayingPayrollId(null)}
                                className="px-3 py-2 rounded-xl bg-[#252A31] text-zinc-400 text-xs"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPayingPayrollId(p.id)}
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
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KELOLA PENGGUNA & KREDENSIAL */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Form Buat User / Staf Baru */}
          <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Key className="w-4 h-4 text-amber-500" />
              <span>Tambah Akun Baru (Staf Kasir, Admin, atau Owner)</span>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Rian Barber"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Username / Email Login *
                  </label>
                  <input
                    type="text"
                    name="email"
                    required
                    placeholder="nama@barber.com atau username"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Password Awal *
                  </label>
                  <input
                    type="text"
                    name="password"
                    required
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Role Pengguna *
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue="staff"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="staff">Staff / Kasir Cabang</option>
                    <option value="admin">Admin Operasional</option>
                    <option value="owner">Owner Bisnis (View Only)</option>
                    <option value="customer">Pelanggan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Tugaskan di Cabang (Khusus Staf)
                  </label>
                  <select
                    name="branchId"
                    defaultValue={branches[0]?.id || ""}
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Tidak terikat cabang</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0812xxxx"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Menyimpan..." : "Buat Akun & Kredensial"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Pengguna Terdaftar */}
          <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-[#2D3139] flex items-center justify-between">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider">
                Daftar Kredensial Pengguna Aktif
              </h3>
              <span className="text-[11px] text-zinc-400">Total {users.length} Akun</span>
            </div>

            <div className="divide-y divide-[#262A31]">
              {users.map((u) => {
                const branch = branches.find((b) => b.id === u.branchId);
                return (
                  <div
                    key={u.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#20242B]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{u.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                            u.role === "admin"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : u.role === "owner"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : u.role === "staff"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          }`}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Username/Email: <code className="text-zinc-200">{u.email}</code>
                        {branch && (
                          <span className="ml-2 text-zinc-400">
                            &bull; Cabang: <strong className="text-white">{branch.name}</strong>
                          </span>
                        )}
                        {u.bankName && u.bankAccountNumber && (
                          <span className="ml-2 text-zinc-400">
                            &bull; Rek: <span className="text-amber-400 font-semibold">{u.bankName} {u.bankAccountNumber}</span>
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-zinc-500">
                        Password: <span className="text-emerald-400">Terenkripsi Bcrypt</span>
                      </span>
                      {u.role !== "admin" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KELOLA CABANG */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          {/* Form Buat Cabang Baru */}
          <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Buka Cabang Baru (Ekspansi Bisnis)</span>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Cabang *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: BarberCraft BSD City"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nomor WhatsApp / Telp Cabang *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="0812-xxxx-xxxx"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Buka
                    </label>
                    <input
                      type="text"
                      name="openTime"
                      defaultValue="09:00"
                      className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Tutup
                    </label>
                    <input
                      type="text"
                      name="closeTime"
                      defaultValue="21:00"
                      className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Alamat Lengkap Cabang *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="Jl. Pahlawan Serpong No. 8, Tangerang Selatan"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Menyimpan..." : "Daftarkan Cabang"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Cabang */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {branches.map((b) => (
              <div
                key={b.id}
                className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{b.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#252A31] text-amber-400 font-semibold">
                    {b.openTime} - {b.closeTime}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{b.address}</p>
                <p className="text-[11px] text-zinc-500">Kontak: {b.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER LAYANAN & TARIF */}
      {activeTab === "services" && (
        <div className="space-y-6">
          {/* Form Buat Layanan Baru */}
          <div className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Scissors className="w-4 h-4 text-amber-500 -rotate-45" />
              <span>Tambah Layanan & Tarif Baru</span>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Layanan *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Hair Coloring Premium"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Tarif (Rupiah) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="1000"
                    placeholder="120000"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Durasi (Menit) *
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    defaultValue="45"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Deskripsi Singkat Layanan
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Pewarnaan rambut semi-permanen dengan bleaching lembut dan nutrisi keratin."
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Menyimpan..." : "Tambah Layanan"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Grid Layanan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <span className="font-black text-amber-400 text-sm">
                      Rp {s.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{s.description}</p>
                </div>
                <div className="pt-2 border-t border-[#262A31] flex items-center justify-between text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {s.durationMinutes} Menit
                  </span>
                  <span className="text-emerald-400 font-semibold">Aktif</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
