import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updates = [
    { sku: "LZR-000001", shortDescription: "етон из берёзы с лазерной гравировкой" },
    { sku: "LZR-000002", shortDescription: "еревянная шкатулка с гравировкой под заказ" },
    { sku: "LZR-000003", shortDescription: "нтерьерная табличка из дерева" },
  ];

  for (const u of updates) {
    await prisma.product.update({
      where: { sku: u.sku },
      data: { shortDescription: u.shortDescription },
    });
    console.log(`✅ ${u.sku}: ${u.shortDescription}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });