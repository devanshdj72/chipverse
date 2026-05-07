// src/routes/admin.routes.ts
import { Router } from "express";
import {
  adminLogin,
  createAdmin,
  getAdminMe,
} from "../controllers/admin.auth.controller";
import {
  createResource,
  updateResource,
  deleteResource,
  getAllResourcesAdmin,
} from "../controllers/resource.controller";
import { requireAdmin } from "../middleware/admin.middleware";

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/login", adminLogin);
router.post("/create", createAdmin);          // one-time setup
router.get("/me", requireAdmin, getAdminMe);

// ── Resources (admin CRUD) ────────────────────────────────────────────────────
router.get("/resources", requireAdmin, getAllResourcesAdmin);
router.post("/resources", requireAdmin, createResource);
router.put("/resources/:id", requireAdmin, updateResource);
router.delete("/resources/:id", requireAdmin, deleteResource);

export default router;