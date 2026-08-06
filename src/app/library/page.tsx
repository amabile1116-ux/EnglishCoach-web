"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { sampleSentences } from "@/data/sampleSentences";
import { getStudyHistory } from "@/lib/studyHistory";

type CategoryFilter = "All" | "Business" | "Daily" | "Travel";

const categoryFilters: CategoryFilter[] = ["All", "Business", "Daily", "Travel"];

export default function LibraryPage() {
  const sentences = sampleSentences;
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [learnedSentenceIds, setLearnedSentenceIds] = useState<number[]>([]);

  useEffect(() => {
    const history = getStudyHistory();
    setLearnedSentenceIds(history.learnedSentenceIds);
  }, []);

  const filteredSentences = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sentences.filter((sentence) => {
      const matchesCategory = activeCategory === "All" || sentence.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        sentence.japanese.toLowerCase().includes(normalizedQuery) ||
        sentence.english.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, sentences]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <section className="rounded-[28px] bg-white p-5 shadow-lg shadow-slate-200/80 sm:p-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Library</p>
                <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">例文一覧</h1>
              </div>
              <p className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                {filteredSentences.length} / {sentences.length}
              </p>
            </div>

            <div className="space-y-3">
              <label htmlFor="sentence-search" className="text-sm font-semibold text-slate-700">
                Search
              </label>
              <input
                id="sentence-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="日本語または英語で検索"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((category) => {
                const isActive = activeCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-6">
          {filteredSentences.length === 0 ? (
            <div className="rounded-[28px] bg-white p-8 text-center shadow-lg shadow-slate-200/80">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">No Results</p>
              <p className="mt-3 text-slate-700">検索条件に一致する例文がありません。</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSentences.map((sentence) => {
                const isLearned = learnedSentenceIds.includes(sentence.id);

                return (
                  <Link
                    key={sentence.id}
                    href="/review"
                    className="group block rounded-[24px] bg-white p-5 shadow-lg shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-slate-300/70"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white">
                        {sentence.category}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {sentence.difficulty}
                      </span>
                      {isLearned ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          ✅ Learned
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Japanese</p>
                        <p className="mt-1 text-base font-semibold leading-relaxed text-slate-900">{sentence.japanese}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">English</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">{sentence.english}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-slate-600 transition group-hover:text-slate-900">
                      タップしてReviewへ →
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
