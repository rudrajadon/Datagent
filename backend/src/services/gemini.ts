import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { config } from "../config/env";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);
const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Use the Gemini 1.5 Flash model for text generation
const GEMINI_MODEL = "gemini-1.5-flash";
const OPENAI_MODEL = "gpt-4o-mini";

export type IntentType = "ANALYSIS" | "PREPARATION" | "GENERAL";

/**
 * Classify user intent to determine which agent should handle the request
 */
export async function classifyIntent(
  message: string,
  conversationContext: string = ""
): Promise<IntentType> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are an intent classifier for a data analysis assistant.  Classify the following user message into one of three categories: 

1.  ANALYSIS: User wants to analyze data, create visualizations, generate plots, charts, graphs, or explore existing data
   Examples: "create a bar chart", "show me a histogram", "plot the sales data", "visualize the distribution"

2. PREPARATION: User wants to clean, transform, prepare, filter, or process CSV data
   Examples: "remove duplicates", "fill missing values", "filter rows where", "clean the data", "transform column"

3. GENERAL: General conversation, questions about data science, or other requests
   Examples: "what is pandas", "how do I analyze data", "hello", "thank you"

${conversationContext ? `Previous conversation context:\n${conversationContext}\n` : ""}

User message: "${message}"

Respond with ONLY ONE WORD - either ANALYSIS, PREPARATION, or GENERAL.  Nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().toUpperCase();

    if (text.includes("ANALYSIS")) return "ANALYSIS";
    if (text.includes("PREPARATION")) return "PREPARATION";
    return "GENERAL";
  } catch (error) {
    console.error("[Gemini] Intent classification failed:", error);
    return "GENERAL";
  }
}

/**
 * Generate Python code for data visualization
 */
export async function generatePlotCode(
  userRequest: string,
  dataUrl: string,
  dataDescription: string = ""
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are a Python data visualization expert. Generate Python code to create a visualization. 

DATA FILE URL: ${dataUrl}
${dataDescription ? `DATA DESCRIPTION: ${dataDescription}` : ""}

USER REQUEST: "${userRequest}"

REQUIREMENTS:
1. Use pandas to load the CSV from the URL
2. Use matplotlib and/or seaborn for visualization
3. Save the plot as '/tmp/plot.png' with dpi=150
4. Use plt.tight_layout() before saving
5. Handle errors gracefully
6. Print "PLOT_SAVED" when done

Generate ONLY executable Python code. No explanations, no markdown, no code blocks. 
Start directly with import statements.`;

  try {
    const result = await model.generateContent(prompt);
    let code = result.response.text();

    // Clean up the response - remove markdown code blocks if present
    code = code
      .replace(/```python\n? /g, "")
      .replace(/```\n?/g, "")
      .trim();

    return code;
  } catch (error) {
    console.error("[Gemini] Plot code generation failed:", error);
    throw new Error("Failed to generate visualization code");
  }
}

/**
 * Generate Python code for data cleaning/transformation
 */
export async function generateCleaningCode(
  userRequest: string,
  dataUrl: string,
  dataDescription: string = ""
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are a Python data engineering expert. Generate Python code to clean/transform CSV data.

DATA FILE URL: ${dataUrl}
${dataDescription ? `DATA DESCRIPTION: ${dataDescription}` : ""}

USER REQUEST: "${userRequest}"

REQUIREMENTS:
1. Use pandas to load the CSV from the URL
2. Perform the requested cleaning/transformation
3. Save the cleaned data to '/tmp/cleaned_data. csv'
4. Print a summary of changes made
5. Print "CLEANING_COMPLETE" when done
6. Handle errors gracefully

Generate ONLY executable Python code. No explanations, no markdown, no code blocks.
Start directly with import statements. `;

  try {
    const result = await model.generateContent(prompt);
    let code = result.response.text();

    // Clean up the response
    code = code
      .replace(/```python\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return code;
  } catch (error) {
    console.error("[Gemini] Cleaning code generation failed:", error);
    throw new Error("Failed to generate cleaning code");
  }
}

/**
 * Generate a conversational response for general queries
 */
export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const systemPrompt = `You are Datagent, a helpful AI assistant specialized in data analysis and preparation. 
You help users understand data concepts, provide guidance on data analysis techniques, and answer questions about working with data.
Be concise, friendly, and helpful. If the user hasn't uploaded data yet, remind them they can upload a CSV file to get started.`;

  const messages = [
    { role: "user", parts: [{ text: systemPrompt }] },
    {
      role: "model",
      parts: [
        {
          text: "I understand.  I'm Datagent, ready to help with data analysis and preparation.",
        },
      ],
    },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  try {
    const result = await model.generateContent({
      contents: messages,
    });
    return result.response.text();
  } catch (error) {
    console.error("[Gemini] Chat response failed:", error);
    if (!config.openaiApiKey) {
      throw new Error("Failed to generate response");
    }

    // Fallback to OpenAI chat if Gemini is unavailable
    const openAiMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map<ChatCompletionMessageParam>((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    try {
      const openAiResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: openAiMessages,
      });

      return (
        openAiResponse.choices[0]?.message?.content ||
        "I encountered an issue generating a response, but I'm here to help. Could you try again?"
      );
    } catch (fallbackError) {
      console.error("[OpenAI] Chat response failed:", fallbackError);
      throw new Error("Failed to generate response");
    }
  }
}
