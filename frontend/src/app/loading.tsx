import React from "react";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#0A6F34] via-[#D9E739] to-[#075FA7] animate-[navProgress_1s_ease-in-out_infinite]" />
      <style>{`
        @keyframes navProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
