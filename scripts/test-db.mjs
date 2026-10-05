import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import path from "node:path";

// Load .env manually if exists without extra packages
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0) {
      const val = rest.join("=").replace(/^["']|["']$/g, "").trim();
      process.env[key.trim()] = val;
    }
  }
}

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || dbUrl.includes("change-this") || dbUrl.includes("endpoint.neon.tech")) {
  console.error("Gagal: DATABASE_URL belum diatur di file .env");
  console.error("Isi .env dengan connection string asli dari console Neon:");
  console.error("DATABASE_URL=\"postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require\"");
  process.exit(1);
}

console.log("Menghubungkan ke Neon Postgres...");

try {
  const sql = neon(dbUrl);
  const result = await sql`SELECT 1 as connected, current_database() as db, version() as ver;`;
  console.log("Koneksi Database BERHASIL!");
  console.log(`Database target : ${result[0].db}`);
  console.log(`Status         : Connected (1)`);
} catch (err) {
  console.error("Koneksi Database GAGAL:");
  console.error(err.message);
  process.exit(1);
}
