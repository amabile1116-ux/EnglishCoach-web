import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

type ChatRole = "user" | "ai";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
};

const SYSTEM_PROMPT = `あなたは優しい英会話コーチです。

以下を守ること。

・簡単な英語を使う
・短く返答する
・必要なら日本語で補足する
・会話を続ける質問を最後に付ける`;

const DEFAULT_MODEL_NAME = "gemini-flash-latest";

const getModelName = (): string => {
  const configuredModel = process.env.GEMINI_MODEL;

  if (typeof configuredModel === "string" && configuredModel.trim().length > 0) {
    return configuredModel.trim();
  }

  return DEFAULT_MODEL_NAME;
};

const isValidMessage = (value: unknown): value is ChatMessage => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;
  const isRoleValid = candidate.role === "user" || candidate.role === "ai";
  const isContentValid =
    typeof candidate.content === "string" && candidate.content.trim().length > 0;

  return isRoleValid && isContentValid;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing Gemini API key" },
      { status: 500 },
    );
  }

  try {
    const modelName = getModelName();
    const body = (await request.json()) as ChatRequestBody;
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages.filter(isValidMessage);

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: SYSTEM_PROMPT,
    });

    const contents = messages.map((message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: message.content }],
    }));

    const result = await model.generateContent({ contents });
    const reply = result.response.text().trim();

    if (!reply) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[api/chat] Gemini request failed", error);

    return NextResponse.json({ error: "Failed to call Gemini API" }, { status: 500 });
  }
}
