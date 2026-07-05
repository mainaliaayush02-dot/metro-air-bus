const VARIANTS = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
}

export default function Alert({ children, variant = 'info', className = '' }) {
  if (!children) return null
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  )
}
