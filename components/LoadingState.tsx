export function LoadingState() {
  return (
    <div className="status-card loading-card">
      <div className="spinner" aria-hidden="true" />
      <p>입력 내용을 분석하고 보고서를 생성하는 중임</p>
    </div>
  );
}
