import React from "react";

export default function TeacherLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
        <div className="h-7 w-64 bg-slate-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-6 w-14 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
