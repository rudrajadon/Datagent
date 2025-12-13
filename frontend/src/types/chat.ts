export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  artifacts?: {
    imageBase64?: string;
    fileUrl?: string;
    fileName?: string;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  mode: "default" | "data-analysis" | "data-preparation";
}

export type ChatMode = "default" | "data-analysis" | "data-preparation";
