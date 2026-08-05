import React from "react";

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl space-y-6">
        <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Review</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">今日の復習を始めましょう</h1>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Progress</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">1 / 12</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  8%
                </span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-1/12 rounded-full bg-slate-900 transition-all duration-300" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Word Card</p>
              <div className="rounded-[22px] bg-slate-50 p-6 shadow-sm shadow-slate-200/80">
                <div className="space-y-4">
                  <div className="space-y-1 text-center">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">English</p>
                    <p className="text-3xl font-bold text-slate-900">challenge</p>
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Japanese</p>
                    <p className="text-xl font-semibold text-slate-900">挑戦</p>
                  </div>
                  <div className="rounded-3xl bg-white p-4 text-left shadow-sm shadow-slate-100">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Example</p>
                    <p className="mt-3 text-base leading-relaxed text-slate-700">
                      I like a good challenge.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-200 bg-white text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                ❌ Don&apos;t Know
              </button>
              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                ✅ I Know
              </button>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-center text-slate-700">
              <p className="text-sm font-semibold text-slate-500">Remaining</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">11 words</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
