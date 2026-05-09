import { getIdleTalent } from '../lib/gameLogic.js'

export default function IdleBanner({ obras = [], allTalent = [] }) {
  const idle = getIdleTalent(obras, allTalent)

  if (idle.length === 0) return null

  return (
    <div className="bg-orange-950 border border-orange-700 rounded-2xl p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">😴</span>
        <p className="font-bold text-orange-300 text-sm">Personal ocioso — Costo activo</p>
      </div>
      <div className="space-y-1">
        {idle.map(person => (
          <div key={person.id} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5">
              <span>{person.avatar}</span>
              <span className="text-orange-200">{person.name}</span>
              <span className="text-orange-400 text-xs">({person.role})</span>
            </span>
            <span className="text-red-400 font-bold">-${person.salary}k/ronda</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-orange-400 mt-2">
        💸 Total ociosidad: -${idle.reduce((s, p) => s + p.salary, 0)}k esta ronda
      </p>
    </div>
  )
}
