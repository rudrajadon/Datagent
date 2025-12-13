"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  currentMode: "default" | "data-analysis" | "data-preparation";
  currentSessionId: string | null;
  sessions: ChatSession[];
  addMessage: (content: string) => Promise<void>;
  addFileMessage: (fileName: string) => void;
  setMode: (mode: "default" | "data-analysis" | "data-preparation") => void;
  createNewSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearMessages: () => void;
}

/**
 * Custom hook for managing chat state and operations.
 * Handles message management, session management, and API integration.
 * Ready for backend integration via env vars.
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<
    "default" | "data-analysis" | "data-preparation"
  >("default");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const sessionIdRef = useRef<string | null>(null);

  // Load sessions from localStorage on mount (SSR-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("chatSessions");
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const persistSessions = useCallback((next: ChatSession[]) => {
    setSessions(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatSessions", JSON.stringify(next));
    }
  }, []);

  const persistMessages = useCallback(
    (sessionId: string, next: Message[]) => {
      setMessages(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(`messages-${sessionId}`, JSON.stringify(next));
      }
    },
    []
  );

  const addMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // Ensure session exists
      let effectiveSessionId = currentSessionId;
      if (!effectiveSessionId) {
        const newSessionId = `session-${Date.now()}`;
        const newSession: ChatSession = {
          id: newSessionId,
          title: content.substring(0, 50) || "New Chat",
          createdAt: new Date(),
          mode: currentMode,
        };
        const nextSessions = [newSession, ...sessions];
        persistSessions(nextSessions);
        setCurrentSessionId(newSessionId);
        sessionIdRef.current = newSessionId;
        effectiveSessionId = newSessionId;
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);

      try {
        // Placeholder for backend API call
        // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, { ... });
        // const data = await res.json();

        await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate delay

        const assistantMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `This is a placeholder response for **${currentMode}** mode. In production, this would be powered by Gemini 1.5 Pro.`,
          timestamp: new Date(),
        };

        const finalMessages = [...nextMessages, assistantMessage];
        if (effectiveSessionId) {
          persistMessages(effectiveSessionId, finalMessages);
        } else {
          setMessages(finalMessages);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        const errorMessage: Message = {
          id: `msg-${Date.now() + 2}`,
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId, currentMode, messages, persistMessages, persistSessions, sessions]
  );

  const addFileMessage = useCallback((fileName: string) => {
    const fileMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: `📎 Uploaded file: ${fileName}`,
      timestamp: new Date(),
      artifacts: { fileName },
    };
    setMessages((prev) => [...prev, fileMessage]);
  }, []);

  const setMode = useCallback(
    (mode: "default" | "data-analysis" | "data-preparation") => {
      setCurrentMode(mode);
      if (currentSessionId) {
        const updatedSessions = sessions.map((s) =>
          s.id === currentSessionId ? { ...s, mode } : s
        );
        persistSessions(updatedSessions);
      }
    },
    [currentSessionId, persistSessions, sessions]
  );

  const createNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Chat",
      createdAt: new Date(),
      mode: "default",
    };
    const nextSessions = [newSession, ...sessions];
    persistSessions(nextSessions);
    setCurrentSessionId(newSessionId);
    sessionIdRef.current = newSessionId;
    setMessages([]);
    setCurrentMode("default");
  }, [persistSessions, sessions]);

  const loadSession = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId);
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentMode(session.mode);
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(`messages-${sessionId}`);
          if (saved) {
            try {
              setMessages(JSON.parse(saved));
            } catch {
              setMessages([]);
            }
          } else {
            setMessages([]);
          }
        }
      }
    },
    [sessions]
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      const next = sessions.filter((s) => s.id !== sessionId);
      persistSessions(next);
      if (typeof window !== "undefined") {
        localStorage.removeItem(`messages-${sessionId}`);
      }
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
    [currentSessionId, persistSessions, sessions]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    currentMode,
    currentSessionId,
    sessions,
    addMessage,
    addFileMessage,
    setMode,
    createNewSession,
    loadSession,
    deleteSession,
    clearMessages,
  };
}