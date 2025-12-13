"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/theme-context";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <header className="bg-[#1A1A1A] border-b border-[#2D2D2D] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold text-gray-100">Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="p-6 border border-[#2D2D2D] bg-[#1A1A1A]">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon size={20} className="text-gray-400" />
                ) : (
                  <Sun size={20} className="text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-100">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    {theme === "dark" ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-[#2D2D2D] bg-[#1A1A1A]">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Auto-save Conversations</p>
                <p className="text-sm text-gray-500">
                  Automatically save your chat history
                </p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>

            <div className="border-t border-[#2D2D2D] pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-100">Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive notifications for completed analyses
                </p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-[#2D2D2D] bg-[#1A1A1A]">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-300">Application:</span> Datagent
            </p>
            <p>
              <span className="font-medium text-gray-300">Version:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium text-gray-300">Powered by:</span> Gemini 1.5 Pro
            </p>
            <p className="mt-4">
              Professional data analysis and preparation tool designed for seamless backend integration.
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-[#2D2D2D] bg-[#1A1A1A]">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">API Configuration</h2>
          <div className="space-y-2 text-sm text-gray-500 break-all">
            <p>
              <span className="font-medium text-gray-300">Backend URL:</span>{" "}
              {process.env.NEXT_PUBLIC_API_BASE_URL || "Not configured"}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              The frontend is configured to communicate with the backend API for chat, file uploads, and voice transcription.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}