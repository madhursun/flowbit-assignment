import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ ESM-safe dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // ✅ Load JSON file
  const filePath = path.join(
    __dirname,
    "../../../data/Analytics_Test_Data.json"
  );
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  console.log(`🌱 Starting seeding for ${data.length} records...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < data.length; i++) {
    const doc = data[i];
    const llm = doc?.extractedData?.llmData;
    if (!llm) {
      console.warn(`⚠️ Skipping record #${i} — missing llmData`);
      continue;
    }

    try {
      // -------------------- Vendors --------------------
      const vendorVal = llm.vendor?.value || {};
      const vendorName =
        vendorVal.vendorName?.value ||
        `Vendor-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const vendorAddress = vendorVal.vendorAddress?.value || null;
      const vendorTaxId = vendorVal.vendorTaxId?.value || null;
      const vendorPartyNumber = vendorVal.vendorPartyNumber?.value || null;

      const vendor = await prisma.vendor.upsert({
        where: { vendor_id: vendorPartyNumber || vendorTaxId || vendorName },
        update: {},
        create: {
          vendor_id: vendorPartyNumber || vendorTaxId || vendorName,
          name: vendorName,
          address: vendorAddress,
        },
      });

      // -------------------- Customers --------------------
      const customerVal = llm.customer?.value || {};
      const customer = await prisma.customer.upsert({
        where: {
          customer_id: customerVal.customerName?.value || "UnknownCustomer",
        },
        update: {},
        create: {
          customer_id: customerVal.customerName?.value || "UnknownCustomer",
          name: customerVal.customerName?.value || "Unknown Customer",
          address: customerVal.customerAddress?.value || null,
        },
      });

      // -------------------- Summary --------------------
      const summaryVal = llm.summary?.value || {};
      const totalAmount =
        Number(summaryVal.invoiceTotal?.value) ||
        Number(summaryVal.subTotal?.value) ||
        0;
      const currency =
        summaryVal.currencySymbol?.value || summaryVal.currency?.value || "EUR";

      // -------------------- Invoice --------------------
      const invoiceVal = llm.invoice?.value || {};
      const invoiceDate = invoiceVal.invoiceDate?.value
        ? new Date(invoiceVal.invoiceDate.value)
        : new Date();

      // -------------------- Line Items --------------------
      const fakeLineItems =
        Array.isArray(llm.lineItems?.value) && llm.lineItems.value.length > 0
          ? llm.lineItems.value.map((li: any) => ({
              description:
                li.itemDescription?.value ||
                li.description?.value ||
                "Service/Product",
              quantity: Number(li.quantity?.value) || 1,
              unit_price: Number(li.unitPrice?.value) || 0,
              total:
                Number(li.amount?.value) ||
                Number(li.unitPrice?.value) * (Number(li.quantity?.value) || 1),
            }))
          : [
              {
                description: "Auto-generated item",
                quantity: 1,
                unit_price: Math.abs(totalAmount),
                total: Math.abs(totalAmount),
              },
            ];

      // -------------------- Payments --------------------
      const fakePayments =
        Array.isArray(llm.payment?.value) && llm.payment?.value.length > 0
          ? llm.payment.value.map((p: any) => ({
              paid_at: new Date(p.paid_at?.value || invoiceDate),
              amount: Math.abs(Number(p.amount?.value)) || 0,
              method: p.method?.value || "Bank Transfer",
            }))
          : [
              {
                paid_at: new Date(
                  invoiceDate.getTime() +
                    Math.floor(Math.random() * 10) * 86400000
                ),
                amount: Math.abs(totalAmount),
                method: "Auto-Generated",
              },
            ];

      // -------------------- Create Invoice (Fixed Unique ID) --------------------
      const uniqueInvoiceId =
        (invoiceVal.invoiceNumber?.value &&
          `${invoiceVal.invoiceNumber.value}-${i}`) ||
        (doc._id && `${doc._id}-${i}`) ||
        `INV-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${i}`;

      await prisma.invoice.create({
        data: {
          invoice_id: uniqueInvoiceId,
          vendorId: vendor.id,
          customerId: customer.id,
          date: invoiceDate,
          due_date: null,
          status: "Processed",
          currency:
            typeof currency === "string" && currency.trim() ? currency : "EUR",
          total_amount: totalAmount,
          lineItems: { create: fakeLineItems },
          payments: { create: fakePayments },
        },
      });

      success++;
      if (i % 20 === 0) console.log(`✅ Seeded ${success} invoices so far...`);
    } catch (err: any) {
      failed++;
      console.error(`⚠️ Error seeding record #${i}: ${err.message}`);
    }
  }

  console.log(
    `\n🌱 Seeding complete! ✅ Success: ${success}, ❌ Failed: ${failed}`
  );
}

// ✅ Properly closed main()
main()
  .catch((e) => {
    console.error("❌ Fatal seeding error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
