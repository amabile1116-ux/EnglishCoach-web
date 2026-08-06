import { sampleSentences } from "@/data/sampleSentences";
import type { Sentence } from "@/types/sentence";

const STORAGE_KEY = "english-coach-library-sentences";

const difficultyValues = ["Easy", "Medium", "Hard"] as const;

export interface LibrarySentenceInput {
  japanese: string;
  english: string;
  category: string;
  difficulty: Sentence["difficulty"];
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isDifficulty = (value: unknown): value is Sentence["difficulty"] => {
  return typeof value === "string" && (difficultyValues as readonly string[]).includes(value);
};

const sanitizeSentence = (value: unknown): Sentence | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const id = typeof value.id === "number" && Number.isInteger(value.id) && value.id > 0 ? value.id : null;
  const japanese = typeof value.japanese === "string" ? value.japanese.trim() : "";
  const english = typeof value.english === "string" ? value.english.trim() : "";
  const point = typeof value.point === "string" ? value.point.trim() : "";
  const category = typeof value.category === "string" ? value.category.trim() : "";
  const difficulty = isDifficulty(value.difficulty) ? value.difficulty : null;

  if (!id || japanese.length === 0 || english.length === 0 || category.length === 0 || !difficulty) {
    return null;
  }

  return {
    id,
    japanese,
    english,
    point,
    category,
    difficulty,
  };
};

const sanitizeSentenceList = (value: unknown): Sentence[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<number>();

  return value
    .map((item) => sanitizeSentence(item))
    .filter((item): item is Sentence => {
      if (!item || seenIds.has(item.id)) {
        return false;
      }

      seenIds.add(item.id);
      return true;
    });
};

const getSeedSentences = (): Sentence[] => {
  return sampleSentences.map((sentence) => ({ ...sentence }));
};

const getNextSentenceId = (sentences: Sentence[]): number => {
  return sentences.reduce((maxId, sentence) => Math.max(maxId, sentence.id), 0) + 1;
};

const readStoredSentences = (): Sentence[] => {
  if (typeof window === "undefined") {
    return getSeedSentences();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw === null) {
      const seedSentences = getSeedSentences();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSentences));
      return seedSentences;
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return sanitizeSentenceList(parsed);
    }

    const seedSentences = getSeedSentences();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSentences));
    return seedSentences;
  } catch {
    const seedSentences = getSeedSentences();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSentences));
    return seedSentences;
  }
};

const persistSentences = (sentences: Sentence[]): Sentence[] => {
  const sanitized = sanitizeSentenceList(sentences);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  }

  return sanitized;
};

export const getLibrarySentences = (): Sentence[] => {
  return readStoredSentences();
};

export const addLibrarySentence = (input: LibrarySentenceInput): Sentence[] => {
  const current = readStoredSentences();
  const nextSentence: Sentence = {
    id: getNextSentenceId(current),
    japanese: input.japanese.trim(),
    english: input.english.trim(),
    point: "",
    category: input.category.trim(),
    difficulty: input.difficulty,
  };

  return persistSentences([...current, nextSentence]);
};

export const updateLibrarySentence = (sentenceId: number, input: LibrarySentenceInput): Sentence[] => {
  const current = readStoredSentences();

  return persistSentences(
    current.map((sentence) => {
      if (sentence.id !== sentenceId) {
        return sentence;
      }

      return {
        ...sentence,
        japanese: input.japanese.trim(),
        english: input.english.trim(),
        category: input.category.trim(),
        difficulty: input.difficulty,
      };
    }),
  );
};

export const deleteLibrarySentence = (sentenceId: number): Sentence[] => {
  const current = readStoredSentences();
  return persistSentences(current.filter((sentence) => sentence.id !== sentenceId));
};