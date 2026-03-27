type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="status-card error-card">
      <p>{message}</p>
    </div>
  );
}
