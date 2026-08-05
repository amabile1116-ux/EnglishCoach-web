import React from "react";

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <section className="rounded-[28px] bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Review</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Translate to English</h1>
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
            <div className="rounded-[24px] bg-slate-50 p-6 shadow-sm shadow-slate-200/80">
              <div className="space-y-5 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Japanese</p>
                  <p className="text-2xl font-semibold leading-relaxed text-slate-900 sm:text-[1.7rem]">
                    新メンバーの歓迎会を開きました
                  </p>
                </div>

                <div className="rounded-[20px] bg-white p-5 shadow-sm shadow-slate-100">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-[1.35rem] font-semibold leading-relaxed text-slate-900 sm:text-[1.6rem]">
                      &quot;We had a welcome party for a new member.&quot;
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
              </div>
            </div>

            <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">💡 Point</p>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                <p>welcome party = 歓迎会</p>
                <p>for a new member = 新メンバーのために</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-3xl border border-slate-200 bg-white text-base font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Again
              </button>
              <button
                type="button"
                className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white transition hover:bg-slate-800"
              >
                Got it!
              </button>
            </div>

            <div className="rounded-3xl bg-slate-50 p-4 text-center text-slate-700">
              <p className="text-sm font-semibold text-slate-500">Remaining</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">11 sentences</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
