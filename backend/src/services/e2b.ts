import { Sandbox } from "e2b";
import { config } from "../config/env";

interface ExecutionResult {
  stdout: string;
  stderr: string;
  success: boolean;
}

interface ExecutionWithFileResult extends ExecutionResult {
  fileContent: Buffer | null;
}

/**
 * Execute Python code in E2B sandbox
 */
export async function executePythonCode(
  code: string,
  timeout: number = 60000
): Promise<ExecutionResult> {
  let sandbox: Sandbox | null = null;

  try {
    // Create sandbox with Python environment
    sandbox = await Sandbox.create("base", {
      apiKey: config.e2bApiKey,
    });

    // Install required packages
    await sandbox.commands.run(
      "pip install pandas matplotlib seaborn requests",
      {
        timeoutMs: 120000,
      }
    );

    // Write the code to a file
    await sandbox.files.write("/tmp/script.py", code);

    // Execute the Python script
    const result = await sandbox.commands.run("python /tmp/script.py", {
      timeoutMs: timeout,
    });

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      success: result.exitCode === 0,
    };
  } catch (error) {
    console.error("[E2B] Code execution failed:", error);
    return {
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  } finally {
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.warn("[E2B] Failed to kill sandbox:", e);
      }
    }
  }
}

/**
 * Execute Python code and retrieve a generated file
 */
export async function executePythonCodeWithFile(
  code: string,
  outputFilePath: string,
  timeout: number = 60000
): Promise<ExecutionWithFileResult> {
  let sandbox: Sandbox | null = null;

  try {
    sandbox = await Sandbox.create("base", {
      apiKey: config.e2bApiKey,
    });

    // Install required packages
    await sandbox.commands.run(
      "pip install pandas matplotlib seaborn requests",
      {
        timeoutMs: 120000,
      }
    );

    // Write and execute the code
    await sandbox.files.write("/tmp/script.py", code);

    const result = await sandbox.commands.run("python /tmp/script.py", {
      timeoutMs: timeout,
    });

    // Try to read the output file
    let fileContent: Buffer | null = null;
    try {
      const fileData = await sandbox.files.read(outputFilePath);
      // Convert to Buffer if it's a string
      if (typeof fileData === "string") {
        fileContent = Buffer.from(fileData, "base64");
      } else {
        fileContent = Buffer.from(fileData);
      }
    } catch (fileError) {
      console.warn("[E2B] Could not read output file:", fileError);
    }

    return {
      stdout: result.stdout,
      stderr: result.stderr,
      success: result.exitCode === 0,
      fileContent,
    };
  } catch (error) {
    console.error("[E2B] Code execution with file failed:", error);
    return {
      stdout: "",
      stderr: error instanceof Error ? error.message : "Unknown error",
      success: false,
      fileContent: null,
    };
  } finally {
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.warn("[E2B] Failed to kill sandbox:", e);
      }
    }
  }
}
