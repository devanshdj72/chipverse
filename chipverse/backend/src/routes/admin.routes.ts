// src/routes/admin.routes.ts
import { Router } from "express";
import {
  adminLogin, createAdmin, getAdminMe,
} from "../controllers/admin.auth.controller";
import {
  createResource, updateResource, deleteResource,
  getAllResourcesAdmin, approveResource, rejectResource, getPendingResources,
} from "../controllers/resource.controller";
import { requireAdmin, requireSuperAdmin } from "../middleware/admin.middleware";

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/login", adminLogin);
router.post("/create", createAdmin);
router.get("/me", requireAdmin, getAdminMe);

// ── Resources (any admin) ─────────────────────────────────────────────────────
router.get("/resources", requireAdmin, getAllResourcesAdmin);
router.post("/resources", requireAdmin, createResource);
router.put("/resources/:id", requireAdmin, updateResource);
router.delete("/resources/:id", requireAdmin, deleteResource);

// ── Super Admin only ──────────────────────────────────────────────────────────
router.get("/resources/pending", requireSuperAdmin, getPendingResources);
router.post("/resources/:id/approve", requireSuperAdmin, approveResource);
router.post("/resources/:id/reject", requireSuperAdmin, rejectResource);

export default router;