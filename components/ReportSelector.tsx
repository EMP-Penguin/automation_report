import { REPORT_TYPES, type ReportType } from "@/lib/report-config";

type ReportSelectorProps = {
  isOpen: boolean;
  selectedReportType: ReportType | null;
  onToggle: () => void;
  onSelect: (type: ReportType) => void;
};

export function ReportSelector({
  isOpen,
  selectedReportType,
  onToggle,
  onSelect,
}: ReportSelectorProps) {
  return (
    <section className="section-block">
      <button
        type="button"
        className="toggle-trigger"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        보고서 종류 선택
      </button>

      <div className={`toggle-panel ${isOpen ? "open" : ""}`}>
        <div className="pill-panel" role="list" aria-label="보고서 종류 목록">
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`pill-button ${selectedReportType === type ? "selected" : ""}`}
              onClick={() => onSelect(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
