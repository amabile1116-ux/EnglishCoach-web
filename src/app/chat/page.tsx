import React from "react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>
      <p className="text-gray-600 mb-8">Coming Soon</p>
      <Link href="/" className="text-blue-600 hover:underline">← Homeへ戻る</Link>
    </main>
  );
}
