import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Scissors, ShieldCheck, Clock, User, Store, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BARBERCRAFT | Multi-Branch Booking & Digital Queue",
  description: "Sistem booking slot, antrean digital hybrid, dan resep gaya potong barbershop.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="id" className={`dark ${jakarta.variable}`}>
      <body className="bg-[#121316] text-[#F3F4F6] min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-black">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-[#1A1D21]/95 backdrop-blur border-b border-[#2D3139]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform">
                <Scissors className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-wider text-base text-white group-hover:text-amber-400 transition-colors">
                  BARBER<span className="text-amber-500">CRAFT</span>
                </span>
                <span className="text-[10px] text-zinc-400 tracking-wide -mt-0.5">
                  Potong Rambut Tanpa Antre
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/book"
                className="px-3 py-2 rounded-md hover:bg-[#252A31] text-zinc-300 hover:text-white transition-colors"
              >
                Booking Sekarang
              </Link>
              <Link
                href="/queue"
                className="px-3 py-2 rounded-md hover:bg-[#252A31] text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-amber-500" />
                Cek Antrean
              </Link>
              <Link
                href="/profile/history"
                className="px-3 py-2 rounded-md hover:bg-[#252A31] text-zinc-300 hover:text-white transition-colors"
              >
                Riwayat Model
              </Link>
            </nav>

            {/* Auth / Role Indicator + Logout */}
            <div className="flex items-center gap-3">
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold capitalize">
                    {session.role}
                  </span>
                  <Link
                    href={
                      session.role === "owner"
                        ? "/dashboard/owner"
                        : session.role === "admin"
                        ? "/dashboard/admin"
                        : session.role === "staff"
                        ? `/dashboard/branch/${session.branchId || "branch-kemang"}/queue`
                        : "/profile/history"
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252A31] hover:bg-[#2D333D] text-xs text-white border border-[#3A404D] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>{session.name.split(" ")[0]}</span>
                  </Link>

                  {/* Explicit Logout Button */}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition-colors"
                      title="Keluar / Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold tracking-wide transition-all shadow-md shadow-amber-500/10"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Portal Staf / Login</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[#2D3139] bg-[#16181C] py-8 text-zinc-500 text-xs">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Kemang &bull; Senopati &bull; Bintaro Sektor 9</span>
            </div>
            <div>&copy; 2026 BARBERCRAFT. Monolith Next.js + Neon Postgres.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
