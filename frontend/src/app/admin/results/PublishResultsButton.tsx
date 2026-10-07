"use client";

import React, { useState } from "react";
import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  examId: string;
  isPublished: boolean;
  hasResults: boolean;
}

export function PublishResultsButton({ examId, isPublished, hasResults }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!hasResults) {
      toast.error("No results computed for this examination yet.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          publish: !isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle result status");

      toast.success(data.message);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || !hasResults}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
        !hasResults
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : isPublished
          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
          : "bg-indigo-600 hover:bg-indigo-700 text-white"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPublished ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Published to Students
        </>
      ) : (
        <>
          <Lock className="w-3.5 h-3.5" />
          Publish Results
        </>
      )}
    </button>
  );
}
