"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSampleSentences } from "@/data/sampleSentences";

export default function ReviewPage() {
  const reviewItems = useMemo(() => getSampleSentences(), []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const speechRequestIdRef = useRef(0);

  const currentItem = reviewItems[currentIndex];
  const progressPercent = reviewItems.length > 0 ? ((currentIndex + 1) / reviewItems.length) * 100 : 0;
  const remainingCount = reviewItems.length - (currentIndex + 1);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeechError("");
    speechRequestIdRef.current += 1;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentIndex]);

  const handleNext = () => {
    setShowAnswer(false);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= reviewItems.length) {
      setIsComplete(true);
      return;
    }

    setCurrentIndex(nextIndex);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    window.setTimeout(() => {
      handleSpeak();
    }, 0);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsComplete(false);
  };

  const handleSpeak = () => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      typeof window.SpeechSynthesisUtterance === "undefined"
    ) {
      setSpeechError("This browser does not support speech.");
      return;
    }

    const speechSynthesis = window.speechSynthesis;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const requestId = ++speechRequestIdRef.current;
    const utterance = new SpeechSynthesisUtterance(currentItem.english);

    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      if (speechRequestIdRef.current === requestId) {
        setIsSpeaking(true);
        setSpeechError("");
      }
    };
    utterance.onend = () => {
      if (speechRequestIdRef.current === requestId) {
        setIsSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (speechRequestIdRef.current === requestId) {
        setIsSpeaking(false);
        setSpeechError("This browser does not support speech.");
      }
    };

    speechSynthesis.speak(utterance);
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
              onClick={handleRestart}
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
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white">
                    Category: {currentItem.category}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    Difficulty: {currentItem.difficulty}
                  </span>
                </div>

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
                        onClick={handleSpeak}
                        className="rounded-full bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                        aria-label="Play pronunciation"
                      >
                        {isSpeaking ? "🔊 Speaking..." : "🔊"}
                      </button>
                    </div>
                    {speechError ? (
                      <p className="mt-3 text-sm font-medium text-rose-600">{speechError}</p>
                    ) : isSpeaking ? (
                      <p className="mt-3 text-sm font-medium text-slate-500">🔊 Speaking...</p>
                    ) : null}
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
                onClick={handleShowAnswer}
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
