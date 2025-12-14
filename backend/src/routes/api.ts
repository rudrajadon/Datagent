import { Router, Request, Response } from "express";
import multer from "multer";
import { clerkAuthMiddleware, AuthenticatedRequest } from "../middleware/clerk";
import { chatHandler } from "../agents/chat-handler";
import { uploadHandler } from "../services/upload";
import { transcribeHandler } from "../services/transcribe";
import { createSessionHandler } from "../services/session";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * GET /api - API info endpoint
 */
router.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Datagent API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health",
      chat: "POST /api/chat",
      upload: "POST /api/upload",
      transcribe: "POST /api/transcribe",
      sessions: "POST /api/sessions",
    },
  });
});

/**
 * POST /api/chat - Main chat endpoint
 */
router.post("/chat", clerkAuthMiddleware, async (req: any, res: Response) => {
  try {
    await chatHandler(req, res);
  } catch (error) {
    console.error("[API] Chat error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

/**
 * POST /api/upload - File upload endpoint
 */
router.post(
  "/upload",
  clerkAuthMiddleware,
  upload.single("file"),
  async (req: any, res: Response) => {
    try {
      await uploadHandler(req, res);
    } catch (error) {
      console.error("[API] Upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }
);

/**
 * POST /api/transcribe - Audio transcription endpoint
 */
router.post(
  "/transcribe",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      await transcribeHandler(req, res);
    } catch (error) {
      console.error("[API] Transcribe error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Transcription failed",
      });
    }
  }
);

/**
 * POST /api/sessions - Create new session
 */
router.post(
  "/sessions",
  clerkAuthMiddleware,
  async (req: any, res: Response) => {
    try {
      await createSessionHandler(req, res);
    } catch (error) {
      console.error("[API] Session error:", error);
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to create session",
      });
    }
  }
);

export default router;
