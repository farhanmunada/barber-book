"use client";

import { useState } from "react";
import { BranchItem, ServiceItem, UserAccount, PayrollRecord } from "@/lib/types";
import { PayrollTab } from "./payroll/payroll-tab";
import { UsersTab } from "./users/users-tab";
import { BranchesTab } from "./branches/branches-tab";
import { ServicesTab } from "./services/services-tab";
import {
  Users,
  Store,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Banknote,
  AlertTriangle,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"payroll" | "users" | "branches" | "services">("payroll");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const pendingPayrolls = payrolls.filter((p) => p.status === "pending");
  const pendingTotalPayout = pendingPayrolls.reduce((sum, p) => sum + p.totalPayout, 0);

  const handleSuccess = (text: string) => {
    setMessage({ type: "success", text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleError = (text: string) => {
    setMessage({ type: "error", text });
  };

  return (
    <div className="space-y-6">
      {/* Unpaid Payroll Alert Banner */}
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
                Periode minggu ini ({currentWeek.periodStart} s/d {currentWeek.periodEnd}). Total yang harus ditransfer:{" "}
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

      {/* Global feedback message banner */}
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

      {/* Active Tab Views */}
      {activeTab === "payroll" && (
        <PayrollTab
          payrolls={payrolls}
          currentWeek={currentWeek}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {activeTab === "users" && (
        <UsersTab
          users={users}
          branches={branches}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {activeTab === "branches" && (
        <BranchesTab
          branches={branches}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}

      {activeTab === "services" && (
        <ServicesTab
          services={services}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )}
    </div>
  );
}
