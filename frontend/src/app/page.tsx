"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Settings,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Trash2,
  Menu,
  X,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { useChat } from "@/hooks/use-chat";
import { useVoiceRecording } from "@/hooks/use-voice-recording";

export default function ChatPage() {
  const router = useRouter();
  const {
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
  } = useChat();

  const {
    isRecording,
    isProcessing,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceRecording();

  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    await addMessage(inputValue);
    setInputValue("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addFileMessage(file.name);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVoiceStart = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleVoiceStop = async () => {
    const transcript = await stopRecording();
    if (transcript) setInputValue(transcript);
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "data-analysis":
        return "Data Analysis";
      case "data-preparation":
        return "Data Preparation";
      default:
        return "Default";
    }
  };

  return (
    <div className="flex h-screen bg-[#0F0F0F]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-[#1A1A1A] border-r border-[#2D2D2D] transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-[#2D2D2D]">
          <Button
            onClick={createNewSession}
            className="w-full bg-white hover:bg-gray-200 text-black rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={18} />
            New chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No chats yet
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id
                    ? "bg-[#2D2D2D]"
                    : "hover:bg-[#2D2D2D]"
                }`}
                onClick={() => loadSession(session.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getModeLabel(session.mode)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#3A3A3A]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#2D2D2D] border-[#3A3A3A]">
                      <DropdownMenuItem
                        onClick={() => deleteSession(session.id)}
                        className="text-red-400 cursor-pointer"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#2D2D2D]">
          <Button
            variant="ghost"
            onClick={() => router.push("/settings")}
            className="w-full justify-start text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200"
          >
            <Settings size={18} className="mr-2" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0F0F0F]">
        <header className="bg-[#1A1A1A] border-b border-[#2D2D2D] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-xl font-semibold text-white">Datagent</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0F0F0F]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <div className="text-5xl mb-4">✨</div>
              </div>
              <h2 className="text-3xl font-light text-gray-200 mb-3">
                Where should we start?
              </h2>
              <p className="text-gray-500 max-w-md">
                Select a mode and begin your data analysis or preparation task.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl ${
                    message.role === "user"
                      ? "bg-[#2D2D2D] text-gray-100 rounded-2xl rounded-tr-none px-4 py-3"
                      : "text-gray-200 rounded-2xl rounded-tl-none px-4 py-3"
                  }`}
                >
                  {message.artifacts?.imageBase64 && (
                    <img
                      src={`data:image/png;base64,${message.artifacts.imageBase64}`}
                      alt="Analysis result"
                      className="mb-3 rounded-lg max-w-full"
                    />
                  )}
                  {message.artifacts?.fileName && (
                    <Card className="mb-3 p-3 bg-[#1A1A1A] border-[#2D2D2D]">
                      <p className="text-sm text-gray-400">
                        📎 {message.artifacts.fileName}
                      </p>
                    </Card>
                  )}
                  <div
                    className={
                      message.role === "assistant"
                        ? "prose prose-sm prose-invert max-w-none"
                        : ""
                    }
                  >
                    {message.role === "assistant" ? (
                      <Streamdown>{message.content}</Streamdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="text-gray-400 rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-100"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          )}
          {voiceError && (
            <div className="flex justify-center">
              <div className="bg-red-900/30 text-red-400 rounded-lg px-4 py-2 text-sm">
                {voiceError}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#0F0F0F] px-8 py-6 pb-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-[#2D2D2D] border border-[#3A3A3A] rounded-3xl flex items-center px-5 py-3 gap-3 hover:border-[#4A4A4A] transition-colors">
              <button className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
                <Plus size={20} />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium flex items-center gap-1 shrink-0">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                    </svg>
                    {getModeLabel(currentMode)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#2D2D2D] border-[#3A3A3A]">
                  <DropdownMenuItem
                    onClick={() => setMode("default")}
                    className={`cursor-pointer ${
                      currentMode === "default"
                        ? "text-blue-400 bg-[#3A3A3A]"
                        : "text-gray-300 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    Default
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setMode("data-analysis")}
                    className={`cursor-pointer ${
                      currentMode === "data-analysis"
                        ? "text-blue-400 bg-[#3A3A3A]"
                        : "text-gray-300 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    Data Analysis
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setMode("data-preparation")}
                    className={`cursor-pointer ${
                      currentMode === "data-preparation"
                        ? "text-blue-400 bg-[#3A3A3A]"
                        : "text-gray-300 hover:bg-[#3A3A3A]"
                    }`}
                  >
                    Data Preparation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask Datagent"
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 outline-none text-sm"
              />

              <div className="flex items-center gap-2 shrink-0">
                <label className="text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Paperclip size={18} />
                </label>

                <button
                  onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                  disabled={isProcessing}
                  className={`transition-colors ${
                    isRecording
                      ? "text-red-500 hover:text-red-400"
                      : "text-gray-500 hover:text-gray-300"
                  } disabled:opacity-50`}
                >
                  <Mic size={18} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isProcessing}
                  className="text-gray-500 hover:text-gray-300 disabled:opacity-30 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
