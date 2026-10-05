"use client";

import { useState } from "react";
import { UserAccount, BranchItem } from "@/lib/types";
import { createUserAction, deleteUserAction } from "@/app/actions/admin";
import {
  Key,
  Plus,
  Trash2,
  Scissors,
  Receipt,
  ShieldCheck,
  UserCheck,
  Landmark,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UsersTabProps {
  users: UserAccount[];
  branches: BranchItem[];
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function UsersTab({ users, branches, onSuccess, onError }: UsersTabProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState<"all" | "barber" | "cashier" | "mgmt">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Filter out public customer accounts from internal employee list
  const employeeUsers = users.filter((u) => u.role !== "customer");

  const filteredEmployees = employeeUsers.filter((u) => {
    if (filterCategory === "barber") {
      return u.role === "staff" && (!u.jobTitle || u.jobTitle.toLowerCase().includes("barber"));
    }
    if (filterCategory === "cashier") {
      return u.role === "staff" && u.jobTitle && u.jobTitle.toLowerCase().includes("kasir");
    }
    if (filterCategory === "mgmt") {
      return u.role === "admin" || u.role === "owner";
    }
    return true;
  });

  const barberCount = employeeUsers.filter((u) => !u.jobTitle || u.jobTitle.toLowerCase().includes("barber")).length;
  const cashierCount = employeeUsers.filter((u) => u.jobTitle && u.jobTitle.toLowerCase().includes("kasir")).length;
  const mgmtCount = employeeUsers.filter((u) => u.role === "admin" || u.role === "owner").length;

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess("Karyawan baru & rekening penggajian berhasil didaftarkan!");
      (e.target as HTMLFormElement).reset();
      setShowCreateForm(false);
      router.refresh();
    } else {
      onError(res.error || "Gagal mendaftarkan karyawan.");
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Hapus akun karyawan "${name}" dari sistem?`)) return;
    const res = await deleteUserAction(userId);
    if (res.success) {
      onSuccess(`Akun ${name} berhasil dihapus.`);
      router.refresh();
    } else {
      onError(res.error || "Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Internal Employees Only */}
      <div className="bg-[#16181C] border border-[#2D3139] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Pusat Data Karyawan Internal ({employeeUsers.length} Personel Aktif)
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kelola penugasan Barberman, Kasir, dan Manajerial. Registrasi akun pelanggan publik dilakukan terpisah secara mandiri.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all self-start sm:self-auto shadow-md shadow-amber-500/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{showCreateForm ? "Tutup Form" : "Tambah Karyawan Baru"}</span>
          {showCreateForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Form Tambah Karyawan Baru (Collapsible) */}
      {showCreateForm && (
        <div className="bg-[#1A1D21] border border-amber-500/40 rounded-2xl p-6 space-y-5 shadow-xl shadow-amber-500/5">
          <div className="flex items-center gap-2 text-white font-bold text-base border-b border-[#2D3139] pb-3">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Pendaftaran Karyawan Baru & Pengaturan Gaji</span>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            {/* Bagian 1: Data Identitas & Pekerjaan */}
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
                1. Identitas & Posisi Pekerjaan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Lengkap Karyawan *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Contoh: Reza Mahendra"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Posisi / Profesi *
                  </label>
                  <select
                    name="jobTitle"
                    required
                    defaultValue="Barberman Senior"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Barberman Senior">Barberman Senior</option>
                    <option value="Barberman (Fade Specialist)">Barberman (Fade Specialist)</option>
                    <option value="Barberman (Classic Specialist)">Barberman (Classic Specialist)</option>
                    <option value="Kasir / Front Desk">Kasir / Front Desk</option>
                    <option value="Admin Operasional">Admin Operasional</option>
                    <option value="Branch Manager">Branch Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Hak Akses (Role Sistem) *
                  </label>
                  <select
                    name="role"
                    required
                    defaultValue="staff"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="staff">Staff Cabang (Barberman / Kasir)</option>
                    <option value="admin">Admin Operasional</option>
                    <option value="owner">Owner Bisnis (View Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Tugaskan di Cabang *
                  </label>
                  <select
                    name="branchId"
                    defaultValue={branches[0]?.id || ""}
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Tidak terikat cabang (Admin/Owner)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Email / Akun Login *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="nama.cabang@barber.com"
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
            </div>

            {/* Bagian 2: Info Rekening Bank & Skema Gaji */}
            <div className="pt-3 border-t border-[#262A31]">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
                2. Pengaturan Penggajian & Rekening Bank
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Bank *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    defaultValue="BCA"
                    required
                    placeholder="BCA, Mandiri, BRI, BNI"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    name="bankAccountNumber"
                    placeholder="8820-xxx-xxx"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    name="bankAccountHolder"
                    placeholder="Nama di buku tabungan"
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Gaji Pokok Mingguan (Rp) *
                  </label>
                  <input
                    type="number"
                    name="baseSalaryWeekly"
                    defaultValue="1337500"
                    step="1000"
                    required
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Komisi Layanan (%) *
                  </label>
                  <input
                    type="number"
                    name="commissionRate"
                    defaultValue="20"
                    min="0"
                    max="100"
                    required
                    className="w-full bg-[#121316] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2.5 rounded-xl bg-[#252A31] text-zinc-300 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? "Mendaftarkan..." : "Daftarkan Karyawan & Simpan Rekening"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs by Profession */}
      <div className="flex gap-2 border-b border-[#2D3139] pb-3 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
            filterCategory === "all"
              ? "bg-amber-500 text-black"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          Semua Karyawan ({employeeUsers.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory("barber")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            filterCategory === "barber"
              ? "bg-amber-500 text-black"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Barberman ({barberCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory("cashier")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            filterCategory === "cashier"
              ? "bg-amber-500 text-black"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Kasir / Front Desk ({cashierCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory("mgmt")}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
            filterCategory === "mgmt"
              ? "bg-amber-500 text-black"
              : "bg-[#1A1D21] border border-[#2D3139] text-zinc-300 hover:border-zinc-500"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Manajemen ({mgmtCount})</span>
        </button>
      </div>

      {/* Grid of Employees Cards with Superior Readability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEmployees.map((u) => {
          const branch = branches.find((b) => b.id === u.branchId);
          const isBarber = !u.jobTitle || u.jobTitle.toLowerCase().includes("barber");
          const isCashier = u.jobTitle && u.jobTitle.toLowerCase().includes("kasir");

          return (
            <div
              key={u.id}
              className="bg-[#1A1D21] border border-[#2D3139] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#3E4552] transition-all"
            >
              <div>
                {/* Header: Name, Profession, Branch */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{u.name}</h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-black uppercase border ${
                          isBarber
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : isCashier
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {u.jobTitle || u.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      {branch ? (
                        <span className="font-medium text-zinc-200">📍 {branch.name}</span>
                      ) : (
                        <span className="text-zinc-500">Kantor Pusat</span>
                      )}
                      <span>&bull;</span>
                      <span className="uppercase text-[10px] text-zinc-500 font-bold">{u.role}</span>
                    </div>
                  </div>

                  {u.role !== "admin" && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Hapus Akun Karyawan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Contact & Credentials info */}
                <div className="mt-3 bg-[#141619] border border-[#262A31] rounded-xl p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <code className="text-zinc-200">{u.email}</code>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Phone className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payroll info: Bank details & Gapok */}
              <div className="pt-3 border-t border-[#262A31] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <Landmark className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  {u.bankAccountNumber ? (
                    <span>
                      <strong className="text-white">{u.bankName}</strong>: {u.bankAccountNumber} ({u.bankAccountHolder})
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic">Rekening belum diisi</span>
                  )}
                </div>

                <div className="text-right flex items-center justify-between sm:justify-end gap-3 text-[11px]">
                  <span className="text-zinc-400">
                    Gapok: <strong className="text-white">Rp {(u.baseSalaryWeekly || 0).toLocaleString("id-ID")}</strong>/mgg
                  </span>
                  {isBarber && (
                    <span className="px-2 py-0.5 rounded bg-[#252A31] text-amber-400 font-bold border border-[#3A404D]">
                      Komisi {u.commissionRate || 20}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
