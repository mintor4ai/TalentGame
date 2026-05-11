import { useEffect, useState } from 'react'

const ALERT_DURATION = 6000

export default function EventAlert({ event, onDismiss }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / ALERT_DURATION) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        onDismiss()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [event, onDismiss])

  if (!event) return null

  const isBad = event.type === 'bad'
  const cleanMessage = event.message.replace(/^[⚡🚨⚠️]\s*(EVENTO:\s*)?/u, '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}
      onClick={onDismiss}
    >
      <div
        className={`w-full max-w-sm rounded-3xl p-7 text-center shadow-2xl border-4
          ${isBad ? 'bg-red-950 border-red-500' : 'bg-yellow-950 border-yellow-500'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-7xl mb-3 animate-bounce">
          {isBad ? '🚨' : '⚡'}
        </div>

        <p className={`text-xs font-black uppercase tracking-[0.2em] mb-3
          ${isBad ? 'text-red-400' : 'text-yellow-400'}`}>
          {isBad ? '¡ A L E R T A !' : '¡ E V E N T O !'}
        </p>

        <p className="text-white text-xl font-bold leading-snug mb-6">
          {cleanMessage}
        </p>

        <button
          onClick={onDismiss}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition active:scale-95
            ${isBad ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}
        >
          Entendido
        </button>

        <div className="mt-5 h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isBad ? 'bg-red-400' : 'bg-yellow-400'}`}
            style={{ width: `${progress}%`, transition: 'width 50ms linear' }}
          />
        </div>
      </div>
    </div>
  )
}
