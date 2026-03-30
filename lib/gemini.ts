import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || "gemini-2.5-pro";
}
