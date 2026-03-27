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
    preview: `- 환자 정보:
- 진단명:
- 증상:
- 감별진단:`,
    byteLimit: 500,
  },
  "외래 참관 보고서": {
    title: "외래 참관 보고서",
    preview: `- 환자 정보:
- 진단명:
- 증상:
- 감별진단:`,
    byteLimit: 500,
  },
  "시술/검사 참관 보고서": {
    title: "시술/검사 참관 보고서",
    preview: `- 환자 정보:
- 적응증:
- 이 환자에 해당하는 적응증:
- 금기증:
- 합병증:`,
    byteLimit: 500,
  },
  "수술 참관 보고서": {
    title: "수술 참관 보고서",
    preview: `- 환자 정보 (이름, 나이, 진단명, 수술명):
- 수술의 목적 또는 수술 시 고려해야 할 주의사항:
- 수술실에서 교수님이 시행한 설명 또는 교수님과 질의응답 내용:
- 수술을 보면서 학생이 느낀 점:`,
  },
};

export function isReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}
