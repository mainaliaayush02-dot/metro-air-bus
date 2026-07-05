export default function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-brand-orange border-t-transparent ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}
