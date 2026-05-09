import { calcAllUtilidades } from '../lib/gameLogic.js'
import { OBRAS } from '../lib/gameData.js'

const OBRA_COLORS = {
  o1: { bar: 'bg-blue-500', text: 'text-blue-400', label: '🏢' },
  o2: { bar: 'bg-emerald-500', text: 'text-emerald-400', label: '🌉' },
  o3: { bar: 'bg-purple-500', text: 'text-purple-400', label: '🖥️' },
}

export default function GanttBar({ obras = [], allTalent = [], round = 1, maxRounds = 4 }) {
  const utilidades = calcAllUtilidades(obras, allTalent)

  return (
    <div className="bg-indigo-950 rounded-2xl border border-indigo-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm">Progreso por Obra</h3>
        <span className="text-xs text-indigo-400">Ronda {round}/{maxRounds}</span>
      </div>

      {/* Round progress */}
      <div className="mb-4">
        <div className="flex gap-1 mb-1">
          {Array.from({ length: maxRounds }).map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-yellow-500' : 'bg-indigo-800'}`} />
          ))}
        </div>
        <p className="text-xs text-indigo-400 text-center">Rondas completadas</p>
      </div>

      {/* Utilidad bars */}
      <div className="space-y-3">
        {utilidades.map(({ obraId, utilidad }) => {
          const obra = obras.find(o => o.id === obraId)
          if (!obra) return null
          const colors = OBRA_COLORS[obraId] || OBRA_COLORS.o1
          const barColor = utilidad >= 70 ? colors.bar
            : utilidad >= 40 ? 'bg-yellow-500' : 'bg-red-600'
          const textColor = utilidad >= 70 ? colors.text
            : utilidad >= 40 ? 'text-yellow-400' : 'text-red-400'

          return (
            <div key={obraId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300 flex items-center gap-1">
                  {colors.label} {obra.name}
                </span>
                <span className={`text-xs font-bold ${textColor}`}>{utilidad}%</span>
              </div>
              <div className="h-3 bg-indigo-800 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-700`}
                  style={{ width: `${utilidad}%` }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-xs text-indigo-600">0%</span>
                <span className="text-xs text-indigo-600">70% meta</span>
                <span className="text-xs text-indigo-600">100%</span>
              </div>
            </div>
          )
        })}
      </div>

      {utilidades.every(u => u.utilidad >= 70) && (
        <div className="mt-3 bg-green-900/50 border border-green-600 rounded-xl px-3 py-2 text-center">
          <p className="text-green-400 font-bold text-sm">🏆 ¡Todas superan el 70%! Victoria grupal posible</p>
        </div>
      )}
    </div>
  )
}
