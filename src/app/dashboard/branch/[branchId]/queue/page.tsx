import { notFound } from "next/navigation";
import {
  getBranchById,
  getBarbers,
  getServices,
  getBookings,
  getHaircutRecipes,
} from "@/lib/store";
import { BranchQueuePos } from "@/components/queue/branch-queue-pos";

export const dynamic = "force-dynamic";

export default async function BranchQueuePage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branch = await getBranchById(branchId);
  if (!branch) {
    notFound();
  }

  const [barbers, services, bookings, recipes] = await Promise.all([
    getBarbers(branch.id),
    getServices(),
    getBookings({ branchId: branch.id }),
    getHaircutRecipes(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BranchQueuePos
        branch={branch}
        barbers={barbers}
        services={services}
        bookings={bookings}
        recipes={recipes}
      />
    </div>
  );
}
