import Link from "next/link";
import React from "react";

export default function ReviewPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Review</h1>
        <p className="mt-4 text-gray-600">Coming Soon</p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
          >
            ← Homeへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
