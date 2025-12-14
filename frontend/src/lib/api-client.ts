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
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface ChatRequest {
  sessionId: string;
  message: string;
  mode: "default" | "data-analysis" | "data-preparation";
}

export interface ChatResponse {
  assistantMessage: string;
  mode: string;
  artifacts?: {
    imageBase64?: string;
    fileUrl?: string;
    fileName?: string;
  };
}

export interface TranscribeResponse {
  transcript: string;
  language?: string;
}

export interface UploadResponse {
  success: boolean;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  version?: string;
}

export interface SessionResponse {
  id: string;
  title: string;
  mode: string;
  createdAt: string;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string, json = true): HeadersInit {
    const headers: HeadersInit = json
      ? { "Content-Type": "application/json" }
      : {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  /**
   * Send a chat message to the backend
   */
  async chat(request: ChatRequest, token: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: this.getHeaders(token, true),
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Upload a file to the backend
   */
  async uploadFile(
    file: File,
    sessionId: string,
    token: string
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers: this.getHeaders(token, false),
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Upload error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Transcribe audio to text using Whisper ASR
   */
  async transcribeAudio(
    audioBlob: Blob,
    token?: string
  ): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.wav");

    const response = await fetch(`${this.baseUrl}/transcribe`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Transcribe error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl.replace("/api", "/health"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return response.ok;
    } catch (error) {
      console.error("Health check error:", error);
      return false;
    }
  }

  async createSession(
    title: string,
    mode: string,
    token: string
  ): Promise<SessionResponse> {
    const response = await fetch(`${this.baseUrl}/sessions`, {
      method: "POST",
      headers: this.getHeaders(token, true),
      body: JSON.stringify({ title, mode }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `Session error: ${response.status}`);
    }
    return response.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient(API_URL);

// Export class for testing
export { APIClient };
