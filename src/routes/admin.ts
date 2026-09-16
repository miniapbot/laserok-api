import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Конфигурация Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer для приёма файла в память
const upload = multer({ storage: multer.memoryStorage() });

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/admin.js";

export const adminRouter = Router();

adminRouter.use(adminAuth);

adminRouter.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/upload — загрузка изображения
adminRouter.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Загрузка в папку "laserok" в Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "laserok", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/products", async (req, res, next) => {
  try {
    const {
      sku,
      name,
      category,
      price,
      oldPrice,
      stock,
      images,
      description,
      attributes,
      active,
    } = req.body;

    if (!sku || !name || !category || price === undefined) {
      return res
        .status(400)
        .json({ error: "sku, name, category, price обязательны" });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        category,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: Number(stock) || 0,
        images: images || [],
        description: description || "",
        attributes: attributes || {},
        active: active !== false,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

adminRouter.put("/products/:id", async (req, res, next) => {
  try {
    const {
      sku,
      name,
      category,
      price,
      oldPrice,
      stock,
      images,
      description,
      attributes,
      active,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        sku,
        name,
        category,
        price: price !== undefined ? Number(price) : undefined,
        oldPrice:
          oldPrice === null || oldPrice === "" ? null : Number(oldPrice),
        stock: stock !== undefined ? Number(stock) : undefined,
        images,
        description,
        attributes,
        active,
      },
    });

    res.json(product);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/orders/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: { items: true },
    });
    res.json(order);
  } catch (err) {
    next(err);
  }
});