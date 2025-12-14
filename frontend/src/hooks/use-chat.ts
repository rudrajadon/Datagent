"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";

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

export function useChat() {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<
    "default" | "data-analysis" | "data-preparation"
  >("default");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load sessions from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("datagent-sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(
          parsed.map((s: any) => ({ ...s, createdAt: new Date(s.createdAt) }))
        );
      } catch {}
    }
  }, []);

  // Save sessions to localStorage
  const persistSessions = useCallback((next: ChatSession[]) => {
    setSessions(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("datagent-sessions", JSON.stringify(next));
    }
  }, []);

  // Save messages to localStorage
  const persistMessages = useCallback((sessionId: string, msgs: Message[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `datagent-messages-${sessionId}`,
        JSON.stringify(msgs)
      );
    }
  }, []);

  // Load messages from localStorage
  const loadMessages = useCallback((sessionId: string): Message[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(`datagent-messages-${sessionId}`);
    if (saved) {
      try {
        return JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      } catch {}
    }
    return [];
  }, []);

  // Create new session (local only)
  const createNewSession = useCallback(async () => {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Please sign in to start a chat");

      const session = await apiClient.createSession(
        "New Chat",
        currentMode,
        token
      );
      const newSession: ChatSession = {
        id: session.id,
        title: session.title,
        createdAt: new Date(session.createdAt),
        mode: session.mode as ChatSession["mode"],
      };
      persistSessions([newSession, ...sessions]);
      setCurrentSessionId(session.id);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  }, [currentMode, sessions, persistSessions, getToken]);

  // Send message
  const addMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      setError(null);

      // Ensure we have a persisted session on the backend
      let sessionId = currentSessionId;
      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in to continue");
      }

      if (!sessionId) {
        const session = await apiClient.createSession(
          content.substring(0, 40) || "New Chat",
          currentMode,
          token
        );
        const newSession: ChatSession = {
          id: session.id,
          title: session.title,
          createdAt: new Date(session.createdAt),
          mode: session.mode as ChatSession["mode"],
        };
        persistSessions([newSession, ...sessions]);
        setCurrentSessionId(session.id);
        sessionId = session.id;
      }

      // Add user message immediately
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        // Call backend API
        const response = await apiClient.chat(
          {
            sessionId,
            message: content,
            mode: currentMode,
          },
          token
        );

        // Add assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: response.assistantMessage,
          timestamp: new Date(),
          artifacts: response.artifacts,
        };

        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        persistMessages(sessionId!, finalMessages);

        // Update session title if first message
        if (messages.length === 0) {
          const updatedSessions = sessions.map((s) =>
            s.id === sessionId ? { ...s, title: content.substring(0, 40) } : s
          );
          persistSessions(updatedSessions);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);

        const errorMsg: Message = {
          id: `msg-${Date.now() + 2}`,
          role: "assistant",
          content: `❌ Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages([...updatedMessages, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentSessionId,
      currentMode,
      messages,
      sessions,
      getToken,
      persistSessions,
      persistMessages,
    ]
  );

  // Upload file
  const uploadFile = useCallback(
    async (file: File) => {
      if (!currentSessionId) {
        setError("Please start a chat first");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) throw new Error("Please sign in to upload files");

        const response = await apiClient.uploadFile(
          file,
          currentSessionId,
          token
        );

        const fileMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: `📎 Uploaded: **${response.fileName}** (${(response.fileSize / 1024).toFixed(1)} KB)`,
          timestamp: new Date(),
          artifacts: {
            fileUrl: response.fileUrl,
            fileName: response.fileName,
          },
        };

        const updatedMessages = [...messages, fileMessage];
        setMessages(updatedMessages);
        persistMessages(currentSessionId, updatedMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, messages, getToken, persistMessages]
  );

  // Add file message (display only)
  const addFileMessage = useCallback((fileName: string) => {
    const fileMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: `📎 Uploaded: **${fileName}**`,
      timestamp: new Date(),
      artifacts: { fileName },
    };
    setMessages((prev) => [...prev, fileMessage]);
  }, []);

  // Set mode
  const setMode = useCallback(
    (mode: "default" | "data-analysis" | "data-preparation") => {
      setCurrentMode(mode);
    },
    []
  );

  // Load session
  const loadSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentMode(session.mode);
        setMessages(loadMessages(sessionId));
      }
      setError(null);
    },
    [sessions, loadMessages]
  );

  // Delete session
  const deleteSession = useCallback(
    (sessionId: string) => {
      persistSessions(sessions.filter((s) => s.id !== sessionId));
      if (typeof window !== "undefined") {
        localStorage.removeItem(`datagent-messages-${sessionId}`);
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
    [currentSessionId, sessions, persistSessions]
  );

  // Clear messages
  const clearMessages = useCallback(() => setMessages([]), []);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    messages,
    isLoading,
    error,
    currentMode,
    currentSessionId,
    sessions,
    addMessage,
    addFileMessage,
    uploadFile,
    setMode,
    createNewSession,
    loadSession,
    deleteSession,
    clearMessages,
    clearError,
  };
}
