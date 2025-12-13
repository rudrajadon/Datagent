"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Send, Mic } from "lucide-react";
import { useRef } from "react";

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectMode: (
    mode: "default" | "data-analysis" | "data-preparation"
  ) => void;
  currentMode: string;
  getModeLabel: (mode: string) => string;
  isRecording: boolean;
  isProcessing: boolean;
  isLoading: boolean;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  shouldAnimate: boolean;
  isEmptyState?: boolean;
}

export function ChatInput({
  inputValue,
  onInputChange,
  onSend,
  onFileUpload,
  onSelectMode,
  currentMode,
  getModeLabel,
  isRecording,
  isProcessing,
  isLoading,
  onVoiceStart,
  onVoiceStop,
  shouldAnimate,
  isEmptyState = false,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return isEmptyState ? (
    <div className="w-full max-w-4xl space-y-4">
      <div
        className={`bg-[#1F1F1F] border border-[#262626] rounded-[30px] h-auto px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col gap-3 text-gray-200 ${
          shouldAnimate ? "animate-in slide-in-from-top-4 duration-700" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={onFileUpload}
          className="hidden"
        />

        {/* Text Input */}
        <div className="w-full max-h-30 overflow-y-auto">
          <textarea
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyPress={handleKeyPress}
            placeholder="Ask Datagent"
            rows={1}
            className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg resize-none overflow-hidden"
          />
        </div>

        {/* Controls */}
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
                <button className="text-gray-200 hover:text-white hover:bg-[#2A2A2A] rounded-lg px-2 py-1.5 transition-all text-base font-medium flex items-center gap-2 shrink-0 focus:outline-none">
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
                    className={`${
                      currentMode === "default"
                        ? "text-gray-200"
                        : "text-blue-300 text-lg font-medium"
                    }`}
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
                        onSelectMode("default");
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
                  onClick={() => onSelectMode("data-analysis")}
                  className={`cursor-pointer ${
                    currentMode === "data-analysis"
                      ? "text-blue-400 bg-[#2A2A2A]"
                      : "text-gray-200 hover:bg-[#2A2A2A]"
                  }`}
                >
                  Data Analysis
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSelectMode("data-preparation")}
                  className={`cursor-pointer ${
                    currentMode === "data-preparation"
                      ? "text-blue-400 bg-[#2A2A2A]"
                      : "text-gray-200 hover:bg-[#2A2A2A]"
                  }`}
                >
                  Data Preparation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={isRecording ? onVoiceStop : onVoiceStart}
              disabled={isProcessing}
              className={`transition-all rounded-lg p-1.5 ${
                isRecording
                  ? "text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  : "text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]"
              } disabled:opacity-50`}
              aria-label="Voice input"
            >
              <Mic size={24} />
            </button>

            <button
              onClick={onSend}
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
  ) : (
    <div
      className={`bg-[#0F0F0F] px-8 py-8 pb-6 flex justify-center border-t border-[#181818] ${
        shouldAnimate ? "animate-in slide-in-from-top-8 duration-700" : ""
      }`}
    >
      <div className="w-full max-w-4xl space-y-4">
        <div
          className={`bg-[#1F1F1F] border border-[#262626] rounded-[30px] h-auto px-6 py-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex flex-col gap-3 text-gray-200 ${
            shouldAnimate ? "animate-in slide-in-from-top-4 duration-700" : ""
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileUpload}
            className="hidden"
          />

          {/* Text Input */}
          <div className="w-full max-h-30 overflow-y-auto">
            <textarea
              value={inputValue}
              onChange={(e) => {
                onInputChange(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask Datagent"
              rows={1}
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-lg resize-none overflow-hidden"
            />
          </div>

          {/* Controls */}
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
                  <button className="text-gray-200 hover:text-white hover:bg-[#2A2A2A] rounded-lg px-2 py-1.5 transition-all text-base font-medium flex items-center gap-2 shrink-0 focus:outline-none">
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
                      className={`${
                        currentMode === "default"
                          ? "text-gray-200"
                          : "text-blue-300 text-lg font-medium"
                      }`}
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
                          onSelectMode("default");
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
                    onClick={() => onSelectMode("data-analysis")}
                    className={`cursor-pointer ${
                      currentMode === "data-analysis"
                        ? "text-blue-400 bg-[#2A2A2A]"
                        : "text-gray-200 hover:bg-[#2A2A2A]"
                    }`}
                  >
                    Data Analysis
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSelectMode("data-preparation")}
                    className={`cursor-pointer ${
                      currentMode === "data-preparation"
                        ? "text-blue-400 bg-[#2A2A2A]"
                        : "text-gray-200 hover:bg-[#2A2A2A]"
                    }`}
                  >
                    Data Preparation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isRecording ? onVoiceStop : onVoiceStart}
                disabled={isProcessing}
                className={`transition-all rounded-lg p-1.5 ${
                  isRecording
                    ? "text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    : "text-gray-500 hover:text-gray-300 hover:bg-[#2A2A2A]"
                } disabled:opacity-50`}
                aria-label="Voice input"
              >
                <Mic size={24} />
              </button>

              <button
                onClick={onSend}
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
  );
}
