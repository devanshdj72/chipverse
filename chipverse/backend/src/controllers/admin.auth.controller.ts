// src/controllers/admin.auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { config } from "../config/env";

// POST /api/admin/login
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: "ADMIN" },
      config.jwt.accessSecret,
      { expiresIn: "8h" }
    );

    return res.status(200).json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/create  (only call this once to seed first admin)
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Protect with a secret key so random users can't create admins
    if (secretKey !== config.adminSecretKey) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const exists = await prisma.adminUser.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.adminUser.create({
      data: { name, email, passwordHash },
    });

    return res.status(201).json({
      message: "Admin created",
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("Create admin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/me
export const getAdminMe = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: (req as any).adminId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.status(200).json({ admin });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};