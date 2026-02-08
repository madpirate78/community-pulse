"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

interface DemoRegenButtonProps {
  onStream: (text: string) => void;
}

export function DemoRegenButton({ onStream }: DemoRegenButtonProps) {
  const searchParams = useSearchParams();
  const [generating, setGenerating] = useState(false);

  if (searchParams.get("demo") !== "true") return null;

  async function handleClick() {
    setGenerating(true);
    onStream("");

    try {
      const res = await fetch("/api/generate-insight", { method: "POST" });

      if (!res.ok || !res.body) {
        onStream("Failed to generate insight.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        onStream(accumulated);
      }

    } catch {
      onStream("Error connecting to generation endpoint.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={generating}
      className="text-xs text-muted border border-muted/30 rounded px-2 py-1 hover:text-foreground hover:border-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {generating ? "Generating\u2026" : "Regenerate"}
    </button>
  );
}
