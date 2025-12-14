"use client";

import { Message } from "@/types/chat";
import { Card } from "@/components/ui/card";
import { Streamdown } from "streamdown";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  voiceError: string | null | undefined;
  shouldAnimate: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isLoading,
  voiceError,
  shouldAnimate,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth ${
        shouldAnimate ? "animate-in fade-in duration-700" : ""
      }`}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-3xl ${
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
  );
}
