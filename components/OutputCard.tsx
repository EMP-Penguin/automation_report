import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

type OutputCardProps = {
  report: string;
  error: string;
  missingItems: string[];
  isLoading: boolean;
  copied: boolean;
  onCopy: () => void;
};

export function OutputCard({
  report,
  error,
  missingItems,
  isLoading,
  copied,
  onCopy,
}: OutputCardProps) {
  return (
    <section className="output-panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">출력 결과</p>
          <h2>생성된 참관보고서</h2>
        </div>

        <button
          type="button"
          className="copy-button"
          onClick={onCopy}
          disabled={!report}
        >
          {copied ? "복사됨" : "복사"}
        </button>
      </div>

      {isLoading ? <LoadingState /> : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && error && missingItems.length > 0 ? (
        <div className="missing-info-card">
          <p className="missing-info-title">부족한 정보</p>
          <ul className="missing-info-list">
            {missingItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {!isLoading && !error && report ? (
        <article className="report-card">
          <pre>{report}</pre>
        </article>
      ) : null}
      {!isLoading && !error && !report ? (
        <div className="empty-card">
          <p>보고서 종류를 선택하고 기록 입력 후 입력 완료를 누르면 결과가 표시됨</p>
        </div>
      ) : null}
    </section>
  );
}
