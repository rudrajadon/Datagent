import { generatePlotCode } from "../services/gemini";
import { executePythonCodeWithFile } from "../services/e2b";
import { getLatestDataVersion } from "../services/supabase";

export interface AnalysisResult {
  message: string;
  imageBase64?:  string;
  success: boolean;
}

/**
 * Analysis Agent - Handles data visualization requests
 * 
 * Flow:
 * 1. Get the latest data version for the session
 * 2. Generate Python plotting code using Gemini
 * 3. Execute code in E2B sandbox
 * 4. Return base64-encoded image
 */
export async function runAnalysisAgent(
  sessionId: string,
  userMessage: string
): Promise<AnalysisResult> {
  console.log("[AnalysisAgent] Starting analysis for session:", sessionId);

  // Step 1: Get the latest uploaded data
  const latestVersion = await getLatestDataVersion(sessionId);

  if (!latestVersion) {
    return {
      message: "📊 I'd love to help you visualize your data! But first, please upload a CSV file using the upload button.  Once you do, I can create charts, graphs, and plots for you.",
      success: false,
    };
  }

  console.log("[AnalysisAgent] Using data file:", latestVersion.fileUrl);

  try {
    // Step 2: Generate Python code for the visualization
    console.log("[AnalysisAgent] Generating plot code...");
    const plotCode = await generatePlotCode(
      userMessage,
      latestVersion.fileUrl,
      `File: ${latestVersion.fileName}`
    );

    console.log("[AnalysisAgent] Generated code:\n", plotCode. substring(0, 200) + "...");

    // Step 3: Execute in E2B sandbox
    console. log("[AnalysisAgent] Executing in sandbox...");
    const result = await executePythonCodeWithFile(
      plotCode,
      "/tmp/plot.png",
      90000 // 90 second timeout for complex plots
    );

    console.log("[AnalysisAgent] Execution result:", {
      success: result.success,
      hasFile: !!result.fileContent,
      stdout: result.stdout. substring(0, 200),
      stderr: result.stderr. substring(0, 200),
    });

    if (result.success && result.fileContent) {
      // Convert image to base64
      const imageBase64 = result.fileContent. toString("base64");

      return {
        message: "📊 Here's your visualization! I created this chart based on your data.  Let me know if you'd like any modifications or a different type of chart.",
        imageBase64,
        success: true,
      };
    } else {
      // Execution failed - provide helpful error message
      const errorDetails = result.stderr || result.stdout || "Unknown error";
      console.error("[AnalysisAgent] Execution failed:", errorDetails);

      return {
        message: `I tried to create the visualization but encountered an issue.  This might be due to the data format or the type of chart requested.\n\n**Error details:**\n\`\`\`\n${errorDetails. substring(0, 300)}\n\`\`\`\n\nCould you try rephrasing your request or check if your data has the columns you're referring to? `,
        success: false,
      };
    }
  } catch (error) {
    console.error("[AnalysisAgent] Error:", error);
    return {
      message: "I encountered an error while creating your visualization. Please try again or rephrase your request.",
      success: false,
    };
  }
}