"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getStudyHistory, getStudyStreak, getTodaysReviewCount, type StudyHistory } from "../lib/studyHistory";
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_LEVELS,
  getDifficultyDescriptionLines,
  getDifficultyIndex,
  readDifficultyFromStorage,
  saveDifficultyToStorage,
  stepDifficulty,
  type DifficultyLevel,
} from "../lib/difficulty";

export default function Home() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY);
  const [history, setHistory] = useState<StudyHistory>({
    learnedSentenceIds: [],
    againCount: 0,
    gotItCount: 0,
    lastStudiedAt: null,
  });

  useEffect(() => {
    setDifficulty(readDifficultyFromStorage());
    setHistory(getStudyHistory());
  }, []);

  const learnedSentences = history.learnedSentenceIds.length;
  const todaysReviews = useMemo(() => getTodaysReviewCount(history), [history]);
  const studyStreak = useMemo(() => getStudyStreak(history), [history]);
  const difficultyDescriptionLines = useMemo(
    () => getDifficultyDescriptionLines(difficulty),
    [difficulty],
  );
  const canGoEasier = getDifficultyIndex(difficulty) > 0;
  const canGoHarder = getDifficultyIndex(difficulty) < DIFFICULTY_LEVELS.length - 1;

  const handleDifficultyChange = (direction: "easier" | "harder") => {
    const nextDifficulty = stepDifficulty(difficulty, direction);
    setDifficulty(nextDifficulty);
    saveDifficultyToStorage(nextDifficulty);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Welcome to EnglishCoach
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              毎日少しずつ英語を身につけよう！
            </h1>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Today&apos;s Focus
              </p>
              <ul className="mt-5 space-y-3 text-slate-800">
                <li className="rounded-2xl bg-slate-50 px-4 py-3 font-medium">Business Meeting</li>
                <li className="rounded-2xl bg-slate-50 px-4 py-3 font-medium">Small Talk</li>
              </ul>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                This Week
              </p>
              <ul className="mt-5 space-y-2 text-slate-800">
                <li className="text-base">✓ Hotel</li>
                <li className="text-base">✓ Restaurant</li>
                <li className="text-base">□ Taxi</li>
                <li className="text-base">□ Presentation</li>
                <li className="text-base">□ Business Meeting</li>
              </ul>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Difficulty
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{difficulty}</h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                {difficultyDescriptionLines.map((line) => (
                  <p key={line} className="text-sm leading-7 text-slate-700">
                    {line}
                  </p>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDifficultyChange("easier")}
                  disabled={!canGoEasier}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Easier
                </button>
                <button
                  type="button"
                  onClick={() => handleDifficultyChange("harder")}
                  disabled={!canGoHarder}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Harder →
                </button>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    学習サマリー
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Today&apos;s Reviews</h2>
                </div>
                <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {todaysReviews}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-500">Learned Sentences</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{learnedSentences}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-center sm:col-span-2">
                  <p className="text-sm text-slate-500">Study Streak</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">{studyStreak} days</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                クイックアクション
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Start Chat
                </Link>
                <Link
                  href="/review"
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Review Words
                </Link>
                <Link
                  href="/library"
                  className="inline-flex items-center justify-center rounded-3xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Open Library
                </Link>
              </div>
            </section>
          </div>

          <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/80 sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">今日の目標</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Goal：20 words</h2>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Progress
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>12 / 20</span>
                  <span className="font-semibold text-slate-900">60%</span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-3/5 rounded-full bg-slate-900 transition-all duration-300" />
                </div>
              </div>

              <p className="text-sm leading-relaxed text-slate-600">
                今日の目標に向けて進めよう。英単語を増やせば、チャットと復習がもっと楽しくなります。
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
