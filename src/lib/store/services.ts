import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ServiceItem } from "@/lib/types";

export async function getServices(): Promise<ServiceItem[]> {
  const rows = await db.select().from(services).where(eq(services.isActive, true));
  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description || "",
    durationMinutes: s.durationMinutes,
    price: s.price,
  }));
}

export async function createService(data: {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}): Promise<ServiceItem> {
  const inserted = await db
    .insert(services)
    .values({
      name: data.name,
      description: data.description,
      durationMinutes: Number(data.durationMinutes) || 45,
      price: Number(data.price) || 50000,
    })
    .returning();

  const s = inserted[0];
  return {
    id: s.id,
    name: s.name,
    description: s.description || "",
    durationMinutes: s.durationMinutes,
    price: s.price,
  };
}
