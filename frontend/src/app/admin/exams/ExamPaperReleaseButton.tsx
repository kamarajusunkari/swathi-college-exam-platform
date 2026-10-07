"use client";

import React, { useState } from "react";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  paperId: string;
  isReleased: boolean;
}

export function ExamPaperReleaseButton({ paperId, isReleased }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          release: !isReleased,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle release");

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
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
        isReleased
          ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isReleased ? (
        <>
          <Lock className="w-3.5 h-3.5" />
          Hold in Vault
        </>
      ) : (
        <>
          <Unlock className="w-3.5 h-3.5" />
          Release (2h Lock)
        </>
      )}
    </button>
  );
}
