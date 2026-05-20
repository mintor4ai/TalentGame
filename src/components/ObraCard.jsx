import { calcObraUtilidad } from '../lib/gameLogic.js'

const TIER_LABELS = { critical: '🔴 Crítico', high: '🟡 Alto', medium: '🟢 Medio' }
const TIER_BORDER = { critical: 'border-red-600', high: 'border-yellow-600', medium: 'border-green-700' }
const TIER_BG = { critical: 'bg-red-900/20', high: 'bg-yellow-900/20', medium: 'bg-green-900/20' }

const OBRA_COLORS = {
  blue: { header: 'bg-blue-900', border: 'border-blue-700', badge: 'bg-blue-800 text-blue-200' },
  emerald: { header: 'bg-emerald-900', border: 'border-emerald-700', badge: 'bg-emerald-800 text-emerald-200' },
  purple: { header: 'bg-purple-900', border: 'border-purple-700', badge: 'bg-purple-800 text-purple-200' },
}

export default function ObraCard({
  obra, allTalent, selectedPerson, compatibleSlots = [],
  onSlotClick, onUnassign, canUnassign, myObra, frozen, compact = false
}) {
  const colors = OBRA_COLORS[obra.color] || OBRA_COLORS.blue
  const utilidad = calcObraUtilidad(obra, allTalent)

  const utilColor = utilidad >= 70 ? 'text-green-400'
    : utilidad >= 40 ? 'text-yellow-400' : 'text-red-400'

  const utilBarColor = utilidad >= 70 ? 'bg-green-500'
    : utilidad >= 40 ? 'bg-yellow-500' : 'bg-red-500'

  const isCompat = (slotId) => compatibleSlots.some(cs => cs.slotId === slotId)

  if (compact) {
    return (
      <div className={`rounded-xl border ${colors.border} bg-indigo-900/60 overflow-hidden`}>
        <div className={`${colors.header} px-3 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span>{obra.emoji}</span>
            <span className="font-bold text-sm truncate">{obra.name}</span>
            {frozen && <span className="text-xs bg-blue-700 px-1 rounded">❄️ Congelada</span>}
          </div>
          <span className={`font-black text-sm ${utilColor}`}>{utilidad}%</span>
        </div>
        <div className="px-3 py-2 grid grid-cols-2 gap-1">
          {obra.slots.map(slot => {
            const person = slot.personId ? allTalent.find(t => t.id === slot.personId) : null
            return (
              <div key={slot.id} className="text-xs text-center truncate">
                {person ? <span className="text-green-400">{person.avatar} {person.name.split(' ')[0]}</span>
                  : <span className="text-gray-500">— {slot.role}</span>}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border-2 ${colors.border} overflow-hidden ${frozen ? 'opacity-70' : ''}`}>
      <div className={`${colors.header} px-4 py-3`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{obra.emoji}</span>
            <div>
              <h3 className="font-black text-base">{obra.name}</h3>
              <p className="text-xs text-gray-400 capitalize">{obra.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${utilColor}`}>{utilidad}%</p>
            <p className="text-xs text-gray-400">utilidad</p>
          </div>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${utilBarColor} rounded-full transition-all duration-500`}
            style={{ width: `${utilidad}%` }} />
        </div>
        {frozen && (
          <p className="text-xs text-blue-300 mt-1">❄️ Obra congelada este turno</p>
        )}
        {myObra && (
          <span className="inline-block mt-1 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold">Tu obra</span>
        )}
      </div>

      <div className="p-3 space-y-2">
        {obra.slots.map(slot => {
          const person = slot.personId ? allTalent.find(t => t.id === slot.personId) : null
          const compat = isCompat(slot.id)
          const clickable = selectedPerson && (compat || !slot.personId)

          return (
            <div
              key={slot.id}
              onClick={() => clickable && onSlotClick?.(obra.id, slot.id)}
              className={[
                `rounded-xl border-2 p-3 transition-all duration-200`,
                TIER_BG[slot.tier],
                compat ? 'border-green-400 animate-[pulse-green_1s_ease-in-out_infinite] cursor-pointer' : TIER_BORDER[slot.tier],
                clickable && !compat && slot.personId === null ? 'cursor-pointer hover:border-yellow-400' : '',
                !clickable && selectedPerson && !person ? 'opacity-50' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 font-semibold">{slot.role}</span>
                <span className="text-xs">{TIER_LABELS[slot.tier]}</span>
              </div>

              {person ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{person.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{person.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {person.foraneo && <span className="text-xs text-orange-400">✈️</span>}
                      {person.actas > 0 && <span className="text-xs text-red-400">⚠️×{person.actas}</span>}
                      <span className="text-xs text-gray-400">Q:{person.stats.calidad} A:{person.stats.actitud}</span>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 font-bold flex-shrink-0">${person.salary}k</span>
                  {canUnassign && !selectedPerson && (
                    <button
                      onClick={e => { e.stopPropagation(); onUnassign?.(person.id) }}
                      className="text-gray-500 hover:text-red-400 transition text-lg font-black leading-none flex-shrink-0 px-1"
                      title="Desasignar al pool">
                      ✕
                    </button>
                  )}
                </div>
              ) : (
                <div className={`flex items-center gap-2 ${compat ? 'text-green-400' : 'text-gray-500'}`}>
                  {compat ? (
                    <>
                      <span className="text-xl">➕</span>
                      <p className="text-sm font-semibold">¡Toca para asignar!</p>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">⬜</span>
                      <p className="text-sm">Vacío</p>
                    </>
                  )}
                </div>
              )}

              {slot.dcOnly && (
                <p className="text-xs text-cyan-400 mt-1">🖥️ Solo Especialista DC certificada</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
