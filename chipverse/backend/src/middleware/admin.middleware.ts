// src/middleware/admin.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      adminId: string; email: string; role: string; adminRole: string;
    };
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    (req as any).adminId = decoded.adminId;
    (req as any).adminEmail = decoded.email;
    (req as any).adminRole = decoded.adminRole;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      adminId: string; email: string; role: string; adminRole: string;
    };
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (decoded.adminRole !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Super Admin access required" });
    }
    (req as any).adminId = decoded.adminId;
    (req as any).adminEmail = decoded.email;
    (req as any).adminRole = decoded.adminRole;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};