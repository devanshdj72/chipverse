// src/routes/resource.routes.ts
import { Router } from "express";
import { getResources, getResourceById } from "../controllers/resource.controller";

const router = Router();

// GET /api/resources?domain=rtl&levelId=3
router.get("/", getResources);

// GET /api/resources/:id
router.get("/:id", getResourceById);

export default router;