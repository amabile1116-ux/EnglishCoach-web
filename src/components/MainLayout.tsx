import React from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <div className="min-h-[calc(100vh-5.5rem)] px-4 pb-24 pt-4 sm:px-6">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
