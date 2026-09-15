import type { Request, Response, NextFunction } from "express";

export function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const password = req.headers["x-admin-password"];
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    console.error("[Admin] ADMIN_PASSWORD не задан в env");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (password !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}