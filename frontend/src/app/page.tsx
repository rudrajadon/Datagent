"use client";

import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatHeader } from "@/components/chat-header";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { EmptyState } from "@/components/empty-state";
import { useChat } from "@/hooks/use-chat";
import { useVoiceRecording } from "@/hooks/use-voice-recording";

export default function ChatPage() {
  const router = require("next/navigation").useRouter();
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onCreateSession={() => {
          setShouldAnimate(false);
          createNewSession();
        }}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        getModeLabel={getModeLabel}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0F0F0F]">
        <ChatHeader />

        {/* Layout */}
        {messages.length === 0 ? (
          <EmptyState
            shouldAnimate={shouldAnimate}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSendMessage}
            onFileUpload={handleFileUpload}
            onSelectMode={setMode}
            currentMode={currentMode}
            getModeLabel={getModeLabel}
            isRecording={isRecording}
            isProcessing={isProcessing}
            isLoading={isLoading}
            onVoiceStart={handleVoiceStart}
            onVoiceStop={handleVoiceStop}
          />
        ) : (
          <div className={`flex-1 flex flex-col bg-[#0F0F0F] overflow-hidden`}>
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              voiceError={voiceError}
              shouldAnimate={shouldAnimate}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSendMessage}
              onFileUpload={handleFileUpload}
              onSelectMode={setMode}
              currentMode={currentMode}
              getModeLabel={getModeLabel}
              isRecording={isRecording}
              isProcessing={isProcessing}
              isLoading={isLoading}
              onVoiceStart={handleVoiceStart}
              onVoiceStop={handleVoiceStop}
              shouldAnimate={shouldAnimate}
              modeLocked={messages.length > 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
