import { type ReportType } from "@/lib/report-config";

type ValidationResult =
  | {
      isValid: true;
    }
  | {
      isValid: false;
      missingItems: string[];
    };

type SignalGroup = {
  label: string;
  patterns: RegExp[];
};

const LOW_SIGNAL_PATTERNS = [
  /힘들/,
  /피곤/,
  /졸리/,
  /배고프/,
  /짜증/,
  /ㅠ|ㅜ/,
  /ㅋㅋ|ㅎㅎ/,
  /놀고 싶/,
];

const COMMON_MEDICAL_PATTERNS = [
  /fever/i,
  /pneumonia/i,
  /uti/i,
  /pyuria/i,
  /foley/i,
  /cx\b/i,
  /ct\b/i,
  /mri\b/i,
  /wbc/i,
  /crp/i,
  /meropenem/i,
  /esbl/i,
  /증상/,
  /진단/,
  /검사/,
  /소견/,
  /수술/,
  /시술/,
  /회진/,
  /외래/,
  /발열/,
  /통증/,
  /복통/,
  /오심/,
  /구토/,
  /과거력/,
  /병력/,
  /치료/,
  /항생제/,
];

const SIGNALS: Record<ReportType, SignalGroup[]> = {
  "병동 회진 참관 보고서": [
    {
      label: "진단명 또는 문제 목록",
      patterns: [/진단/, /주진단/, /의증/, /pneumonia/i, /uti/i, /sepsis/i],
    },
    {
      label: "증상 또는 병력",
      patterns: [/증상/, /발열/, /통증/, /복통/, /오심/, /구토/, /기침/, /호흡곤란/, /fever/i, /history/i, /recurrent/i, /병력/, /foley/i],
    },
    {
      label: "검사/영상/배양 소견",
      patterns: [/검사/, /소견/, /ct\b/i, /mri\b/i, /u\/a/i, /pyuria/i, /culture/i, /cx\b/i, /wbc/i, /crp/i, /영상/],
    },
    {
      label: "치료 또는 계획",
      patterns: [/치료/, /항생제/, /변경/, /meropenem/i, /d\/c/i, /plan/i],
    },
  ],
  "외래 참관 보고서": [
    {
      label: "진단명 또는 문제 목록",
      patterns: [/진단/, /주진단/, /의증/, /diagnosis/i],
    },
    {
      label: "증상 또는 병력",
      patterns: [/증상/, /통증/, /기침/, /콧물/, /호흡곤란/, /발열/, /history/i, /risk factor/i, /과거력/, /병력/, /무증상/],
    },
    {
      label: "진찰/검사 소견",
      patterns: [/소견/, /진찰/, /검사/, /ct\b/i, /mri\b/i, /x-ray/i, /수치/, /lab/i],
    },
  ],
  "시술/검사 참관 보고서": [
    {
      label: "시술/검사명",
      patterns: [/시술/, /검사/, /내시경/, /초음파/, /biopsy/i, /aspiration/i, /injection/i],
    },
    {
      label: "시행 이유 또는 적응증",
      patterns: [/적응증/, /시행 이유/, /목적/, /의뢰/, /평가/, /증상/, /진단/],
    },
    {
      label: "관련 소견 또는 결과",
      patterns: [/소견/, /결과/, /검사/, /영상/, /lab/i, /findings?/i],
    },
  ],
  "수술 참관 보고서": [
    {
      label: "진단명 또는 수술명",
      patterns: [/진단/, /수술/, /ectomy/i, /mastectomy/i, /절제/, /봉합/, /복강경/],
    },
    {
      label: "수술 목적 또는 주의사항",
      patterns: [/목적/, /주의사항/, /적응증/, /위험/, /합병증/, /계획/],
    },
    {
      label: "수술 과정 또는 교수 설명",
      patterns: [/교수/, /설명/, /질의응답/, /수술실/, /과정/],
    },
  ],
};

function countHits(text: string, groups: SignalGroup[]) {
  return groups.filter((group) =>
    group.patterns.some((pattern) => pattern.test(text)),
  );
}

export function validateReportInput(
  reportType: ReportType,
  inputText: string,
): ValidationResult {
  const normalized = inputText.trim();

  if (normalized.length < 12) {
    return {
      isValid: false,
      missingItems: ["입력 분량이 너무 짧음"],
    };
  }

  const lowSignalHitCount = LOW_SIGNAL_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).length;

  const medicalSignalHitCount = COMMON_MEDICAL_PATTERNS.filter((pattern) =>
    pattern.test(normalized),
  ).length;

  const hitGroups = countHits(normalized, SIGNALS[reportType]);
  const missingItems = SIGNALS[reportType]
    .filter((group) => !hitGroups.some((hit) => hit.label === group.label))
    .map((group) => group.label);

  if (medicalSignalHitCount === 0 || (lowSignalHitCount >= 2 && hitGroups.length === 0)) {
    return {
      isValid: false,
      missingItems:
        missingItems.length > 0
          ? missingItems
          : ["의료적 맥락이 있는 진단, 증상, 검사, 치료 정보"],
    };
  }

  if (reportType === "병동 회진 참관 보고서" || reportType === "외래 참관 보고서") {
    const hasDiagnosisLike = hitGroups.some((group) => group.label === "진단명 또는 문제 목록");
    const hasSupportLike = hitGroups.some((group) =>
      ["증상 또는 병력", "검사/영상/배양 소견", "진찰/검사 소견", "치료 또는 계획"].includes(group.label),
    );

    if (hasDiagnosisLike && hasSupportLike) {
      return { isValid: true };
    }
  } else if (hitGroups.length >= 2) {
    return { isValid: true };
  }

  return {
    isValid: false,
    missingItems: missingItems.length > 0 ? missingItems : ["추가 임상 정보"],
  };
}
