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
  const [shouldAnimate, setShouldAnimate] = useState(false);
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
    if (messages.length === 0) {
      setShouldAnimate(true);
    }
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
            onClick={() => {
              setShouldAnimate(false);
              createNewSession();
            }}
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
              <Menu size={20} />
            </Button>
            <h1 className="text-xl font-semibold text-white">Datagent</h1>
          </div>
        </header>

        {/* Layout */}
        {messages.length === 0 ? (
          // Empty state: center welcome + chatbar together
          <div
            className={`flex-1 flex flex-col items-center justify-center bg-[#0F0F0F] px-8 pb-10 gap-8 text-center ${shouldAnimate ? "transition-all duration-700 ease-out" : ""}`}
          >
            <div
              className={`flex flex-col items-center gap-3 ${shouldAnimate ? "transition-all duration-700 ease-out" : ""}`}
            >
              <div className="text-6xl">🧩</div>
              <h2 className="text-3xl font-light text-gray-200">
                Where should we start?
              </h2>
              <p className="text-gray-500 max-w-md">
                Select a mode and begin your Data Analysis or Preparation task!
              </p>
            </div>

            <div
              className={`w-full max-w-3xl ${shouldAnimate ? "transition-all duration-700 ease-out" : ""}`}
            >
              <div className="bg-[#1F1F1F] border border-[#262626] rounded-[30px] h-auto px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col gap-3 text-gray-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upper section: Text input only */}
                <div className="w-full max-h-7.5rem overflow-y-auto">
                  <textarea
                    value={inputValue}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 120) + "px";
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask Datagent"
                    rows={1}
                    className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg resize-none overflow-hidden"
                  />
                </div>

                {/* Lower section: All controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A] rounded-lg p-1.5 transition-all shrink-0"
                      aria-label="Add file"
                    >
                      <Plus size={28} />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-200 hover:text-white hover:bg-[#2A2A2A] rounded-lg px-2 py-1.5 transition-all text-base font-medium flex items-center gap-2 shrink-0">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-300"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 12h8" />
                            <path d="M5 18h14" />
                          </svg>
                          <span
                            className={`${currentMode === "default" ? "text-gray-200" : "text-blue-300 text-lg font-semibold"}`}
                          >
                            {currentMode === "default"
                              ? "Tools"
                              : getModeLabel(currentMode)}
                          </span>
                          {currentMode !== "default" && (
                            <span
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setMode("default");
                              }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              className="text-blue-300 hover:text-blue-200 text-base cursor-pointer font-bold"
                              aria-label="Clear tool"
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1F1F1F] text-gray-100 border border-[#2D2D2D]">
                        <DropdownMenuItem
                          onClick={() => setMode("data-analysis")}
                          className={`cursor-pointer text-base ${currentMode === "data-analysis" ? "text-blue-400 bg-[#2A2A2A]" : "text-gray-200 hover:bg-[#2A2A2A]"}`}
                        >
                          Data Analysis
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setMode("data-preparation")}
                          className={`cursor-pointer text-base ${currentMode === "data-preparation" ? "text-blue-400 bg-[#2A2A2A]" : "text-gray-200 hover:bg-[#2A2A2A]"}`}
                        >
                          Data Preparation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={isRecording ? handleVoiceStop : handleVoiceStart}
                      disabled={isProcessing}
                      className={`transition-all rounded-lg p-1.5 ${isRecording ? "text-red-500 hover:text-red-400 hover:bg-red-500/10" : "text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]"} disabled:opacity-50`}
                      aria-label="Voice input"
                    >
                      <Mic size={24} />
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || isProcessing}
                      className="text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg p-1.5 disabled:opacity-30 transition-all"
                      aria-label="Send message"
                    >
                      <Send size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Chat state: messages scroll, chatbar pinned bottom
          <div
            className={`flex-1 flex flex-col bg-[#0F0F0F] overflow-hidden ${shouldAnimate ? "animate-in fade-in slide-in-from-top-4 duration-700" : ""}`}
          >
            <div
              className={`flex-1 overflow-y-auto p-8 space-y-6 ${shouldAnimate ? "animate-in fade-in duration-700" : ""}`}
            >
              {messages.map((message) => (
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
              ))}
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

            <div
              className={`bg-[#0F0F0F] px-8 py-8 pb-6 flex justify-center border-t border-[#181818] ${shouldAnimate ? "animate-in slide-in-from-top-8 duration-700" : ""}`}
            >
              <div className="w-full max-w-3xl space-y-4">
                <div
                  className={`bg-[#1F1F1F] border border-[#262626] rounded-[30px] h-auto px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col gap-3 text-gray-200 ${shouldAnimate ? "animate-in slide-in-from-top-4 duration-700" : ""}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Upper section: Text input only */}
                  <div className="w-full max-h-[7.5rem] overflow-y-auto">
                    <textarea
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height =
                          Math.min(e.target.scrollHeight, 120) + "px";
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Ask Datagent"
                      rows={1}
                      className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg resize-none overflow-hidden"
                    />
                  </div>

                  {/* Lower section: All controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A] rounded-lg p-1.5 transition-all shrink-0"
                        aria-label="Add file"
                      >
                        <Plus size={28} />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-200 hover:text-white hover:bg-[#2A2A2A] rounded-lg px-2 py-1.5 transition-all text-base font-medium flex items-center gap-2 shrink-0">
                            <svg
                              width="22"
                              height="22"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-gray-300"
                            >
                              <path d="M3 6h18" />
                              <path d="M8 12h8" />
                              <path d="M5 18h14" />
                            </svg>
                            <span
                              className={`${currentMode === "default" ? "text-gray-200" : "text-blue-300 text-lg font-semibold"}`}
                            >
                              {currentMode === "default"
                                ? "Tools"
                                : getModeLabel(currentMode)}
                            </span>
                            {currentMode !== "default" && (
                              <span
                                onPointerDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMode("default");
                                }}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="text-blue-300 hover:text-blue-200 text-base cursor-pointer font-bold"
                                aria-label="Clear tool"
                              >
                                ✕
                              </span>
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1F1F1F] text-gray-100 border border-[#2D2D2D]">
                          <DropdownMenuItem
                            onClick={() => setMode("data-analysis")}
                            className={`cursor-pointer ${currentMode === "data-analysis" ? "text-blue-400 bg-[#2A2A2A]" : "text-gray-200 hover:bg-[#2A2A2A]"}`}
                          >
                            Data Analysis
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setMode("data-preparation")}
                            className={`cursor-pointer ${currentMode === "data-preparation" ? "text-blue-400 bg-[#2A2A2A]" : "text-gray-200 hover:bg-[#2A2A2A]"}`}
                          >
                            Data Preparation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={
                          isRecording ? handleVoiceStop : handleVoiceStart
                        }
                        disabled={isProcessing}
                        className={`transition-all rounded-lg p-1.5 ${isRecording ? "text-red-500 hover:text-red-400 hover:bg-red-500/10" : "text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]"} disabled:opacity-50`}
                        aria-label="Voice input"
                      >
                        <Mic size={24} />
                      </button>

                      <button
                        onClick={handleSendMessage}
                        disabled={
                          !inputValue.trim() || isLoading || isProcessing
                        }
                        className="text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg p-1.5 disabled:opacity-30 transition-all"
                        aria-label="Send message"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
