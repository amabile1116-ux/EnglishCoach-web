"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, PencilLine, Trash2, X } from "lucide-react";
import {
  addLibrarySentence,
  deleteLibrarySentence,
  getLibrarySentences,
  updateLibrarySentence,
  type LibrarySentenceInput,
} from "../../lib/librarySentences";
import { getStudyHistory } from "../../lib/studyHistory";
import type { Sentence } from "../../types/sentence";

type CategoryFilter = string;

type ModalState =
  | { mode: "add" }
  | { mode: "edit"; sentenceId: number }
  | { mode: "delete"; sentenceId: number }
  | null;

const DEFAULT_FORM_STATE: LibrarySentenceInput = {
  japanese: "",
  english: "",
  category: "",
  difficulty: "Easy",
};

const difficultyOptions: Sentence["difficulty"][] = ["Easy", "Medium", "Hard"];

export default function LibraryPage() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [learnedSentenceIds, setLearnedSentenceIds] = useState<number[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [formState, setFormState] = useState<LibrarySentenceInput>(DEFAULT_FORM_STATE);

  useEffect(() => {
    setSentences(getLibrarySentences());
    const history = getStudyHistory();
    setLearnedSentenceIds(history.learnedSentenceIds);
  }, []);

  useEffect(() => {
    if (openMenuId === null) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        setOpenMenuId(null);
        return;
      }

      if (event.target.closest("[data-sentence-menu]")) {
        return;
      }

      setOpenMenuId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [openMenuId]);

  useEffect(() => {
    setOpenMenuId(null);
  }, [modalState]);

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

  const categoryFilters = useMemo<CategoryFilter[]>(() => {
    const categories = Array.from(new Set(sentences.map((sentence) => sentence.category))).sort((left, right) =>
      left.localeCompare(right, "en"),
    );

    return ["All", ...categories];
  }, [sentences]);

  const categoryOptions = categoryFilters.slice(1);

  const sentenceToEdit = modalState?.mode === "edit" ? sentences.find((sentence) => sentence.id === modalState.sentenceId) : null;
  const sentenceToDelete =
    modalState?.mode === "delete" ? sentences.find((sentence) => sentence.id === modalState.sentenceId) : null;

  const openAddModal = () => {
    setFormState(DEFAULT_FORM_STATE);
    setModalState({ mode: "add" });
  };

  const openEditModal = (sentence: Sentence) => {
    setFormState({
      japanese: sentence.japanese,
      english: sentence.english,
      category: sentence.category,
      difficulty: sentence.difficulty,
    });
    setModalState({ mode: "edit", sentenceId: sentence.id });
  };

  const openDeleteModal = (sentence: Sentence) => {
    setModalState({ mode: "delete", sentenceId: sentence.id });
  };

  const closeModal = () => {
    setModalState(null);
    setFormState(DEFAULT_FORM_STATE);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (modalState === null) {
      return;
    }

    const nextValues: LibrarySentenceInput = {
      japanese: formState.japanese.trim(),
      english: formState.english.trim(),
      category: formState.category.trim(),
      difficulty: formState.difficulty,
    };

    if (nextValues.japanese.length === 0 || nextValues.english.length === 0 || nextValues.category.length === 0) {
      return;
    }

    const nextSentences =
      modalState.mode === "add"
        ? addLibrarySentence(nextValues)
        : updateLibrarySentence(modalState.sentenceId, nextValues);

    setSentences(nextSentences);
    closeModal();
  };

  const handleDelete = () => {
    if (modalState?.mode !== "delete") {
      return;
    }

    setSentences(deleteLibrarySentence(modalState.sentenceId));
    closeModal();
  };

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
                const isMenuOpen = openMenuId === sentence.id;

                return (
                  <article
                    key={sentence.id}
                    className="group relative rounded-[24px] bg-white p-5 shadow-lg shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-slate-300/70"
                  >
                    <div className="absolute right-4 top-4" data-sentence-menu>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenMenuId((current) => (current === sentence.id ? null : sentence.id));
                        }}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xl font-bold leading-none text-slate-700 transition hover:bg-slate-200"
                        aria-label="Open sentence menu"
                      >
                        ︙
                      </button>

                      {isMenuOpen ? (
                        <div
                          className="absolute right-0 z-10 mt-2 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/80"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              openEditModal(sentence);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <PencilLine size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              openDeleteModal(sentence);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 pr-10">
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
                      管理用カード
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <button
        type="button"
        onClick={openAddModal}
        className="fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/25 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        aria-label="Add sentence"
      >
        <Plus size={26} strokeWidth={3} />
      </button>

      {modalState !== null ? (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/45 px-4 py-6 sm:items-center"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-[28px] bg-white p-5 shadow-2xl shadow-slate-900/20 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            {modalState.mode === "delete" ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Delete</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">例文を削除しますか？</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                    aria-label="Close dialog"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="rounded-3xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  この操作は取り消せません。削除すると Review の対象からも外れます。
                </p>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Japanese</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{sentenceToDelete?.japanese}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="inline-flex h-12 items-center justify-center rounded-3xl bg-rose-600 text-sm font-semibold text-white transition hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleFormSubmit}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {modalState.mode === "add" ? "Add" : "Edit"}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                      {modalState.mode === "add" ? "例文を追加する" : "例文を編集する"}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                    aria-label="Close dialog"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">日本語</span>
                    <textarea
                      value={formState.japanese}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, japanese: event.target.value }))
                      }
                      rows={3}
                      required
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      placeholder="日本語の例文を入力"
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">英語</span>
                    <textarea
                      value={formState.english}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, english: event.target.value }))
                      }
                      rows={3}
                      required
                      className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      placeholder="English sentence"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Category</span>
                    <select
                      value={formState.category}
                      onChange={(event) =>
                        setFormState((current) => ({ ...current, category: event.target.value }))
                      }
                      required
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="" disabled>カテゴリを選択</option>
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Difficulty</span>
                    <select
                      value={formState.difficulty}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          difficulty: event.target.value as Sentence["difficulty"],
                        }))
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      {difficultyOptions.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 items-center justify-center rounded-3xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center rounded-3xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
