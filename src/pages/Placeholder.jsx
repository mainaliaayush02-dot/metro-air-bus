export default function Placeholder({ label }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-black mb-2">{label}</h1>
        <p className="text-gray-500">This page will be built in an upcoming phase.</p>
      </div>
    </div>
  )
}
