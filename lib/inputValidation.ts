import { type ReportType } from "@/lib/report-config";

type ValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      missingItems: string[];
    };

const LOW_SIGNAL_PATTERNS = [
  /힘들/,
  /피곤/,
  /졸리/,
  /배고프/,
  /싫/,
  /짜증/,
  /ㅠ|ㅜ/,
  /ㅋㅋ|ㅎㅎ/,
];

const COMMON_MEDICAL_PATTERNS = [
  /환자/,
  /진단/,
  /증상/,
  /검사/,
  /혈액/,
  /수술/,
  /시술/,
  /외래/,
  /회진/,
  /통증/,
  /발열/,
  /오심/,
  /구토/,
  /복통/,
  /입원/,
  /과거력/,
  /병력/,
  /소견/,
  /처방/,
  /ct\b/i,
  /mri\b/i,
  /cbc\b/i,
  /wbc\b/i,
  /crp\b/i,
];

const REQUIRED_HINTS: Record<ReportType, Array<{ label: string; patterns: RegExp[] }>> = {
  "병동 회진 참관 보고서": [
    { label: "환자 정보", patterns: [/환자/, /\b[MF]\/\d{1,3}\b/i, /남\/\d{1,3}/, /여\/\d{1,3}/] },
    { label: "진단명 또는 주진단 정보", patterns: [/진단/, /주진단/, /의증/, /diagnosis/i] },
    { label: "증상 또는 신체검진 소견", patterns: [/증상/, /통증/, /발열/, /오심/, /구토/, /압통/, /반발압통/, /호흡곤란/, /부종/, /청진/] },
    { label: "검사 결과 또는 혈액검사 소견", patterns: [/검사/, /혈액/, /wbc/i, /crp/i, /esr/i, /ast/i, /alt/i, /수치/, /\d+\s*\/?\s*(u?l|mg\/dl|mmhg|bpm)/i] },
  ],
  "외래 참관 보고서": [
    { label: "환자 정보", patterns: [/환자/, /\b[MF]\/\d{1,3}\b/i, /남\/\d{1,3}/, /여\/\d{1,3}/] },
    { label: "진단명 또는 주진단 정보", patterns: [/진단/, /주진단/, /의증/, /diagnosis/i] },
    { label: "증상 또는 신체검진 소견", patterns: [/증상/, /통증/, /발열/, /기침/, /콧물/, /호흡곤란/, /진찰/, /소견/, /압통/, /무증상/, /risk factor/i, /history/i] },
  ],
  "시술/검사 참관 보고서": [
    { label: "환자 정보", patterns: [/환자/, /\b[MF]\/\d{1,3}\b/i, /남\/\d{1,3}/, /여\/\d{1,3}/] },
    { label: "시술/검사명", patterns: [/시술/, /검사/, /내시경/, /초음파/, /biopsy/i, /aspiration/i, /injection/i] },
    { label: "적응증 관련 정보", patterns: [/적응증/, /시행 이유/, /목적/, /의뢰/, /평가/] },
  ],
  "수술 참관 보고서": [
    { label: "환자 정보", patterns: [/환자/, /\b[MF]\/\d{1,3}\b/i, /남\/\d{1,3}/, /여\/\d{1,3}/, /이름/] },
    { label: "진단명", patterns: [/진단/, /암/, /염/, /골절/, /종양/, /질환/] },
    { label: "수술명", patterns: [/수술/, /절제/, /봉합/, /복강경/, /mastectomy/i, /ectomy/i] },
    { label: "수술 과정 또는 교수 설명", patterns: [/교수/, /설명/, /질의응답/, /수술실/, /과정/, /주의사항/] },
  ],
};

function hasAnyPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function validateReportInput(
  reportType: ReportType,
  inputText: string,
): ValidationResult {
  const normalized = inputText.trim();

  if (normalized.length < 15) {
    return {
      isValid: false,
      missingItems: ["입력 분량이 너무 짧음", ...REQUIRED_HINTS[reportType].map((item) => item.label)],
    };
  }

  const lowSignalHitCount = LOW_SIGNAL_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).length;

  const medicalSignalHitCount = COMMON_MEDICAL_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).length;

  const missingItems = REQUIRED_HINTS[reportType]
    .filter((item) => !hasAnyPattern(normalized, item.patterns))
    .map((item) => item.label);

  if (medicalSignalHitCount === 0 || lowSignalHitCount >= 2) {
    return {
      isValid: false,
      missingItems:
        missingItems.length > 0
          ? missingItems
          : ["의료적 맥락이 있는 환자 정보 또는 검사/진단 정보"],
    };
  }

  if (missingItems.length >= 2) {
    return {
      isValid: false,
      missingItems,
    };
  }

  return { isValid: true };
}
