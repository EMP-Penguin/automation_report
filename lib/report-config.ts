export const REPORT_TYPES = [
  "병동 회진 참관 보고서",
  "외래 참관 보고서",
  "시술/검사 참관 보고서",
  "수술 참관 보고서",
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export type ReportTemplate = {
  title: ReportType;
  preview: string;
  byteLimit?: number;
};

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate> = {
  "병동 회진 참관 보고서": {
    title: "병동 회진 참관 보고서",
    preview: `- 환자의 최종 진단명/주진단명을 결정하게 된 근거가 된 환자의 증상, 신체검진 소견과 혈액검사 상 양성 소견을 기술해야 합니다. (필수)
- 감별진단 2개를 추가적으로 기재합니다. (필수)`,
    byteLimit: 500,
  },
  "외래 참관 보고서": {
    title: "외래 참관 보고서",
    preview: `- 환자의 최종 진단명/주진단명을 결정하게 된 근거가 된 환자의 증상, 신체검진 소견을 기술합니다. 무증상인 경우 risk factor 나 history 위주로 작성 가능함 (필수)
- 감별진단 2개를 추가적으로 기재합니다. (필수)`,
    byteLimit: 500,
  },
  "시술/검사 참관 보고서": {
    title: "시술/검사 참관 보고서",
    preview: `- 시술/검사의 적응증을 모두 기술하고 이 환자에 해당하는 적응증을 기술하시오. (필수)
- 시술/검사의 금기증 (필수)
- 시술/검사의 합병증 (필수)`,
    byteLimit: 500,
  },
  "수술 참관 보고서": {
    title: "수술 참관 보고서",
    preview: `1. 환자 정보 (이름, 나이, 진단명, 수술명)

2. 수술의 목적 또는 수술 시 고려해야 할 주의사항

3. 수술실에서 교수님이 시행한 설명 또는 교수님과 질의응답 내용

4. 수술을 보면서 학생이 느낀 점`,
  },
};

export function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}
