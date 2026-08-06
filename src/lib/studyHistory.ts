export interface StudyHistory {
  learnedSentenceIds: number[];
  againCount: number;
  gotItCount: number;
  lastStudiedAt: string | null;
}

const STORAGE_KEY = "english-coach-study-history";

const DEFAULT_STUDY_HISTORY: StudyHistory = {
  learnedSentenceIds: [],
  againCount: 0,
  gotItCount: 0,
  lastStudiedAt: null,
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const sanitizeStudyHistory = (value: unknown): StudyHistory => {
  if (!isPlainObject(value)) {
    return { ...DEFAULT_STUDY_HISTORY };
  }

  const learnedSentenceIds = Array.isArray(value.learnedSentenceIds)
    ? Array.from(
        new Set(
          value.learnedSentenceIds.filter(
            (id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0,
          ),
        ),
      )
    : [];

  const againCount =
    typeof value.againCount === "number" && Number.isFinite(value.againCount) && value.againCount >= 0
      ? Math.floor(value.againCount)
      : 0;

  const gotItCount =
    typeof value.gotItCount === "number" && Number.isFinite(value.gotItCount) && value.gotItCount >= 0
      ? Math.floor(value.gotItCount)
      : 0;

  const lastStudiedAt = typeof value.lastStudiedAt === "string" && value.lastStudiedAt.length > 0 ? value.lastStudiedAt : null;

  return {
    learnedSentenceIds,
    againCount,
    gotItCount,
    lastStudiedAt,
  };
};

export const getStudyHistory = (): StudyHistory => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_STUDY_HISTORY };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STUDY_HISTORY };
    }

    return sanitizeStudyHistory(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_STUDY_HISTORY };
  }
};

export const saveStudyHistory = (history: StudyHistory): void => {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized = sanitizeStudyHistory(history);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
};

export const recordReviewAction = (sentenceId: number, action: "again" | "gotIt"): StudyHistory => {
  const current = getStudyHistory();
  const learnedSentenceIds = Array.from(new Set([...current.learnedSentenceIds, sentenceId]));

  const next: StudyHistory = {
    learnedSentenceIds,
    againCount: action === "again" ? current.againCount + 1 : current.againCount,
    gotItCount: action === "gotIt" ? current.gotItCount + 1 : current.gotItCount,
    lastStudiedAt: new Date().toISOString(),
  };

  saveStudyHistory(next);
  return next;
};

const isSameLocalDate = (dateA: Date, dateB: Date): boolean => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

export const getTodaysReviewCount = (history: StudyHistory): number => {
  if (!history.lastStudiedAt) {
    return 0;
  }

  const lastStudiedDate = new Date(history.lastStudiedAt);
  if (Number.isNaN(lastStudiedDate.getTime())) {
    return 0;
  }

  if (!isSameLocalDate(lastStudiedDate, new Date())) {
    return 0;
  }

  return history.againCount + history.gotItCount;
};

export const getStudyStreak = (history: StudyHistory): number => {
  if (!history.lastStudiedAt) {
    return 0;
  }

  const lastStudiedDate = new Date(history.lastStudiedAt);
  if (Number.isNaN(lastStudiedDate.getTime())) {
    return 0;
  }

  return isSameLocalDate(lastStudiedDate, new Date()) ? 1 : 0;
};