import { canAssignToSlot, findCompatibleSlots } from '../lib/gameLogic.js'

const TIER_BADGE = {
  s: { label: '$', color: 'bg-green-700 text-green-100' },
  m: { label: '$$', color: 'bg-yellow-700 text-yellow-100' },
  h: { label: '$$$', color: 'bg-red-700 text-red-100' },
}

const STAT_COLORS = {
  energia: 'bg-yellow-400',
  calidad: 'bg-blue-400',
  antiguedad: 'bg-purple-400',
  actitud: 'bg-green-400',
}

const STAT_LABELS = {
  energia: '⚡',
  calidad: '📊',
  antiguedad: '📅',
  actitud: '😊',
}

function StatBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs w-4">{STAT_LABELS[label]}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-300 w-6 text-right">{value}</span>
    </div>
  )
}

export default function TalentCard({ person, selected, compatible, onSelect, compact = false, obras = [] }) {
  const tierBadge = TIER_BADGE[person.salTier] || TIER_BADGE.m
  const isAssigned = person.assignedObraName

  const cardClass = [
    'rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none',
    selected ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20' : '',
    compatible === true ? 'border-green-400 animate-[pulse-green_1s_ease-in-out_infinite]' : '',
    compatible === false && !selected ? 'border-gray-700 opacity-50' : '',
    !selected && compatible === undefined ? 'border-indigo-700 hover:border-indigo-500 bg-indigo-900/60' : '',
    isAssigned ? 'bg-indigo-800/40' : 'bg-indigo-900/80',
  ].filter(Boolean).join(' ')

  if (compact) {
    return (
      <div onClick={() => onSelect?.(person)} className={`${cardClass} p-3`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{person.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-sm truncate">{person.name}</p>
              {person.foraneo && <span className="text-xs bg-orange-800 text-orange-200 px-1 rounded">✈️</span>}
              {person.actas > 0 && <span className="text-xs bg-red-800 text-red-200 px-1 rounded">⚠️×{person.actas}</span>}
              {person.dc && <span className="text-xs bg-cyan-800 text-cyan-200 px-1 rounded">DC</span>}
            </div>
            <p className="text-xs text-indigo-300">{person.role} · {person.level}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-green-400 font-bold">${person.salary}k</p>
            <span className={`text-xs px-1.5 py-0.5 rounded ${tierBadge.color}`}>{tierBadge.label}</span>
          </div>
        </div>
        {isAssigned && (
          <p className="text-xs text-indigo-400 mt-1">📍 {person.assignedObraName}</p>
        )}
      </div>
    )
  }

  return (
    <div onClick={() => onSelect?.(person)} className={`${cardClass} p-4`}>
      <div className="flex items-start gap-3 mb-3">
        <div className="text-3xl flex-shrink-0">{person.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base">{person.name}</h3>
            {person.foraneo && <span className="text-xs bg-orange-800 text-orange-100 px-1.5 py-0.5 rounded-full">✈️ Foráneo</span>}
            {person.dc && <span className="text-xs bg-cyan-800 text-cyan-100 px-1.5 py-0.5 rounded-full">🖥️ DC Cert.</span>}
          </div>
          <p className="text-sm text-indigo-300">{person.role} · <span className={person.level === 'senior' ? 'text-blue-400' : 'text-gray-400'}>{person.level}</span></p>
          {isAssigned && <p className="text-xs text-indigo-400">📍 {person.assignedObraName}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-black text-green-400">${person.salary}k</p>
          <p className="text-xs text-gray-400">/ronda</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3">
        {Object.entries(person.stats).map(([key, val]) => (
          <StatBar key={key} label={key} value={val} color={STAT_COLORS[key]} />
        ))}
      </div>

      {person.actas > 0 && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg px-2 py-1 mb-2">
          <p className="text-xs text-red-300">⚠️ {person.actas} acta{person.actas > 1 ? 's' : ''} disciplinaria{person.actas > 1 ? 's' : ''}</p>
        </div>
      )}

      <p className="text-xs text-indigo-300 italic leading-relaxed">"{person.desc}"</p>

      {selected && (
        <div className="mt-3 py-2 px-3 bg-yellow-400/20 border border-yellow-400 rounded-xl text-center">
          <p className="text-yellow-400 text-xs font-bold">🎯 SELECCIONADO — Elige un slot de destino</p>
        </div>
      )}
    </div>
  )
}
