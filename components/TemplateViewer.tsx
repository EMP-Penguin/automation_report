import { REPORT_TEMPLATES, type ReportType } from "@/lib/report-config";

type TemplateViewerProps = {
  reportType: ReportType;
  isOpen: boolean;
  onToggle: () => void;
};

export function TemplateViewer({
  reportType,
  isOpen,
  onToggle,
}: TemplateViewerProps) {
  const template = REPORT_TEMPLATES[reportType];

  return (
    <div className="template-section">
      <button
        type="button"
        className="template-toggle"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        보고서 양식 확인
      </button>

      <div className={`template-collapse ${isOpen ? "open" : ""}`}>
        <div className="template-box">
          <pre>{template.preview}</pre>
        </div>
      </div>
    </div>
  );
}
