import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">EnglishCoach</h1>
        <p className="text-gray-700 mb-8">
          「知っている英語」を「使える英語」に変える。AIとの英会話とSRS復習で、英語を定着させる学習アプリです。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/chat"
            className="block bg-white shadow rounded-lg py-4 px-6 text-lg font-medium hover:bg-gray-100"
          >
            💬 英会話を始める
          </Link>

          <Link
            href="/library"
            className="block bg-white shadow rounded-lg py-4 px-6 text-lg font-medium hover:bg-gray-100"
          >
            📚 フレーズ一覧
          </Link>

          <Link
            href="/review"
            className="block bg-white shadow rounded-lg py-4 px-6 text-lg font-medium hover:bg-gray-100"
          >
            🔁 今日の復習
          </Link>

          <Link
            href="/settings"
            className="block bg-white shadow rounded-lg py-4 px-6 text-lg font-medium hover:bg-gray-100"
          >
            ⚙️ 設定
          </Link>
        </div>
      </div>
    </main>
  );
}
