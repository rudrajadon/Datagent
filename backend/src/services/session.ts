import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/clerk";
import { createSession } from "./supabase";

export async function createSessionHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { title, mode } = req.body;

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const session = await createSession(
    req.user.userId,
    title || "New Chat",
    mode || "default"
  );

  res.json({
    id: session.id,
    title: session.title,
    mode: session.mode,
    createdAt: session.createdAt,
  });
}