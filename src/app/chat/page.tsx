"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Mic, Send, Speaker, Square, Trash2 } from "lucide-react";
import {
  DEFAULT_DIFFICULTY,
  readDifficultyFromStorage,
  type DifficultyLevel,
} from "../../lib/difficulty";
import {
  addLibrarySentence,
  getLibrarySentences,
  type LibrarySentenceInput,
} from "../../lib/librarySentences";
import { parseChatReply } from "../../lib/chatReply";
import type { Sentence } from "../../types/sentence";

type MessageRole = "user" | "ai";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

const STORAGE_KEY = "englishcoach-chat-history-v1";
const DEFAULT_TOPIC = "Introducing yourself";
const ERROR_MESSAGE = "Sorry, something went wrong.";
const THINKING_MESSAGE = "Thinking...";
const SPEAKING_MESSAGE = "🔊 Speaking...";
const UNSUPPORTED_SPEECH_MESSAGE =
  "This browser does not support speech recognition.";
const UNSUPPORTED_TTS_MESSAGE = "This browser does not support speech.";
const SILENCE_TIMEOUT_MS = 10000;
const SAVE_SUCCESS_MESSAGE = "Phrase saved!";

type SpeechRecognitionResultAlternativeLike = {
  transcript: string;
  confidence?: number;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionResultAlternativeLike;
  isFinal: boolean;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type WindowWithSpeechRecognition = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function createMessage(role: MessageRole, content: string): Message {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

const normalizeSpeechText = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

const mergeSpeechText = (baseText: string, nextText: string): string => {
  const normalizedBase = normalizeSpeechText(baseText);
  const normalizedNext = normalizeSpeechText(nextText);

  if (!normalizedBase) {
    return normalizedNext;
  }

  if (!normalizedNext) {
    return normalizedBase;
  }

  const baseWords = normalizedBase.split(" ");
  const nextWords = normalizedNext.split(" ");
  const maxOverlap = Math.min(baseWords.length, nextWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const baseTail = baseWords.slice(baseWords.length - overlap).join(" ");
    const nextHead = nextWords.slice(0, overlap).join(" ");

    if (baseTail === nextHead) {
      const remainder = nextWords.slice(overlap).join(" ");
      return remainder.length > 0 ? `${normalizedBase} ${remainder}` : normalizedBase;
    }
  }

  return `${normalizedBase} ${normalizedNext}`;
};

const combineSpeechText = (finalizedText: string, interimText: string): string => {
  const normalizedFinalized = normalizeSpeechText(finalizedText);
  const normalizedInterim = normalizeSpeechText(interimText);

  if (!normalizedFinalized) {
    return normalizedInterim;
  }

  if (!normalizedInterim) {
    return normalizedFinalized;
  }

  return `${normalizedFinalized} ${normalizedInterim}`;
};

const trimInterimAgainstFinalized = (finalizedText: string, interimText: string): string => {
  const normalizedFinalized = normalizeSpeechText(finalizedText);
  const normalizedInterim = normalizeSpeechText(interimText);

  if (!normalizedInterim) {
    return "";
  }

  if (!normalizedFinalized) {
    return normalizedInterim;
  }

  const finalizedWords = normalizedFinalized.split(" ");
  const interimWords = normalizedInterim.split(" ");
  const maxOverlap = Math.min(finalizedWords.length, interimWords.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const finalizedTail = finalizedWords.slice(finalizedWords.length - overlap).join(" ");
    const interimHead = interimWords.slice(0, overlap).join(" ");

    if (finalizedTail === interimHead) {
      return interimWords.slice(overlap).join(" ");
    }
  }

  return normalizedInterim;
};

const toLibraryDifficulty = (difficulty: DifficultyLevel): Sentence["difficulty"] => {
  if (difficulty === "Beginner") {
    return "Easy";
  }

  if (difficulty === "Intermediate") {
    return "Medium";
  }

  return "Hard";
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DEFAULT_DIFFICULTY);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [librarySentences, setLibrarySentences] = useState<Sentence[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const isListeningRef = useRef(false);
  const isManualStopRef = useRef(false);
  const silenceTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const speechBufferRef = useRef("");
  const speechDraftRef = useRef("");
  const restartTimeoutRef = useRef<number | null>(null);
  // Tracks whether recognition.start() has been called and onend has not yet fired.
  const isRecognizingRef = useRef(false);

  const clearSilenceTimeout = () => {
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };

  const clearRestartTimeout = () => {
    if (restartTimeoutRef.current !== null) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  };

  const scheduleSilenceTimeout = () => {
    clearSilenceTimeout();

    silenceTimeoutRef.current = window.setTimeout(() => {
      if (!isListeningRef.current || isManualStopRef.current) {
        return;
      }

      // Silence treated as intentional end — no auto-restart after this stop.
      isManualStopRef.current = true;
      recognitionRef.current?.stop();
    }, SILENCE_TIMEOUT_MS);
  };

  useEffect(() => {
    setDifficulty(readDifficultyFromStorage());
  }, []);

  useEffect(() => {
    try {
      const savedHistory = window.localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory) as Message[];
        if (Array.isArray(parsedHistory)) {
          setMessages(parsedHistory);
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    setLibrarySentences(getLibrarySentences());
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (messages.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [isLoaded, messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    speechSynthesisRef.current = speechSynthesis;
    setIsSpeechSynthesisSupported(true);

    return () => {
      speechSynthesis.cancel();
      speechSynthesisRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const speechWindow = window as WindowWithSpeechRecognition;
    const RecognitionClass =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!RecognitionClass) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new RecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let nextBuffer = speechBufferRef.current;
      let nextDraft = speechDraftRef.current;
      let sawFinalResult = false;

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0];
        const transcript = normalizeSpeechText(alternative?.transcript ?? "");

        if (transcript.length === 0) {
          continue;
        }

        if (result.isFinal) {
          nextBuffer = mergeSpeechText(nextBuffer, transcript);
          nextDraft = "";
          sawFinalResult = true;
        } else {
          nextDraft = trimInterimAgainstFinalized(nextBuffer, transcript);
        }
      }

      if (sawFinalResult && nextDraft.length > 0) {
        nextDraft = trimInterimAgainstFinalized(nextBuffer, nextDraft);
      }

      speechBufferRef.current = nextBuffer;
      speechDraftRef.current = nextDraft;
      setInput(combineSpeechText(nextBuffer, nextDraft));
      scheduleSilenceTimeout();
    };

    recognition.onend = () => {
      isRecognizingRef.current = false;
      clearRestartTimeout();

      if (isManualStopRef.current || !isListeningRef.current) {
        // Intentional end (user OFF or silence timeout) — commit final text.
        const finalText = speechBufferRef.current.trim() || speechDraftRef.current.trim();
        if (finalText.length > 0) {
          setInput(finalText);
        }
        speechDraftRef.current = "";
        setIsListening(false);
        return;
      }

      // Browser-initiated end — restart silently to maintain Listening session.
      restartTimeoutRef.current = window.setTimeout(() => {
        restartTimeoutRef.current = null;
        if (isManualStopRef.current || !isListeningRef.current || isRecognizingRef.current) {
          return;
        }
        try {
          isRecognizingRef.current = true;
          recognitionRef.current?.start();
        } catch {
          isRecognizingRef.current = false;
          isManualStopRef.current = true;
          setIsListening(false);
        }
      }, 150);
    };

    recognition.onerror = (event) => {
      console.error("[speech] onerror", {
        error: event.error,
        event,
      });

      if (isManualStopRef.current) {
        return;
      }

      console.error("[speech] Recognition failed", event.error ?? event);
    };

    recognitionRef.current = recognition;
    setIsSpeechSupported(true);

    return () => {
      isManualStopRef.current = true;
      clearSilenceTimeout();
      clearRestartTimeout();
      if (isRecognizingRef.current) {
        recognition.stop();
      }
      isRecognizingRef.current = false;
      recognitionRef.current = null;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isSending) {
      return;
    }

    const userMessage = createMessage("user", trimmedInput);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");

    try {
      setIsSending(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();

      if (!reply) {
        throw new Error("Empty AI response");
      }

      const nextAiMessage = createMessage("ai", reply);

      setMessages((currentMessages) => [...currentMessages, nextAiMessage]);
      speakEnglishOnly(reply);
    } catch {
      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("ai", ERROR_MESSAGE),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    const shouldClear = window.confirm("チャット履歴を削除しますか？");

    if (!shouldClear) {
      return;
    }

    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const speakEnglishOnly = (content: string) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.speechSynthesis || !isSpeechSynthesisSupported) {
      setIsSpeechSynthesisSupported(false);
      return;
    }

    const englishText = content
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => !line.startsWith("（") && !line.startsWith("(") && line.length > 0)
      .join(" ");

    if (!englishText) {
      return;
    }

    const speechUtterance = new SpeechSynthesisUtterance(englishText);
    speechUtterance.lang = "en-US";
    speechUtterance.rate = 0.9;
    speechUtterance.pitch = 1;
    speechUtterance.volume = 1;

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    window.speechSynthesis.speak(speechUtterance);

    speechUtterance.onend = () => {
      setIsSpeaking(false);
    };

    speechUtterance.onerror = () => {
      setIsSpeaking(false);
    };
  };

  const handleReplayMessage = (content: string) => {
    const parsedReply = parseChatReply(content);
    speakEnglishOnly(parsedReply.conversation || content);
  };

  const showToast = (message: string) => {
    setToastMessage(message);

    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage("");
      toastTimeoutRef.current = null;
    }, 2400);
  };

  const handleSavePhrase = (message: Message) => {
    if (message.role !== "ai" || message.content === ERROR_MESSAGE) {
      return;
    }

    const parsedReply = parseChatReply(message.content);
    const english = parsedReply.keyPhraseEnglish.trim();
    const japanese = parsedReply.keyPhraseJapanese.trim();

    if (english.length === 0 || japanese.length === 0) {
      return;
    }

    const normalizedEnglish = english.trim().toLowerCase();
    const alreadySaved = librarySentences.some(
      (sentence) => sentence.english.trim().toLowerCase() === normalizedEnglish,
    );

    if (alreadySaved) {
      showToast("Already saved");
      return;
    }

    const inputForLibrary: LibrarySentenceInput = {
      english,
      japanese,
      category: "Chat",
      difficulty: toLibraryDifficulty(difficulty),
    };

    const previousCount = librarySentences.length;
    const nextSentences = addLibrarySentence(inputForLibrary);
    setLibrarySentences(nextSentences);

    if (nextSentences.length === previousCount) {
      showToast("Already saved");
      return;
    }

    showToast(SAVE_SUCCESS_MESSAGE);
  };

  const handleStartListening = () => {
    if (!isSpeechSupported || isListening || isSending || isRecognizingRef.current) {
      return;
    }

    if (!recognitionRef.current) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      isManualStopRef.current = false;
      // Seed buffer from existing input so new speech appends rather than replaces.
      const existingInput = input.trim();
      speechBufferRef.current = existingInput;
      speechDraftRef.current = existingInput;
      setIsListening(true);
      isRecognizingRef.current = true;
      recognitionRef.current.start();
      scheduleSilenceTimeout();
    } catch (error) {
      setIsListening(false);
      isRecognizingRef.current = false;
      console.error("[speech] Failed to start recognition", error);
    }
  };

  const handleStopListening = () => {
    isManualStopRef.current = true;
    setIsListening(false);
    clearSilenceTimeout();
    clearRestartTimeout();
    recognitionRef.current?.stop();
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-8.5rem)] w-full max-w-5xl flex-col px-4 py-4 sm:px-6">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-5 py-5 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Conversation
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                AI英会話
              </h1>
              <p className="mt-1 text-sm text-slate-500">Today&apos;s Topic</p>
              <p className="mt-1 text-xl font-medium text-slate-800">
                {DEFAULT_TOPIC}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClearChat}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_34%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-4 py-5 sm:px-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white/80 px-5 py-10 text-center text-slate-500 shadow-sm backdrop-blur-sm">
                まずは英語で話しかけてください。AIコーチが返信します。
              </div>
            ) : null}

            {messages.map((message) => {
              const isUserMessage = message.role === "user";
              const isAiMessage = message.role === "ai";
              const parsedReply = isAiMessage ? parseChatReply(message.content) : null;
              const keyPhraseEnglish = parsedReply?.keyPhraseEnglish.trim() ?? "";
              const keyPhraseJapanese = parsedReply?.keyPhraseJapanese.trim() ?? "";
              const conversation = parsedReply?.conversation.trim() ?? "";
              const hasKeyPhrase = keyPhraseEnglish.length > 0 && keyPhraseJapanese.length > 0;
              const isSaved = hasKeyPhrase
                ? librarySentences.some(
                    (sentence) =>
                      sentence.english.trim().toLowerCase() === keyPhraseEnglish.toLowerCase(),
                  )
                : false;

              return (
                <div
                  key={message.id}
                  className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                      isUserMessage
                        ? "rounded-br-md bg-emerald-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isUserMessage ? "text-emerald-100" : "text-slate-400"}`}>
                        {isUserMessage ? "You" : "AI"}
                      </p>
                    </div>
                    {isUserMessage ? (
                      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                        {message.content}
                      </p>
                    ) : (
                      <div className="mt-3 space-y-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Conversation
                          </p>
                          <div className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                            {conversation || message.content}
                          </div>
                        </div>

                        {hasKeyPhrase ? (
                          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                                💡 Key Phrase
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSavePhrase(message)}
                                  disabled={isSaved || message.content === ERROR_MESSAGE}
                                  className="inline-flex h-8 items-center justify-center rounded-full border border-amber-200 bg-white px-3 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                  {isSaved ? "Already saved" : "⭐ Save Phrase"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleReplayMessage(message.content)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                                  aria-label="Replay AI conversation"
                                >
                                  <Speaker className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 space-y-4 rounded-[1.25rem] bg-white px-4 py-4 shadow-sm">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  English:
                                </p>
                                <p className="mt-2 text-[15px] leading-7 text-slate-900">
                                  {keyPhraseEnglish}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  Japanese:
                                </p>
                                <p className="mt-2 text-[15px] leading-7 text-slate-700">
                                  {keyPhraseJapanese}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : isAiMessage ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReplayMessage(message.content)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                              aria-label="Replay AI message"
                            >
                              <Speaker className="h-4 w-4" />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm sm:max-w-[70%]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    AI
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                    {THINKING_MESSAGE}
                  </p>
                </div>
              </div>
            ) : null}

            {isSpeaking ? (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm sm:max-w-[70%]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    AI
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                    {SPEAKING_MESSAGE}
                  </p>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6"
        >
          <div className="flex items-end gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner focus-within:border-emerald-400 focus-within:bg-white">
            <label className="sr-only" htmlFor="chat-input">
              メッセージを入力
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message and press Enter"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={!isSpeechSupported || isSending}
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-300 ${
                isListening
                  ? "animate-pulse border-emerald-600 bg-emerald-600"
                  : "border-emerald-500 bg-emerald-500 hover:bg-emerald-600"
              }`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
            >
              {isListening ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>

          {isListening ? (
            <p className="mt-2 text-sm font-medium text-emerald-700">🎤 Listening...</p>
          ) : null}

          {!isSpeechSupported ? (
            <p className="mt-2 text-sm text-rose-600">{UNSUPPORTED_SPEECH_MESSAGE}</p>
          ) : null}

          {!isSpeechSynthesisSupported ? (
            <p className="mt-2 text-sm text-rose-600">{UNSUPPORTED_TTS_MESSAGE}</p>
          ) : null}
        </form>
      </section>

      {toastMessage ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900/95 px-4 py-2 text-sm font-semibold text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}
