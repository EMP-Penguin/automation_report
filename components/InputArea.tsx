type InputAreaProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

export function InputArea({
  value,
  onChange,
  onSubmit,
  disabled,
}: InputAreaProps) {
  return (
    <>
      <label className="input-label" htmlFor="report-input">
        관찰 기록 입력
      </label>
      <textarea
        id="report-input"
        className="report-textarea"
        placeholder="의무기록/필기를 입력하세요..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      <div className="action-row">
        <button
          type="button"
          className="primary-button"
          onClick={onSubmit}
          disabled={disabled}
        >
          {disabled ? "생성 중..." : "입력 완료"}
        </button>
      </div>
    </>
  );
}
