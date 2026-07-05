const VARIANTS = {
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  gray: 'bg-gray-200 text-gray-700',
  warning: 'bg-amber-100 text-amber-800',
  info: 'bg-blue-100 text-blue-700',
}

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
