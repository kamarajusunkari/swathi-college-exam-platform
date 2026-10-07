import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="h-7 w-64 bg-slate-200 rounded-lg" />
          <div className="h-3.5 w-80 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-xl" />
          <div className="h-9 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Cards Grid */}
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

      {/* Table Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 justify-between">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-4 w-48 bg-slate-100 rounded hidden md:block" />
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
