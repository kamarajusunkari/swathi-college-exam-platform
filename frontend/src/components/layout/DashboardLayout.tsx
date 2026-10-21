import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MessageSquare } from "lucide-react";
import { AuthSessionSync } from "@/components/providers/AuthSessionSync";
import { SessionUser } from "@/lib/types";

export async function DashboardLayout({
  children,
  user: initialUser,
}: {
  children: React.ReactNode;
  user?: SessionUser | null;
}) {
  const user = initialUser ?? (await getCurrentUser());

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      <AuthSessionSync user={user} />
      <div className="flex-1 flex">
        {/* Left Dark Sidebar */}
        <Sidebar user={user} />

        {/* Right Main Container */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header user={user} />
          <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Action Assistant Button */}
      <button
        title="Help & Assistant"
        className="fixed bottom-6 right-6 h-13 w-13 rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-xl shadow-purple-600/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-50 border-2 border-white"
      >
        <MessageSquare className="w-6 h-6 fill-white text-[#7c3aed]" />
      </button>
    </div>
  );
}
