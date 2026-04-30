import { Router } from "express";
import multer from "multer";
import { PlacementController } from "../controllers/placement.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const controller = new PlacementController();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

router.post(
  "/analyze",
  requireAuth,
  upload.single("resume"),
  controller.analyzeResume
);

router.get(
  "/history",
  requireAuth,
  controller.getHistory
);

export default router;