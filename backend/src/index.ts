import express from "express";
import cors from "cors";
import { config, validateConfig } from "./config/env";
import apiRoutes from "./routes/api";

// Validate environment variables
validateConfig();

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api", apiRoutes);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📍 Health check: http://localhost:${config.port}/health`);
  console.log(`🔗 API base: http://localhost:${config.port}/api`);
});