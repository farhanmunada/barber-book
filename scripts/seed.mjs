import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

// Load .env
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
  console.error("Silakan isi .env dengan connection string Neon terlebih dahulu.");
  process.exit(1);
}

const sql = neon(dbUrl);

console.log("Seeding data langsung ke Neon PostgreSQL database...");

try {
  // 1. Bersihkan data lama jika ada
  await sql`TRUNCATE TABLE payrolls, haircut_records, booking_services, bookings, barber_schedules, services, users, branches CASCADE;`;
  console.log("✓ Tabel berhasil dibersihkan.");

  // 2. Insert 3 Cabang
  const branches = await sql`
    INSERT INTO branches (name, slug, address, phone, open_time, close_time)
    VALUES 
      ('BarberCraft Kemang', 'kemang', 'Jl. Kemang Raya No. 42, Jakarta Selatan', '0812-8888-101', '09:00', '21:00'),
      ('BarberCraft Senopati', 'senopati', 'Jl. Senopati No. 18, Jakarta Selatan', '0812-8888-102', '10:00', '22:00'),
      ('BarberCraft Bintaro Sektor 9', 'bintaro', 'Ruko Bintaro Sektor 9 Blok A-3, Tangerang Selatan', '0812-8888-103', '09:00', '21:00')
    RETURNING id, name, slug;
  `;
  console.log(`✓ ${branches.length} Cabang berhasil dimasukkan ke Neon.`);

  const kemangId = branches.find((b) => b.slug === "kemang").id;
  const senopatiId = branches.find((b) => b.slug === "senopati").id;
  const bintaroId = branches.find((b) => b.slug === "bintaro").id;

  // 3. Insert Users (Owner, Admin, Kasir per cabang, Customer)
  const ownerHash = await bcrypt.hash("owner123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);
  const kasirHash = await bcrypt.hash("kasir123", 10);
  const budiHash = await bcrypt.hash("budi123", 10);

  const users = await sql`
    INSERT INTO users (name, email, password_hash, role, branch_id, phone, avatar_url, bank_name, bank_account_number, bank_account_holder, base_salary_weekly, commission_rate)
    VALUES
      ('Bapak Hendarto', 'owner@barber.com', ${ownerHash}, 'owner', NULL, '0812-0000-001', NULL, 'BCA', '8820-000-111', 'Hendarto', 0, 0),
      ('Siti Rahma (Admin Ops)', 'admin@barber.com', ${adminHash}, 'admin', NULL, '0812-0000-002', NULL, 'BCA', '8820-000-222', 'Siti Rahma', 1500000, 0),
      ('Rian Santoso', 'kasir.kemang@barber.com', ${kasirHash}, 'staff', ${kemangId}, '0812-0000-003', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'BCA', '8820-192-881', 'Rian Santoso', 1337500, 20),
      ('Eko Razor', 'kasir.senopati@barber.com', ${kasirHash}, 'staff', ${senopatiId}, '0812-0000-004', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'Bank Mandiri', '1370-00-9982-110', 'Eko Razor', 1337500, 20),
      ('Dimas Ardi', 'kasir.bintaro@barber.com', ${kasirHash}, 'staff', ${bintaroId}, '0812-0000-005', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', 'BRI', '0341-01-082910-50-2', 'Dimas Ardi', 1237500, 20),
      ('Budi Santoso', 'budi@gmail.com', ${budiHash}, 'customer', NULL, '0812-9988-7711', NULL, NULL, NULL, NULL, 0, 0)
    RETURNING id, name, email, role;
  `;
  console.log(`✓ ${users.length} Akun pengguna dibuat di Neon.`);

  const rianId = users.find((u) => u.email === "kasir.kemang@barber.com").id;
  const budiId = users.find((u) => u.email === "budi@gmail.com").id;

  // 4. Insert Master Layanan
  const services = await sql`
    INSERT INTO services (name, description, duration_minutes, price, is_active)
    VALUES
      ('Gentleman Haircut & Styling', 'Konsultasi bentuk wajah, precision haircut, wash dingin, styling pomade.', 45, 85000, true),
      ('Beard Sculpting & Hot Towel', 'Cukur janggut rapi, handuk hangat aromaterapi, soothing aftershave lotion.', 30, 55000, true),
      ('Executive Grooming (All-in)', 'Haircut lengkap + beard trim + hair wash & scalp massage + hot towel.', 60, 135000, true),
      ('Hair Wash & Menthol Scalp Therapy', 'Keramas deep-cleanse dengan sensasi dingin menthol dan pijat kepala relaksasi.', 20, 40000, true)
    RETURNING id, name, price;
  `;
  console.log(`✓ ${services.length} Layanan barbershop dimasukkan ke Neon.`);

  const haircutServiceId = services[0].id;

  // 5. Insert Sample Live Booking
  const today = new Date().toISOString().split("T")[0];
  const booking = await sql`
    INSERT INTO bookings (
      branch_id, barber_id, customer_id, customer_name, customer_phone,
      queue_number, booking_type, booking_date, slot_time, status, total_price, payment_status
    )
    VALUES (
      ${kemangId}, ${rianId}, ${budiId}, 'Budi Santoso', '0812-9988-7711',
      'K-01', 'online_slot', ${today}, '14:00', 'in_progress', 85000, 'paid'
    )
    RETURNING id, queue_number;
  `;
  console.log(`✓ Sample booking ${booking[0].queue_number} aktif dibuat.`);

  // 6. Insert Haircut Blueprint Record
  await sql`
    INSERT INTO haircut_records (
      customer_id, customer_name, barber_id, booking_id,
      side_technique, baseline_guard, top_style, top_technique, neckline,
      head_quirks, styling_product, notes
    )
    VALUES (
      ${budiId}, 'Budi Santoso', ${rianId}, ${booking[0].id},
      'Low Fade', '#1.5 (4.5mm)', 'French Crop', 'Point Cut (Tekstur)', 'Tapered (Alami)',
      ARRAY['Double Crown (2 Pusaran)'], 'Matte Clay', 'Poni jangan terlalu pendek di atas alis.'
    );
  `;
  console.log("✓ Sample Haircut Blueprint berhasil dicatat ke Neon.");

  console.log("\nDATABASE BERHASIL DI-SEED 100% DENGAN DATA ASLI DARI NEON!");
} catch (err) {
  console.error("Gagal melakukan seed database:", err);
  process.exit(1);
}
