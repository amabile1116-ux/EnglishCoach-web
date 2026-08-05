"use client";

import Link from "next/link";
import { useState } from "react";

const reviewItems = [
  {
    id: 1,
    japanese: "新しいメンバーの歓迎会を開きました",
    english: "We had a welcome party for a new member.",
    point: "welcome party = 歓迎会 / for a new member = 新しいメンバーのために",
  },
  {
    id: 2,
    japanese: "彼は毎朝ジョギングをしています",
    english: "He goes jogging every morning.",
    point: "go jogging = ジョギングする / every morning = 毎朝",
  },
  {
    id: 3,
    japanese: "このレポートは明日までに提出してください",
    english: "Please submit this report by tomorrow.",
    point: "submit = 提出する / by tomorrow = 明日までに",
  },
  {
    id: 4,
    japanese: "彼女はとても静かに話しました",
    english: "She spoke very quietly.",
    point: "speak quietly = 静かに話す / very = とても",
  },
  {
    id: 5,
    japanese: "私はそのニュースを昨日聞きました",
    english: "I heard that news yesterday.",
    point: "hear = 聞く / yesterday = 昨日",
  },
];

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const isComplete = currentIndex >= reviewItems.length;
  const currentItem = reviewItems[currentIndex];
  const progressPercent = ((currentIndex + 1) / reviewItems.length) * 100;
  const remainingCount = reviewItems.length - (currentIndex + 1);

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-[28px] bg-white p-8 text-center shadow-lg shadow-slate-200/80 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Review Complete</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">🎉 Today&apos;s Review Complete!</h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">Great job!</p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-3xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Homeへ戻る
            </Link>
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Reviewをもう一度行う
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Review</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Translate to English</h1>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Progress</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {currentIndex + 1} / {reviewItems.length}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
          <div className="space-y-6">
            <div className="rounded-[24px] bg-slate-50 p-6 shadow-sm shadow-slate-200/80">
              <div className="space-y-5 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Japanese</p>
                  <p className="text-2xl font-semibold leading-relaxed text-slate-900 sm:text-[1.7rem]">
                    {currentItem.japanese}
                  </p>
                </div>

                {showAnswer ? (
                  <div className="rounded-[20px] bg-white p-5 shadow-sm shadow-slate-100">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-[1.35rem] font-semibold leading-relaxed text-slate-900 sm:text-[1.6rem]">
                        {currentItem.english}
                      </p>
                      <button
                        type="button"
                        className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                        aria-label="Play pronunciation"
                      >
                        🔊
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {showAnswer ? (
              <>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">💡 Point</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{currentItem.point}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-200 bg-white text-base font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Again
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Got it!
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setShowAnswer(true)}
                className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Show Answer
              </button>
            )}

            <div className="rounded-3xl bg-slate-50 p-4 text-center text-slate-700">
              <p className="text-sm font-semibold text-slate-500">Remaining</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{remainingCount} sentences</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
