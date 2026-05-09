import { LOG_COLORS, LOG_ICONS } from '../lib/constants.js'

export default function TransferFeed({ logEntries = [], transfers = [] }) {
  const entries = [...logEntries].reverse().slice(0, 30)

  return (
    <div className="bg-indigo-950 rounded-2xl border border-indigo-800 overflow-hidden">
      <div className="px-4 py-2 bg-indigo-900 border-b border-indigo-800 flex items-center gap-2">
        <span>📋</span>
        <h3 className="font-bold text-sm">Bitácora de Movimientos</h3>
        <span className="ml-auto text-xs text-indigo-400">{logEntries.length} eventos</span>
      </div>
      <div className="max-h-64 overflow-y-auto p-3 space-y-1.5">
        {entries.length === 0 && (
          <p className="text-center text-indigo-500 text-sm py-4">Sin eventos aún...</p>
        )}
        {entries.map((entry, i) => (
          <div key={entry.id || i} className="flex items-start gap-2 py-1">
            <span className="text-sm flex-shrink-0 mt-0.5">{LOG_ICONS[entry.type] || '•'}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs leading-relaxed ${LOG_COLORS[entry.type] || 'text-gray-300'}`}>
                {entry.message}
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                {new Date(entry.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
