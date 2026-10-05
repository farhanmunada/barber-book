"use client";

import { useState } from "react";
import { UserAccount, BranchItem } from "@/lib/types";
import { createUserAction, deleteUserAction } from "@/app/actions/admin";
import { Key, Plus, Trash2 } from "lucide-react";
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

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createUserAction(formData);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess("Akun pengguna & kredensial berhasil dibuat!");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      onError(res.error || "Gagal membuat akun.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Hapus pengguna ini dari sistem?")) return;
    const res = await deleteUserAction(userId);
    if (res.success) {
      onSuccess("Akun berhasil dihapus.");
      router.refresh();
    } else {
      onError(res.error || "Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create User Form */}
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

      {/* User Table List */}
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
  );
}
