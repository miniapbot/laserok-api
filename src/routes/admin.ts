import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/admin.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Папка для загрузок (внутри volume /app/uploads)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer: сохраняем на диск с уникальным именем
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

export const adminRouter = Router();

adminRouter.use(adminAuth);

// POST /api/admin/upload — загрузка картинки на VPS
adminRouter.post(
  "/upload",
  upload.single("file"),
  async (req: MulterRequest, res, next) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const url = `/uploads/${file.filename}`;
      res.json({ url });
    } catch (err) {
      next(err);
    }
  }
);

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

adminRouter.post("/products", async (req, res, next) => {
  try {
    const {
      sku,
      name,
      shortDescription,
      description,
      category,
      price,
      oldPrice,
      stock,
      images,
      attributes,
      active,
    } = req.body;

    if (!sku || !name || !category || price === undefined) {
      return res.status(400).json({
        error: "sku, name, category, price are required",
      });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        shortDescription: shortDescription || "",
        description: description || "",
        category,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: Number(stock) || 0,
        images: images || [],
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
      shortDescription,
      description,
      category,
      price,
      oldPrice,
      stock,
      images,
      attributes,
      active,
    } = req.body;

    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        sku,
        name,
        shortDescription,
        description,
        category,
        price: price !== undefined ? Number(price) : undefined,
        oldPrice:
          oldPrice === null || oldPrice === "" ? null : Number(oldPrice),
        stock: stock !== undefined ? Number(stock) : undefined,
        images,
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