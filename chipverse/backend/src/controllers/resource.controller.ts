// src/controllers/resource.controller.ts
import { Request, Response } from "express";
import prisma from "../config/prisma";

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/resources?domain=rtl&levelId=3&subLevelType=CONCEPT
export const getResources = async (req: Request, res: Response) => {
  try {
    const { domain, levelId, subLevelType } = req.query;

    const where: any = { isActive: true, status: "APPROVED" };
    if (domain) where.domain = String(domain);
    if (levelId !== undefined) where.levelId = Number(levelId);
    if (subLevelType) where.subLevelType = String(subLevelType).toUpperCase();

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, url: true, type: true,
        domain: true, levelId: true, subLevelType: true,
        description: true, tags: true, createdAt: true,
        uploader: { select: { name: true } },
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
      include: { uploader: { select: { name: true } } },
    });
    if (!resource) return res.status(404).json({ message: "Not found" });
    return res.status(200).json({ resource });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ── ADMIN: Submit resource (goes to PENDING) ──────────────────────────────────

// POST /api/admin/resources
export const createResource = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;
    const { title, url, type, domain, levelId, subLevelType, description, tags } = req.body;

    if (!title || !url || !type || !domain || levelId === undefined || !subLevelType) {
      return res.status(400).json({
        message: "title, url, type, domain, levelId, subLevelType are required",
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

    const validSubLevels = ["CONCEPT", "SYNTAX", "WALKTHROUGH", "LAB", "QUIZ"];
    if (!validSubLevels.includes(subLevelType.toUpperCase())) {
      return res.status(400).json({ message: "Invalid subLevelType" });
    }

    const resource = await prisma.resource.create({
      data: {
        title, url, type,
        domain, levelId: Number(levelId),
        subLevelType: subLevelType.toUpperCase(),
        description: description || null,
        tags: tags || [],
        uploadedBy: adminId,
        status: "PENDING",
      },
      include: { uploader: { select: { name: true } } },
    });

    return res.status(201).json({ message: "Resource submitted for review", resource });
  } catch (err) {
    console.error("Create resource error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/resources/:id
export const updateResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });

    // Only allow editing PENDING or REJECTED resources
    if (existing.status === "APPROVED") {
      return res.status(400).json({ message: "Cannot edit an approved resource" });
    }

    const { title, url, type, domain, levelId, subLevelType, description, tags } = req.body;

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(domain !== undefined && { domain }),
        ...(levelId !== undefined && { levelId: Number(levelId) }),
        ...(subLevelType !== undefined && { subLevelType: subLevelType.toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags }),
        // Reset to pending on edit
        status: "PENDING",
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
      include: { uploader: { select: { name: true } } },
    });

    return res.status(200).json({ message: "Resource updated", resource });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/resources/:id (soft delete)
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });

    await prisma.resource.update({
      where: { id },
      data: { isActive: false },
    });

    return res.status(200).json({ message: "Resource deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/resources (all resources for admin)
export const getAllResourcesAdmin = async (req: Request, res: Response) => {
  try {
    const { domain, levelId, status } = req.query;

    const where: any = { isActive: true };
    if (domain) where.domain = String(domain);
    if (levelId !== undefined) where.levelId = Number(levelId);
    if (status) where.status = String(status).toUpperCase();

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { name: true, email: true } },
        reviewer: { select: { name: true } },
      },
    });

    return res.status(200).json({ resources });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ── SUPER ADMIN: Approve / Reject ─────────────────────────────────────────────

// POST /api/admin/resources/:id/approve
export const approveResource = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;
    const { id } = req.params;

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });
    if (existing.status === "APPROVED") {
      return res.status(400).json({ message: "Already approved" });
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });

    return res.status(200).json({ message: "Resource approved ✅", resource });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/resources/:id/reject
export const rejectResource = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).adminId;
    const { id } = req.params;
    const { reason } = req.body;

    const existing = await prisma.resource.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Not found" });

    const resource = await prisma.resource.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason || "No reason provided",
      },
    });

    return res.status(200).json({ message: "Resource rejected ❌", resource });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/resources/pending (super admin only)
export const getPendingResources = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { status: "PENDING", isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        uploader: { select: { name: true, email: true } },
      },
    });
    return res.status(200).json({ resources });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};