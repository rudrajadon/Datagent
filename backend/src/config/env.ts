import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env. CORS_ORIGIN || "http://localhost:3000",

  // Gemini API
  geminiApiKey: process.env. GEMINI_API_KEY || "",

  // E2B Sandbox
  e2bApiKey:  process.env.E2B_API_KEY || "",

  // Supabase
  supabaseUrl: process.env. SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || "data-files",

  // OpenAI
  openaiApiKey: process. env.OPENAI_API_KEY || "",

  // Clerk
  clerkSecretKey:  process.env.CLERK_SECRET_KEY || "",
};

// Validate required config
export function validateConfig(): void {
  const required = [
    "geminiApiKey",
    "supabaseUrl",
    "supabaseServiceKey",
    "openaiApiKey",
    "clerkSecretKey",
  ];

  const missing = required.filter(
    (key) => !config[key as keyof typeof config]
  );

  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(", ")}`);
    console.warn("Some features may not work correctly.");
  }
}