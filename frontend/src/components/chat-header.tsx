"use client";

export function ChatHeader() {
  return (
    <header className="bg-[#0F0F0F] px-6 py-4 flex items-center justify-between border-b border-[#1A1A1A]">
      <div className="flex items-center gap-4">
        <h1
          className="text-2xl font-semibold tracking-tight bg-linear-to-r from-white via-blue-100 to-white bg-clip-text text-transparent"
          style={{
            fontFamily:
              "'Poppins', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          Datagent
        </h1>
      </div>
    </header>
  );
}
