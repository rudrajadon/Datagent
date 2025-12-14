"use client";

import { ChatInput } from "@/components/chat-input";
import { useRef } from "react";

interface EmptyStateProps {
  shouldAnimate: boolean;
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
}

export function EmptyState({
  shouldAnimate,
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
}: EmptyStateProps) {
  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center bg-[#0F0F0F] px-8 pb-10 gap-8 text-center`}
    >
      <div className={`flex flex-col items-center gap-3`}>
        <div className="text-7xl">🧩</div>
        <h2 className="text-4xl font-light text-gray-200">
          Where should we start?
        </h2>
        <p className="text-gray-500 max-w-md text-lg">
          Select a mode and begin your Data Analysis or Preparation task!
        </p>
      </div>

      <ChatInput
        inputValue={inputValue}
        onInputChange={onInputChange}
        onSend={onSend}
        onFileUpload={onFileUpload}
        onSelectMode={onSelectMode}
        currentMode={currentMode}
        getModeLabel={getModeLabel}
        isRecording={isRecording}
        isProcessing={isProcessing}
        isLoading={isLoading}
        onVoiceStart={onVoiceStart}
        onVoiceStop={onVoiceStop}
        shouldAnimate={shouldAnimate}
        isEmptyState={true}
      />
    </div>
  );
}
