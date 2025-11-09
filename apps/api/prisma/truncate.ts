import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "LineItem", "Payment", "Invoice", "Vendor", "Customer"
    RESTART IDENTITY CASCADE;
  `);
  console.log("✅ Tables truncated successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error truncating tables:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
