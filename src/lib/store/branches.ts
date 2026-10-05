import { db } from "@/db";
import { branches } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { BranchItem } from "@/lib/types";

export async function getBranches(): Promise<BranchItem[]> {
  const rows = await db.select().from(branches).orderBy(branches.name);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address,
    phone: r.phone,
    openTime: r.openTime,
    closeTime: r.closeTime,
  }));
}

export async function getBranchById(id: string): Promise<BranchItem | undefined> {
  const rows = await db
    .select()
    .from(branches)
    .where(or(eq(branches.id, id), eq(branches.slug, id)))
    .limit(1);

  if (!rows[0]) return undefined;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    address: r.address,
    phone: r.phone,
    openTime: r.openTime,
    closeTime: r.closeTime,
  };
}

export async function createBranch(data: {
  name: string;
  address: string;
  phone: string;
  openTime: string;
  closeTime: string;
}): Promise<BranchItem> {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const inserted = await db
    .insert(branches)
    .values({
      name: data.name,
      slug,
      address: data.address,
      phone: data.phone,
      openTime: data.openTime || "09:00",
      closeTime: data.closeTime || "21:00",
    })
    .returning();

  const b = inserted[0];
  return {
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
    phone: b.phone,
    openTime: b.openTime,
    closeTime: b.closeTime,
  };
}
