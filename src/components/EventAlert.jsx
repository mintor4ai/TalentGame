import { useEffect } from 'react'

export default function EventAlert({ event, onDismiss }) {
  // Prevent scrolling while alert is shown
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!event) return null

  const isBad = event.type === 'bad'
  const title = event.message.replace(/^[⚡🚨⚠️]\s*/u, '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
      onClick={onDismiss}
    >
      <div
        className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4
          ${isBad ? 'bg-red-950 border-red-500' : 'bg-yellow-950 border-yellow-500'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 text-center">
          <div className="text-6xl mb-2 animate-bounce">{isBad ? '🚨' : '⚡'}</div>
          <p className={`text-xs font-black uppercase tracking-[0.2em] mb-2
            ${isBad ? 'text-red-400' : 'text-yellow-400'}`}>
            {isBad ? '¡ A L E R T A !' : '¡ E V E N T O !'}
          </p>
          <p className="text-white text-lg font-black leading-snug">{title}</p>
        </div>

        {/* Impact details */}
        {event.detail && (
          <div className={`mx-4 mb-4 rounded-2xl p-4 text-sm space-y-2
            ${isBad ? 'bg-red-900/50 border border-red-700' : 'bg-yellow-900/40 border border-yellow-700'}`}>
            <p className="text-indigo-200 leading-relaxed">{event.detail}</p>
            {event.impactLabel && (
              <p className={`font-bold text-sm ${isBad ? 'text-red-300' : 'text-yellow-300'}`}>
                💥 {event.impactLabel}
              </p>
            )}
            {event.personName && (
              <p className="text-white text-xs">
                👤 Afectado: <span className="font-bold">{event.personName}</span>
                {event.personSalary && <span className="text-red-400"> · -${event.personSalary}k esta ronda</span>}
              </p>
            )}
          </div>
        )}

        {/* Dismiss — mandatory, no auto-close */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={onDismiss}
            className={`w-full py-4 rounded-2xl font-black text-base transition active:scale-95
              ${isBad ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}>
            ✅ Enterado — continuar
          </button>
          <p className="text-xs text-indigo-400 mt-2">El juego sigue corriendo mientras lees esto</p>
        </div>
      </div>
    </div>
  )
}
