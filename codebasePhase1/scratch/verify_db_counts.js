const { PrismaClient } = require('../node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  console.log('=== DATABASE RECORD COUNTS AUDIT ===');
  const userCount = await prisma.user.count();
  const catCount = await prisma.category.count();
  const subCatCount = await prisma.subcategory ? await prisma.subcategory.count() : 0;
  const prodCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const payCount = await prisma.payment.count();
  const shipmentCount = await prisma.shipment.count();
  const returnCount = await prisma.returnRequest.count();
  const refundCount = await prisma.refund.count();
  const auditCount = await prisma.auditLog.count();

  console.log(`Users: ${userCount}`);
  console.log(`Categories: ${catCount}`);
  console.log(`Subcategories: ${subCatCount}`);
  console.log(`Products: ${prodCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Payments: ${payCount}`);
  console.log(`Shipments: ${shipmentCount}`);
  console.log(`Return Requests: ${returnCount}`);
  console.log(`Refunds: ${refundCount}`);
  console.log(`Audit Logs: ${auditCount}`);
}

checkDb().catch(console.error).finally(() => prisma.$disconnect());
