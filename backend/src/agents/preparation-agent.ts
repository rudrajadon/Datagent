import { generateCleaningCode } from "../services/gemini";
import { executePythonCodeWithFile } from "../services/e2b";
import {
  getLatestDataVersion,
  getSessionDataVersions,
  uploadFileToStorage,
  createDataVersion,
} from "../services/supabase";

export interface PreparationResult {
  message: string;
  fileUrl?:  string;
  fileName?: string;
  success: boolean;
}

/**
 * Preparation Agent - Handles data cleaning and transformation
 * 
 * Flow:
 * 1. Get the latest data version for the session
 * 2. Generate Python cleaning code using Gemini
 * 3. Execute code in E2B sandbox
 * 4. Upload cleaned data as new version
 * 5. Return download link
 */
export async function runPreparationAgent(
  sessionId: string,
  userMessage: string
): Promise<PreparationResult> {
  console. log("[PreparationAgent] Starting preparation for session:", sessionId);

  // Step 1: Get the latest uploaded data
  const latestVersion = await getLatestDataVersion(sessionId);

  if (!latestVersion) {
    return {
      message: "🧹 I can help you clean and transform your data!  But first, please upload a CSV file.  Once uploaded, I can help you:\n\n• Remove duplicates\n• Handle missing values\n• Filter rows\n• Transform columns\n• And much more!",
      success:  false,
    };
  }

  console.log("[PreparationAgent] Using data file:", latestVersion.fileUrl);

  try {
    // Step 2: Generate Python code for cleaning
    console.log("[PreparationAgent] Generating cleaning code...");
    const cleaningCode = await generateCleaningCode(
      userMessage,
      latestVersion. fileUrl,
      `File: ${latestVersion.fileName}`
    );

    console.log("[PreparationAgent] Generated code:\n", cleaningCode.substring(0, 200) + "...");

    // Step 3: Execute in E2B sandbox
    console.log("[PreparationAgent] Executing in sandbox...");
    const result = await executePythonCodeWithFile(
      cleaningCode,
      "/tmp/cleaned_data.csv",
      90000
    );

    console.log("[PreparationAgent] Execution result:", {
      success: result. success,
      hasFile: !!result.fileContent,
      stdout: result.stdout.substring(0, 300),
    });

    if (result.success && result.fileContent) {
      // Step 4: Determine new version number
      const existingVersions = await getSessionDataVersions(sessionId);
      const versionNumber = existingVersions. length;
      const newVersion = `v${versionNumber}`;

      // Step 5: Upload cleaned file to storage
      const cleanedFileName = `cleaned_${latestVersion.fileName}`;
      const { fileUrl } = await uploadFileToStorage(
        sessionId,
        cleanedFileName,
        result.fileContent,
        newVersion
      );

      // Step 6: Create data version record
      await createDataVersion(
        sessionId,
        newVersion,
        cleanedFileName,
        fileUrl,
        result.fileContent.length,
        `Cleaned data:  ${userMessage. substring(0, 100)}`
      );

      // Extract summary from stdout
      const summary = result.stdout || "Data cleaning completed successfully. ";

      return {
        message: `✅ **Data Cleaned Successfully! **\n\nI've processed your data and created a new version (**${newVersion}**).\n\n**Summary:**\n${summary}\n\n📥 You can download the cleaned data using the link below.  Future analysis requests will automatically use this cleaned version. `,
        fileUrl,
        fileName: cleanedFileName,
        success: true,
      };
    } else {
      const errorDetails = result.stderr || result.stdout || "Unknown error";
      console.error("[PreparationAgent] Execution failed:", errorDetails);

      return {
        message: `I tried to clean your data but encountered an issue.\n\n**Error details:**\n\`\`\`\n${errorDetails.substring(0, 300)}\n\`\`\`\n\nCould you try being more specific about what you'd like to do with the data? `,
        success: false,
      };
    }
  } catch (error) {
    console.error("[PreparationAgent] Error:", error);
    return {
      message: "I encountered an error while processing your data. Please try again or rephrase your request.",
      success: false,
    };
  }
}