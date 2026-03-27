import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.");
  }

  if (!client) {
    client = new OpenAI({ apiKey });
  }

  return client;
}

export function getOpenAIModel() {
  return process.env.OPENAI_MODEL || "gpt-5-mini";
}
