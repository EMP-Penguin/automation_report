import { REPORT_TEMPLATES, type ReportType } from "@/lib/report-config";

const REQUIRED_FIELDS: Record<ReportType, string[]> = {
  "병동 회진 참관 보고서": ["환자 정보", "진단명", "증상", "감별진단"],
  "외래 참관 보고서": ["환자 정보", "진단명", "증상", "감별진단"],
  "시술/검사 참관 보고서": [
    "환자 정보",
    "적응증",
    "이 환자에 해당하는 적응증",
    "금기증",
    "합병증",
  ],
  "수술 참관 보고서": [
    "환자 정보 (이름, 나이, 진단명, 수술명)",
    "수술의 목적 또는 수술 시 고려해야 할 주의사항",
    "수술실에서 교수님이 시행한 설명 또는 교수님과 질의응답 내용",
    "수술을 보면서 학생이 느낀 점",
  ],
};

function stripNoise(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^\s*(다음은|참관보고서|보고서|결과)\s*:?\s*$/gim, "")
    .replace(/^\s*(서론|결론|요약)\s*:?.*$/gim, "")
    .trim();
}

function normalizeLine(line: string) {
  return line.replace(/^[*\-•]\s*/, "- ").trim();
}

function extractSections(text: string, reportType: ReportType) {
  const fields = REQUIRED_FIELDS[reportType];
  const lines = stripNoise(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const map = new Map<string, string>();

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);

    for (const field of fields) {
      const prefixes = [`- ${field}:`, `${field}:`, `- ${field} :`, `${field} :`];
      const matched = prefixes.find((prefix) => line.startsWith(prefix));

      if (matched) {
        const value = line.slice(matched.length).trim();
        map.set(field, value || "없음");
      }
    }
  }

  return map;
}

function ensureSentenceStyle(value: string) {
  const normalized = value.trim().replace(/[.。]+$/g, "");

  if (!normalized || normalized === "없음") {
    return "없음";
  }

  if (/(음|ㅁ|임)$/.test(normalized)) {
    return normalized;
  }

  if (/[가-힣]다$/.test(normalized)) {
    return normalized.replace(/다$/, "음");
  }

  return `${normalized}임`;
}

function ensureDifferentialCount(value: string) {
  if (value === "없음") {
    return "없음, 없음";
  }

  const parts = value
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]}, ${parts[1]}`;
  }

  return `${parts[0] || "없음"}, 없음`;
}

function trimToByteLimit(text: string, byteLimit: number) {
  let result = text;

  while (Buffer.byteLength(result, "utf8") > byteLimit) {
    result = result.slice(0, -1).trimEnd();
  }

  return result;
}

export function formatReport(reportType: ReportType, rawText: string) {
  const sections = extractSections(rawText, reportType);
  const fields = REQUIRED_FIELDS[reportType];

  const lines = fields.map((field) => {
    let value = sections.get(field) || "없음";
    value = ensureSentenceStyle(value);

    if (field === "감별진단") {
      value = ensureDifferentialCount(value);
    }

    return `- ${field}: ${value}`;
  });

  const joined = lines.join("\n");
  const byteLimit = REPORT_TEMPLATES[reportType].byteLimit;

  if (!byteLimit) {
    return joined;
  }

  return trimToByteLimit(joined, byteLimit);
}
