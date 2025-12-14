import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/clerk";
import { uploadFileToStorage, createDataVersion } from "./supabase";

export async function uploadHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { sessionId } = req.body;

  if (!sessionId || !req.file) {
    res.status(400).json({
      error: "Missing required fields:  sessionId, file",
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  // Upload file to Supabase Storage
  const { fileUrl, fileKey } = await uploadFileToStorage(
    sessionId,
    req.file.originalname || "data.csv",
    req.file.buffer,
    "v0"
  );

  // Create data version record
  await createDataVersion(
    sessionId,
    "v0",
    req.file.originalname || "data.csv",
    fileUrl,
    req.file. size,
    "Raw uploaded data"
  );

  res.json({
    success: true,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    fileUrl,
    version: "v0",
  });
}