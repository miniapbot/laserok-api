import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { productsRouter } from "./routes/products.js";
import { ordersRouter } from "./routes/orders.js";
import { errorHandler } from "./middleware/error.js";
import { prisma } from "./lib/prisma.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      /\.vercel\.app$/,
      /\.max\.ru$/,
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`✅ API запущен на http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

process.on("SIGTERM", async () => {
  console.log("Останавливаю сервер...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
