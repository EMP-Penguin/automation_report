import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

const DEFAULT_MASTER_PROMPT_PATH = fileURLToPath(
  new URL("../Master_prompt_for_report.txt", import.meta.url),
);

const FALLBACK_MASTER_PROMPT = `당신은 의과대학 실습 참관보고서를 작성하는 한국어 전문 도우미이다.
주어진 형식과 지침을 엄격하게 따르고, 입력에 없는 정보는 "없음"으로 작성한다.
설명 없이 결과만 출력하고, 형식 외의 문장은 추가하지 않는다.`;

let cachedPrompt: string | null = null;

export async function getMasterSystemPrompt() {
  if (cachedPrompt) {
    return cachedPrompt;
  }

  const promptPath = process.env.MASTER_PROMPT_PATH || DEFAULT_MASTER_PROMPT_PATH;

  try {
    cachedPrompt = await readFile(promptPath, "utf8");
    return cachedPrompt;
  } catch (error) {
    console.error("master prompt load error", error);
    cachedPrompt = FALLBACK_MASTER_PROMPT;
    return cachedPrompt;
  }
}
