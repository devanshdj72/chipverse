import { Request, Response } from "express";
import prisma from "../config/prisma";

export const addXp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { xp } = req.body;
    if (!xp || xp <= 0) return res.status(400).json({ message: "Invalid XP" });

    const profile = await prisma.userProfile.update({
      where: { userId },
      data: { xp: { increment: xp } },
    });

    return res.status(200).json({ xp: profile.xp });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};