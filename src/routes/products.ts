import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const productsRouter = Router();

// GET /api/products — все товары
productsRouter.get("/", async (req, res, next) => {
  try {
    const { category, search, active } = req.query;
    const where: any = {};

    if (category) where.category = category as string;
    if (active !== "all") where.active = true;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { sku: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — один товар
productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products — создать (для админки)
productsRouter.post("/", async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — обновить (для админки)
productsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id — удалить (для админки)
productsRouter.delete("/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
