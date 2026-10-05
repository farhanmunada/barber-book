import { db } from "@/db";
import { haircutRecords, users } from "@/db/schema";
import { eq, desc, ilike } from "drizzle-orm";
import { HaircutBlueprint } from "@/lib/types";

export async function getHaircutRecipes(query?: string): Promise<HaircutBlueprint[]> {
  const baseQuery = db
    .select({
      recipe: haircutRecords,
      barberName: users.name,
    })
    .from(haircutRecords)
    .leftJoin(users, eq(haircutRecords.barberId, users.id))
    .orderBy(desc(haircutRecords.createdAt));

  const rows = query
    ? await baseQuery.where(ilike(haircutRecords.customerName, `%${query.trim()}%`))
    : await baseQuery;

  return rows.map(({ recipe: r, barberName }) => ({
    id: r.id,
    customerId: r.customerId || undefined,
    customerName: r.customerName,
    barberId: r.barberId,
    barberName: barberName || "Barber",
    bookingId: r.bookingId || undefined,
    sideTechnique: r.sideTechnique || "-",
    baselineGuard: r.baselineGuard || "-",
    topStyle: r.topStyle || "-",
    topTechnique: r.topTechnique || "-",
    neckline: r.neckline || "-",
    headQuirks: r.headQuirks || [],
    stylingProduct: r.stylingProduct || "-",
    notes: r.notes || undefined,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function saveHaircutRecipe(data: {
  customerName: string;
  customerId?: string;
  barberId: string;
  barberName: string;
  sideTechnique: string;
  baselineGuard: string;
  topStyle: string;
  topTechnique: string;
  neckline: string;
  headQuirks: string[];
  stylingProduct: string;
  notes?: string;
}): Promise<HaircutBlueprint> {
  const inserted = await db
    .insert(haircutRecords)
    .values({
      customerName: data.customerName,
      customerId: data.customerId || null,
      barberId: data.barberId,
      sideTechnique: data.sideTechnique,
      baselineGuard: data.baselineGuard,
      topStyle: data.topStyle,
      topTechnique: data.topTechnique,
      neckline: data.neckline,
      headQuirks: data.headQuirks,
      stylingProduct: data.stylingProduct,
      notes: data.notes || null,
    })
    .returning();

  const r = inserted[0];
  return {
    id: r.id,
    customerName: r.customerName,
    customerId: r.customerId || undefined,
    barberId: r.barberId,
    barberName: data.barberName,
    sideTechnique: r.sideTechnique || "-",
    baselineGuard: r.baselineGuard || "-",
    topStyle: r.topStyle || "-",
    topTechnique: r.topTechnique || "-",
    neckline: r.neckline || "-",
    headQuirks: r.headQuirks || [],
    stylingProduct: r.stylingProduct || "-",
    notes: r.notes || undefined,
    createdAt: r.createdAt.toISOString(),
  };
}
