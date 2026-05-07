// src/controllers/resource.controller.ts
import { Request, Response } from "express";
import { prisma } from "../config/db";

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/resources?domain=rtl&levelId=3
export const getResources = async (req: Request, res: Response) => {
  try {
    const { domain, levelId } = req.query;

    const where: any = { isActive: true };
    if (domain) where.domain = String(domain);
    if (levelId !== undefined) where.levelId = Number(levelId);

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        url: true,
        type: true,
        domain: true,
        levelId: true,
        description: true,
        tags: true,
        createdAt: true,
        admin: { select: { name: true } },
      },
    });

    return res.status(200).json({ resources });
  } catch (err) {
    console.error("Get resources error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/resources/:id
export const getResourceById = async (req: Request, res: Response) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: { admin: { select: { name: true } } },
    });
    if (!resource) return res.status(404).json({ message: "Resource not found" });
    return res.status(200).json({ resource });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN ONLY ────────────────────────────────────────────────────────────────

// POST /api/admin/resources
export const createResource = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;
    const { title, url, type, domain, levelId, description, tags } = req.body;

    if (!title || !url || !type || !domain || levelId === undefined) {
      return res.status(400).json({
        message: "title, url, type, domain, levelId are required",
      });
    }

    const validDomains = [
      "rtl", "verification", "physical-design",
      "analog", "fpga", "embedded", "dft", "research",
    ];
    if (!validDomains.includes(domain)) {
      return res.status(400).json({ message: "Invalid domain" });
    }

    if (levelId < 0 || levelId > 12) {
      return res.status(400).json({ message: "levelId must be 0-12" });
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        url,
        type,
        domain,
        levelId: Number(levelId),
        description: description || null,
        tags: tags || [],
        uploadedBy: adminId,
      },
      include: { admin: { select: { name: true } } },
    });

    return res.status(201).json({
      message: "Resource created",
      resource,
    });
  } catch (err) {
    console.error("Create resource error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/resources/:id
export const updateResource = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;
    const { id } = req.params;

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Resource not found" });

    const { title, url, type, domain, levelId, description, tags, isActive } = req.body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(domain !== undefined && { domain }),
        ...(levelId !== undefined && { levelId: Number(levelId) }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { admin: { select: { name: true } } },
    });

    return res.status(200).json({ message: "Resource updated", resource });
  } catch (err) {
    console.error("Update resource error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/resources/:id
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Resource not found" });

    // Soft delete — just set isActive=false
    await prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return res.status(200).json({ message: "Resource deleted" });
  } catch (err) {
    console.error("Delete resource error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/resources  (all resources including inactive)
export const getAllResourcesAdmin = async (req: Request, res: Response) => {
  try {
    const { domain, levelId } = req.query;

    const where: any = {};
    if (domain) where.domain = String(domain);
    if (levelId !== undefined) where.levelId = Number(levelId);

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { admin: { select: { name: true, email: true } } },
    });

    return res.status(200).json({ resources });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};