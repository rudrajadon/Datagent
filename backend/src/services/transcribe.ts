import { Request, Response } from "express";
import OpenAI from "openai";
import { config } from "../config/env";

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export async function transcribeHandler(
  req: RequestWithFile,
  res: Response
): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "Missing audio file" });
    return;
  }

  try {
    // Create a File object from the buffer
    const audioFile = new File(
      [new Uint8Array(req.file.buffer)],
      req.file.originalname || "audio.wav",
      { type: req.file.mimetype || "audio/wav" }
    );

    const response = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    res.json({
      transcript: response.text,
      language: "en",
    });
  } catch (error) {
    console.error("[Whisper] Transcription failed:", error);
    res.status(500).json({
      error: "Transcription failed",
    });
  }
}
