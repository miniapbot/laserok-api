import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../middleware/admin.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

export const adminRouter = Router();

adminRouter.use(adminAuth);

// POST /api/admin/upload - upload image to Cloudinary
adminRouter.post("/upload", upload.single("file"), async (req: MulterRequest, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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

adminRouter.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) { next(err); }
});

adminRouter.get("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(product);
  } catch (err) { next(err); }
});

adminRouter.post("/products", async (req, res, next) => {
  try {
    const { sku, name, shortDescription, description, category, price, oldPrice, stock, images, attributes, active } = req.body;
    if (!sku || !name || !category || price === undefined) {
      return res.status(400).json({ error: "sku, name, category, price are required" });
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
  } catch (err) { next(err); }
});

adminRouter.put("/products/:id", async (req, res, next) => {
  try {
    const { sku, name, shortDescription, description, category, price, oldPrice, stock, images, attributes, active } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        sku,
        name,
        shortDescription,
        description,
        category,
        price: price !== undefined ? Number(price) : undefined,
        oldPrice: oldPrice === null || oldPrice === "" ? null : Number(oldPrice),
        stock: stock !== undefined ? Number(stock) : undefined,
        images,
        attributes,
        active,
      },
    });
    res.json(product);
  } catch (err) { next(err); }
});

adminRouter.delete("/products/:id", async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) { next(err); }
});

adminRouter.get("/orders", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) { next(err); }
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
  } catch (err) { next(err); }
});
