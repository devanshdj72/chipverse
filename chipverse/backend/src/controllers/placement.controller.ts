import { Request, Response } from "express";
import { PlacementService } from "../services/placement.service";
import logger from "../utils/logger";

export class PlacementController {
  private placementService: PlacementService;

  constructor() {
    this.placementService = new PlacementService();
  }

  analyzeResume = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No resume file uploaded" });
      }

      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ success: false, message: "Only PDF files are supported" });
      }

      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: "File size must be under 5MB" });
      }

      logger.info(`Resume analysis requested by user: ${userId}`);

      const result = await this.placementService.analyzeResume(
        req.file.buffer,
        req.file.originalname,
        userId
      );

      return res.status(200).json({ success: true, message: "Resume analyzed successfully", data: result });
    } catch (error: any) {
      logger.error("Resume analysis error:", error);
      return res.status(500).json({ success: false, message: error.message || "Analysis failed" });
    }
  };

  getHistory = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const history = await this.placementService.getAnalysisHistory(userId);
      return res.status(200).json({ success: true, message: "History fetched", data: history });
    } catch (error: any) {
      logger.error("History fetch error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  };
}