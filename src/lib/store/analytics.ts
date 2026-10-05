import { db } from "@/db";
import { bookings } from "@/db/schema";
import { getBranches } from "./branches";

export async function getOwnerAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const allBranches = await getBranches();
  const allBookings = await db.select().from(bookings);

  const branchSummaries = allBranches.map((branch) => {
    const bList = allBookings.filter((b) => b.branchId === branch.id);
    const todayList = bList.filter((b) => b.bookingDate === today);
    const completedList = bList.filter((b) => b.status === "completed");
    const revenue = completedList.reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      branchId: branch.id,
      name: branch.name,
      slug: branch.slug,
      todayQueueCount: todayList.length,
      activeWaiting: todayList.filter((b) => b.status === "waiting").length,
      inProgress: todayList.filter((b) => b.status === "in_progress").length,
      totalCompleted: completedList.length,
      revenue,
    };
  });

  const totalRevenue = branchSummaries.reduce((sum, b) => sum + b.revenue, 0);
  const totalBookings = allBookings.length;

  return {
    today,
    totalRevenue,
    totalBookings,
    branchSummaries,
  };
}
