import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        sku: "LZR-000001",
        name: "Деревянный жетон",
        category: "Жетоны",
        price: 250,
        oldPrice: 300,
        stock: 15,
        images: ["/products/zheton-01.png"],
        description: "Жетон из берёзы с лазерной гравировкой.",
        attributes: { материал: "Берёза", размер: "50 мм", толщина: "4 мм" },
        active: true,
      },
      {
        sku: "LZR-000002",
        name: "Шкатулка",
        category: "Шкатулки",
        price: 1200,
        stock: 7,
        images: ["/products/shkatulka-01.png"],
        description: "Шкатулка с гравировкой под заказ.",
        attributes: { материал: "Дуб", размер: "120×80×60 мм" },
        active: true,
      },
      {
        sku: "LZR-000003",
        name: "Табличка",
        category: "Таблички",
        price: 400,
        stock: 20,
        images: ["/products/tablichka-01.png"],
        description: "Интерьерная табличка из дерева.",
        attributes: { материал: "Ясень", размер: "150×50 мм" },
        active: true,
      },
    ],
  });

  console.log("✅ База данных наполнена");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
