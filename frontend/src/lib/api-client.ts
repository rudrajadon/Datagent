/**
 * API Client for Gemini Data Forge Frontend
 * Handles all communication with the backend API
 *
 * Environment Variables (Next.js):
 * - NEXT_PUBLIC_API_BASE_URL: Backend API base URL
 * - NEXT_PUBLIC_API_KEY: Optional API key for authentication
 *
 * Example:
 *   const response = await apiClient.chat({ sessionId, message, mode });
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

interface ChatRequest {
  sessionId: string;
  message: string;
  mode: "default" | "data-analysis" | "data-preparation";
}

interface ChatResponse {
  assistantMessage: string;
  artifacts?: {
    imageBase64?: string;
    fileUrl?: string;
    fileName?: string;
  };
}

interface TranscribeResponse {
  transcript: string;
}

interface UploadResponse {
  success: boolean;
  fileName: string;
  fileSize: number;
}

class APIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || "";
  }

  private getHeaders(json = true): HeadersInit {
    const headers: HeadersInit = json ? { "Content-Type": "application/json" } : {};
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    return headers;
  }

  /**
   * Send a chat message to the backend
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Chat API error: ${response.statusText}`);
    return response.json();
  }

  /**
   * Upload a file to the backend
   */
  async uploadFile(file: File, sessionId: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: formData,
    });
    if (!response.ok) throw new Error(`Upload API error: ${response.statusText}`);
    return response.json();
  }

  /**
   * Transcribe audio to text using Whisper ASR
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    const response = await fetch(`${this.baseUrl}/transcribe`, {
      method: "POST",
      headers: this.getHeaders(false),
      body: formData,
    });
    if (!response.ok) throw new Error(`Transcribe API error: ${response.statusText}`);
    return response.json();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        headers: this.getHeaders(true),
      });
      return response.ok;
    } catch (error) {
      console.error("Health check error:", error);
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_URL, API_KEY);

// Export class for testing
export { APIClient };