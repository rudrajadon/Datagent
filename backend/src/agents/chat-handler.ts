import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/clerk";
import { classifyIntent, IntentType } from "../services/gemini";
import { createMessage, getSessionMessages } from "../services/supabase";
import { runAnalysisAgent } from "./analysis-agent";
import { runPreparationAgent } from "./preparation-agent";
import { runGeneralAgent } from "./general-agent";

interface ChatResponse {
  assistantMessage: string;
  mode: IntentType;
  artifacts?: {
    imageBase64?:  string;
    fileUrl?: string;
    fileName?: string;
  };
}

/**
 * Main Chat Handler
 * 
 * Flow: 
 * 1. Validate request
 * 2. Save user message to database
 * 3. Classify intent (ANALYSIS, PREPARATION, GENERAL)
 * 4. Route to appropriate agent
 * 5. Save assistant response to database
 * 6. Return response
 */
export async function chatHandler(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const { sessionId, message, mode } = req.body;

  // Validate request
  if (!sessionId || !message) {
    res.status(400).json({
      error: "Missing required fields: sessionId, message",
    });
    return;
  }

  if (! req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log("[ChatHandler] Processing message:", {
    sessionId,
    message:  message.substring(0, 50) + "...",
    mode,
    userId: req.user.userId,
  });

  try {
    // Step 1: Save user message
    await createMessage(sessionId, "user", message);

    // Step 2: Classify intent
    let conversationContext = "";
    try {
      const recentMessages = await getSessionMessages(sessionId);
      conversationContext = recentMessages
        .slice(-4)
        .map((m) => `${m.role}: ${m. content}`)
        .join("\n");
    } catch (error) {
      console.warn("[ChatHandler] Could not load context:", error);
    }

    // Use provided mode hint or classify
    let intent: IntentType;
    if (mode === "data-analysis") {
      intent = "ANALYSIS";
    } else if (mode === "data-preparation") {
      intent = "PREPARATION";
    } else {
      intent = await classifyIntent(message, conversationContext);
    }

    console.log("[ChatHandler] Intent classified as:", intent);

    // Step 3: Route to appropriate agent
    let response: ChatResponse;

    switch (intent) {
      case "ANALYSIS":  {
        const result = await runAnalysisAgent(sessionId, message);
        response = {
          assistantMessage: result. message,
          mode: "ANALYSIS",
          artifacts: result.imageBase64
            ? { imageBase64: result. imageBase64 }
            :  undefined,
        };
        break;
      }

      case "PREPARATION": {
        const result = await runPreparationAgent(sessionId, message);
        response = {
          assistantMessage: result.message,
          mode: "PREPARATION",
          artifacts: 
            result.fileUrl && result.fileName
              ? { fileUrl: result.fileUrl, fileName: result.fileName }
              :  undefined,
        };
        break;
      }

      case "GENERAL": 
      default: {
        const result = await runGeneralAgent(sessionId, message);
        response = {
          assistantMessage: result. message,
          mode: "GENERAL",
        };
        break;
      }
    }

    // Step 4: Save assistant response
    await createMessage(
      sessionId,
      "assistant",
      response.assistantMessage,
      response.artifacts
    );

    console.log("[ChatHandler] Response ready:", {
      mode: response.mode,
      hasArtifacts: !!response. artifacts,
      messageLength: response.assistantMessage.length,
    });

    // Step 5: Return response
    res.json(response);
  } catch (error) {
    console.error("[ChatHandler] Error:", error);

    // Save error message to database
    try {
      await createMessage(
        sessionId,
        "assistant",
        "I encountered an error processing your request. Please try again."
      );
    } catch (saveError) {
      console.error("[ChatHandler] Failed to save error message:", saveError);
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}