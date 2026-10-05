import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

// Helper to check if DB is configured
export const isDbConfigured = Boolean(databaseUrl && !databaseUrl.includes("change-this"));

// Drizzle instance
const sql = neon(databaseUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder");
export const db = drizzle(sql, { schema });
