import { getBranches, getBookings } from "@/lib/store";
import { LiveQueueTracker } from "@/components/queue/live-queue-tracker";
import { Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string }>;
}) {
  const resolvedParams = await searchParams;
  const [branches, bookings] = await Promise.all([
    getBranches(),
    getBookings(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#2D3139] pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5" />
          <span>Monitor Antrean Real-Time</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">
          Live Digital Queue
        </h1>
        <p className="text-sm text-zinc-400">
          Pantau giliran nomor antrean di kursi barber dan estimasi kedatangan Anda secara langsung.
        </p>
      </div>

      <LiveQueueTracker
        branches={branches}
        bookings={bookings}
        highlightId={resolvedParams.highlight}
      />
    </div>
  );
}
