"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Send, Trash2 } from "lucide-react";

type MessageRole = "user" | "ai";

type Message = {
  id: string;
  role: MessageRole;
  content: string;
};

const STORAGE_KEY = "englishcoach-chat-history-v1";
const DEFAULT_TOPIC = "Introducing yourself";

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
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage("user", trimmedInput),
      createMessage("ai", "Let's practice together!"),
    ]);
    setInput("");
  };

  const handleClearChat = () => {
    const shouldClear = window.confirm("チャット履歴を削除しますか？");

    if (!shouldClear) {
      return;
    }

    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
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
                まずは英語で話しかけてください。送信するとダミーの AI 応答が追加されます。
              </div>
            ) : null}

            {messages.map((message) => {
              const isUserMessage = message.role === "user";

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
                    <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isUserMessage ? "text-emerald-100" : "text-slate-400"}`}>
                      {isUserMessage ? "You" : "AI"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7">
                      {isUserMessage ? message.content : `"${message.content}"`}
                    </p>
                  </div>
                </div>
              );
            })}
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
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
