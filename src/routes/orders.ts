import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const ordersRouter = Router();

// POST /api/orders — создать заказ
ordersRouter.post("/", async (req, res, next) => {
  try {
    const { customer, items, total } = req.body;

    const order = await prisma.order.create({
      data: {
        customer,
        total,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — список заказов (для админки)
ordersRouter.get("/", async (_req, res, next) => {
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
