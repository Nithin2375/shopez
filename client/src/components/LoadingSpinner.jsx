export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-container">
      <div className="spinner" />
      <p className="muted">{text}</p>
    </div>
  );
}
