import { PrismaClient } from "@prisma/client";
/// <reference types="node" />
const prisma = new PrismaClient();

const products = [
  {
    sku: "LZR-000001",
    name: "Деревянный жетон",
    shortDescription: "Жетон из берёзы с лазерной гравировкой",
    description: "Жетон из берёзы с лазерной гравировкой. Идеально подходит для подарка, брелока или сувенира.",
    category: "Жетоны",
    price: 250,
    oldPrice: 300,
    stock: 15,
    images: ["/products/zheton-01.png"],
    attributes: { материал: "Берёза", размер: "50 мм", толщина: "4 мм" },
    active: true,
  },
  {
    sku: "LZR-000002",
    name: "Шкатулка",
    shortDescription: "Деревянная шкатулка с гравировкой под заказ",
    description: "Шкатулка с гравировкой под заказ. Изготовим по индивидуальному дизайну.",
    category: "Шкатулки",
    price: 1200,
    stock: 7,
    images: ["/products/shkatulka-01.png"],
    attributes: { материал: "Дуб", размер: "120×80×60 мм" },
    active: true,
  },
  {
    sku: "LZR-000003",
    name: "Табличка",
    shortDescription: "Интерьерная табличка из дерева",
    description: "Интерьерная табличка из дерева. Подойдёт для кабинета, офиса или дома.",
    category: "Таблички",
    price: 400,
    stock: 20,
    images: ["/products/tablichka-01.png"],
    attributes: { материал: "Ясень", размер: "150×50 мм" },
    active: true,
  },
];

async function main() {
  for (const p of products) {
    const result = await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
    console.log(`✅ ${result.sku}: ${result.shortDescription}`);
  }
  console.log("");
  console.log("🌱 Обновление выполнено (upsert)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });