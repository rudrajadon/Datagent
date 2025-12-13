"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function ExamplePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-6 space-y-4">
        <Loader2 className="animate-spin" />
        <Streamdown>Any **markdown** content</Streamdown>
        <Button variant="default">Example Button</Button>
      </main>
    </div>
  );
}