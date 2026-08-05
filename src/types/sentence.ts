export interface Sentence {
  id: number;
  japanese: string;
  english: string;
  point: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}
