const VARIANTS = {
  primary: 'bg-brand-yellow text-brand-black hover:bg-brand-yellow-dark font-bold',
  accent: 'bg-brand-orange text-white hover:bg-brand-orange-dark font-semibold',
  dark: 'bg-brand-black text-brand-yellow hover:bg-black/80 font-bold',
  outline: 'bg-white text-brand-black border border-gray-300 hover:bg-gray-50 font-semibold',
  danger: 'bg-red-600 text-white hover:bg-red-700 font-semibold',
}

export default function Button({
  children,
  as: Component = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const typeProp = Component === 'button' ? { type } : {}
  return (
    <Component
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...typeProp}
      {...props}
    >
      {children}
    </Component>
  )
}
