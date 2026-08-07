"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Mic, Send, Speaker, Trash2 } from "lucide-react";

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

type SpeechRecognitionResultAlternativeLike = {
  transcript: string;
};

type SpeechRecognitionResultLike = {
  0: SpeechRecognitionResultAlternativeLike;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechRecognitionResultLike[];
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

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
    const speechWindow = window as WindowWithSpeechRecognition;
    const RecognitionClass =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!RecognitionClass) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new RecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex]?.[0]?.transcript?.trim();

      if (transcript) {
        setInput(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("[speech] Recognition failed", event.error ?? event);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSpeechSupported(true);

    return () => {
      recognition.stop();
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
    speakEnglishOnly(content);
  };

  const handleStartListening = () => {
    if (!isSpeechSupported || isListening || isSending) {
      return;
    }

    if (!recognitionRef.current) {
      setIsSpeechSupported(false);
      return;
    }

    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (error) {
      setIsListening(false);
      console.error("[speech] Failed to start recognition", error);
    }
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
                      {isAiMessage ? (
                        <button
                          type="button"
                          onClick={() => handleReplayMessage(message.content)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                          aria-label="Replay AI message"
                        >
                          <Speaker className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                      {isUserMessage ? message.content : `"${message.content}"`}
                    </p>
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
              onClick={handleStartListening}
              disabled={!isSpeechSupported || isSending || isListening}
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-300 ${
                isListening
                  ? "animate-pulse border-emerald-600 bg-emerald-600"
                  : "border-emerald-500 bg-emerald-500 hover:bg-emerald-600"
              }`}
              aria-label="Start voice input"
            >
              <Mic className="h-5 w-5" />
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
    </main>
  );
}
