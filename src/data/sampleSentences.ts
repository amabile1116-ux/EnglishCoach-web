import type { Sentence } from "@/types/sentence";

export const sampleSentences: Sentence[] = [
  {
    id: 1,
    japanese: "新しいメンバーの歓迎会を開きました",
    english: "We had a welcome party for a new member.",
    point: "welcome party = 歓迎会 / for a new member = 新しいメンバーのために",
    category: "Business",
    difficulty: "Easy",
  },
  {
    id: 2,
    japanese: "彼は毎朝ジョギングをしています",
    english: "He goes jogging every morning.",
    point: "go jogging = ジョギングする / every morning = 毎朝",
    category: "Daily",
    difficulty: "Easy",
  },
  {
    id: 3,
    japanese: "このレポートは明日までに提出してください",
    english: "Please submit this report by tomorrow.",
    point: "submit = 提出する / by tomorrow = 明日までに",
    category: "Business",
    difficulty: "Medium",
  },
  {
    id: 4,
    japanese: "彼女はとても静かに話しました",
    english: "She spoke very quietly.",
    point: "speak quietly = 静かに話す / very = とても",
    category: "Daily",
    difficulty: "Medium",
  },
  {
    id: 5,
    japanese: "私はそのニュースを昨日聞きました",
    english: "I heard that news yesterday.",
    point: "hear = 聞く / yesterday = 昨日",
    category: "Travel",
    difficulty: "Easy",
  },
  {
    id: 6,
    japanese: "空港で荷物を受け取るにはどこに行けばいいですか",
    english: "Where should I go to collect my luggage at the airport?",
    point: "collect my luggage = 荷物を受け取る / at the airport = 空港で",
    category: "Travel",
    difficulty: "Hard",
  },
  {
    id: 7,
    japanese: "会議の前に資料を確認してください",
    english: "Please review the materials before the meeting.",
    point: "review the materials = 資料を確認する / before the meeting = 会議の前に",
    category: "Business",
    difficulty: "Medium",
  },
];

export const getSampleSentences = () => sampleSentences;
