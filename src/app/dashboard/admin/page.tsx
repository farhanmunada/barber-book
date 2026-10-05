import { getBranches, getServices, getUsers } from "@/lib/store";
import { AdminManagementPanel } from "@/components/admin/admin-management-panel";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [branches, services, users] = await Promise.all([
    getBranches(),
    getServices(),
    getUsers(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2D3139] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Admin Operasional</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">
            Pengelolaan Seluruh Elemen Bisnis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Pusat kendali cabang, master tarif & layanan, serta manajemen akun & kredensial seluruh staf.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/owner"
            className="px-4 py-2 rounded-xl bg-[#252A31] hover:bg-[#303640] border border-[#3A404D] text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <span>Pantau Metrik Bisnis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Admin Management Panel */}
      <AdminManagementPanel
        branches={branches}
        services={services}
        users={users}
      />
    </div>
  );
}
