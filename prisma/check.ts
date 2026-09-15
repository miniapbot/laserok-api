import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`сего товаров: ${count}`);
  
  const products = await prisma.product.findMany({
    select: { sku: true, name: true, shortDescription: true },
  });
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });