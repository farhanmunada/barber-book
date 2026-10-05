"use client";

import { useState } from "react";
import { BranchItem, ServiceItem, UserAccount } from "@/lib/mock-data";
import { createBranchAction, createServiceAction, createUserAction, deleteUserAction } from "@/app/actions/admin";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminManagementPanelProps {
  branches: BranchItem[];
  services: ServiceItem[];
  users: UserAccount[];
}

export function AdminManagementPanel({
  branches,
  services,
  users,
}: AdminManagementPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "branches" | "services">("users");

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[#2D3139] pb-3 overflow-x-auto">
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
          <span>Kelola Akun & Kredensial Staf ({users.length})</span>
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

      {/* TAB 1: KELOLA PENGGUNA & KREDENSIAL */}
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

      {/* TAB 2: KELOLA CABANG */}
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

      {/* TAB 3: MASTER LAYANAN & TARIF */}
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
