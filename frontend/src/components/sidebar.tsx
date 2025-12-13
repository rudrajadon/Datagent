"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Settings,
  Menu,
  Search,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatSession } from "@/types/chat";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onCreateSession: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  getModeLabel: (mode: string) => string;
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  sessions,
  currentSessionId,
  onCreateSession,
  onLoadSession,
  onDeleteSession,
  getModeLabel,
}: SidebarProps) {
  const router = useRouter();

  return (
    <aside
      className={`${
        sidebarOpen ? "w-72" : "w-16"
      } bg-[#1A1A1A] border-r border-[#2D2D2D] transition-all duration-300 overflow-hidden flex flex-col`}
    >
      {/* Header Section */}
      <div className="p-4 border-b border-[#2D2D2D]">
        <div className="flex items-center justify-between gap-2 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200 p-2 shrink-0"
          >
            <Menu size={26} />
          </Button>
          {sidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200 p-2 shrink-0"
            >
              <Search size={26} />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onCreateSession();
          }}
          className="w-full text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200 p-2 justify-start"
        >
          <Plus size={26} className={sidebarOpen ? "mr-2" : ""} />
          {sidebarOpen && "New chat"}
        </Button>
      </div>

      {/* Chat Sessions List */}
      {sidebarOpen && (
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
                onClick={() => onLoadSession(session.id)}
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
                        onClick={() => onDeleteSession(session.id)}
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
      )}

      {/* Settings Footer */}
      <div className="p-4 border-t border-[#2D2D2D] mt-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/settings")}
          className="w-full text-gray-400 hover:bg-[#2D2D2D] hover:text-gray-200 p-2 justify-start"
        >
          <Settings size={26} className={sidebarOpen ? "mr-2" : ""} />
          {sidebarOpen && "Settings"}
        </Button>
      </div>
    </aside>
  );
}
