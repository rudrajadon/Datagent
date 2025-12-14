import { generateChatResponse } from "../services/gemini";
import { getSessionMessages } from "../services/supabase";

export interface GeneralResult {
  message: string;
  success: boolean;
}

/**
 * General Agent - Handles general conversation
 * 
 * Flow: 
 * 1. Load conversation history
 * 2. Generate response using Gemini
 * 3. Return response
 */
export async function runGeneralAgent(
  sessionId: string,
  userMessage: string
): Promise<GeneralResult> {
  console.log("[GeneralAgent] Processing general query for session:", sessionId);

  try {
    // Step 1: Load recent conversation history
    let conversationHistory:  Array<{ role: string; content: string }> = [];

    try {
      const messages = await getSessionMessages(sessionId);
      // Get last 10 messages for context
      conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
    } catch (error) {
      console.warn("[GeneralAgent] Could not load history:", error);
      // Continue without history
    }

    // Step 2: Generate response
    console.log("[GeneralAgent] Generating response with history length:", conversationHistory.length);
    const response = await generateChatResponse(userMessage, conversationHistory);

    return {
      message: response,
      success: true,
    };
  } catch (error) {
    console.error("[GeneralAgent] Error:", error);
    return {
      message: "I'm sorry, I encountered an error processing your request. Please try again.",
      success: false,
    };
  }
}