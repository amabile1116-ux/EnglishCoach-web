export type ParsedChatReply = {
  conversation: string;
  keyPhraseEnglish: string;
  keyPhraseJapanese: string;
};

const CONVERSATION_HEADING_PATTERN = /^Conversation\s*$/i;
const KEY_PHRASE_HEADING_PATTERN = /^💡\s*Key Phrase\s*$/i;
const ENGLISH_LABEL_PATTERN = /^English:\s*$/i;
const JAPANESE_LABEL_PATTERN = /^Japanese:\s*$/i;

const normalizeReplyLine = (line: string): string => line.trim();

export const parseChatReply = (reply: string): ParsedChatReply => {
  const lines = reply.split(/\r?\n/).map(normalizeReplyLine);

  const conversationLines: string[] = [];
  const keyPhraseEnglishLines: string[] = [];
  const keyPhraseJapaneseLines: string[] = [];

  let section: "conversation" | "keyPhrase" | null = null;
  let keyPhraseField: "english" | "japanese" | null = null;

  for (const line of lines) {
    if (line.length === 0) {
      continue;
    }

    if (CONVERSATION_HEADING_PATTERN.test(line)) {
      section = "conversation";
      keyPhraseField = null;
      continue;
    }

    if (KEY_PHRASE_HEADING_PATTERN.test(line)) {
      section = "keyPhrase";
      keyPhraseField = null;
      continue;
    }

    if (section === "keyPhrase" && ENGLISH_LABEL_PATTERN.test(line)) {
      keyPhraseField = "english";
      const inlineValue = line.replace(ENGLISH_LABEL_PATTERN, "").trim();
      if (inlineValue.length > 0) {
        keyPhraseEnglishLines.push(inlineValue);
      }
      continue;
    }

    if (section === "keyPhrase" && JAPANESE_LABEL_PATTERN.test(line)) {
      keyPhraseField = "japanese";
      const inlineValue = line.replace(JAPANESE_LABEL_PATTERN, "").trim();
      if (inlineValue.length > 0) {
        keyPhraseJapaneseLines.push(inlineValue);
      }
      continue;
    }

    if (section === "conversation") {
      conversationLines.push(line);
      continue;
    }

    if (section === "keyPhrase" && keyPhraseField === "english") {
      keyPhraseEnglishLines.push(line);
      continue;
    }

    if (section === "keyPhrase" && keyPhraseField === "japanese") {
      keyPhraseJapaneseLines.push(line);
    }
  }

  const conversation = conversationLines.join("\n").trim();
  const keyPhraseEnglish = keyPhraseEnglishLines.join(" ").trim();
  const keyPhraseJapanese = keyPhraseJapaneseLines.join(" ").trim();

  if (!conversation && reply.trim().length > 0) {
    return {
      conversation: reply.trim(),
      keyPhraseEnglish,
      keyPhraseJapanese,
    };
  }

  return {
    conversation,
    keyPhraseEnglish,
    keyPhraseJapanese,
  };
};