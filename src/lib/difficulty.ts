export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const DIFFICULTY_STORAGE_KEY = "english-coach-difficulty-v1";
export const DEFAULT_DIFFICULTY: DifficultyLevel = "Beginner";

type Direction = "easier" | "harder";

export const isDifficultyLevel = (value: unknown): value is DifficultyLevel => {
  return typeof value === "string" && DIFFICULTY_LEVELS.includes(value as DifficultyLevel);
};

export const getDifficultyIndex = (difficulty: DifficultyLevel): number => {
  return DIFFICULTY_LEVELS.indexOf(difficulty);
};

export const stepDifficulty = (
  difficulty: DifficultyLevel,
  direction: Direction,
): DifficultyLevel => {
  const currentIndex = getDifficultyIndex(difficulty);
  const nextIndex =
    direction === "easier"
      ? Math.max(0, currentIndex - 1)
      : Math.min(DIFFICULTY_LEVELS.length - 1, currentIndex + 1);

  return DIFFICULTY_LEVELS[nextIndex];
};

export const readDifficultyFromStorage = (): DifficultyLevel => {
  if (typeof window === "undefined") {
    return DEFAULT_DIFFICULTY;
  }

  const rawValue = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY);

  return isDifficultyLevel(rawValue) ? rawValue : DEFAULT_DIFFICULTY;
};

export const saveDifficultyToStorage = (difficulty: DifficultyLevel): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty);
};

export const getDifficultyDescriptionLines = (difficulty: DifficultyLevel): string[] => {
  if (difficulty === "Beginner") {
    return [
      "Short conversations",
      "Simple vocabulary",
      "More Japanese support",
    ];
  }

  if (difficulty === "Intermediate") {
    return [
      "Natural conversations",
      "Practical vocabulary",
      "Less Japanese support",
    ];
  }

  return [
    "Native-like conversations",
    "Richer vocabulary",
    "Almost no Japanese support",
  ];
};

export const getDifficultySystemInstruction = (difficulty: DifficultyLevel): string => {
  if (difficulty === "Beginner") {
    return [
      "Difficulty level: Beginner",
      "- Use easy English and short replies.",
      "- Keep sentence structures simple.",
      "- Add Japanese support frequently when helpful.",
      "- Focus on confidence-building and clear repetition.",
      "- Japanese policy: 簡単な英語・短い返答・日本語補足多め。",
    ].join("\n");
  }

  if (difficulty === "Intermediate") {
    return [
      "Difficulty level: Intermediate",
      "- Use natural daily/business conversation English.",
      "- Keep responses concise but slightly richer than beginner level.",
      "- Limit Japanese support to short clarifications.",
      "- Encourage the user to speak in longer chunks.",
      "- Japanese policy: 自然な英会話・日本語補足少なめ。",
    ].join("\n");
  }

  return [
    "Difficulty level: Advanced",
    "- Use near-native conversational English.",
    "- Prefer nuanced, natural phrasing and faster conversational pacing.",
    "- Avoid Japanese unless absolutely necessary for a brief clarification.",
    "- Push for fluent interaction while staying supportive.",
    "- Japanese policy: ネイティブ寄り・日本語ほぼなし。",
  ].join("\n");
};
