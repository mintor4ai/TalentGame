import { calcAllUtilidades, calcOptimalAssignment, calcSlotScore } from '../lib/gameLogic.js'

const OBRA_EMOJIS = { o1: '🏗️', o2: '🌉', o3: '🖥️' }
const OBRA_NAMES = { o1: 'Nave Industrial Altara', o2: 'Puente Río Norte', o3: 'Data Center Nube9' }
const TIER_PTS = { critical: 20, high: 12, medium: 6 }

function explainScore(person) {
  const reasons = []
  if (person.level === 'senior') reasons.push('✅ Senior +8pts')
  else reasons.push('⚪ Junior (sin bonus)')
  if (person.foraneo) reasons.push('✈️ Foráneo -3pts')
  if (person.actas > 0) reasons.push(`⚠️ ${person.actas} acta(s) -${person.actas * 4}pts`)
  if (person.stats.actitud < 70) reasons.push(`😤 Actitud ${person.stats.actitud} -5pts`)
  if (person.stats.calidad > 80) reasons.push(`📊 Calidad ${person.stats.calidad} +${((person.stats.calidad - 50) / 10).toFixed(1)}pts`)
  return reasons
}

export default function EndScreen({ gameState, players, room, onRestart }) {
  if (!gameState) return null

  const obras = gameState.obras || []
  const allTalent = [...(gameState.talent || []), ...(gameState.extra_talent || [])]
  const budget = room?.budget || 0
  const initialBudget = 300

  const utilidades = calcAllUtilidades(obras, allTalent)
  const allAbove70 = utilidades.every(u => u.utilidad >= 70)

  const optimalObras = calcOptimalAssignment(obras, allTalent)
  const optimalUtilidades = calcAllUtilidades(optimalObras, allTalent)
  const optimalAvg = Math.round(optimalUtilidades.reduce((s, u) => s + u.utilidad, 0) / optimalUtilidades.length)
  const actualAvg = Math.round(utilidades.reduce((s, u) => s + u.utilidad, 0) / utilidades.length)

  const spent = initialBudget - budget
  const sortedUtils = [...utilidades].sort((a, b) => b.utilidad - a.utilidad)
  const winner = sortedUtils[0]

  const winnerPlayer = players?.find(p => {
    const obraMap = { o1: 'Director Torre Altara', o2: 'Director Puente Río Norte', o3: 'Director Data Center Nube9' }
    return p.role === obraMap[winner?.obraId]
  })

  return (
    <div className="min-h-screen bg-indigo-950 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          {allAbove70 ? (
            <>
              <div className="text-6xl mb-2">🏆</div>
              <h1 className="text-3xl font-black text-yellow-400">¡VICTORIA GRUPAL!</h1>
              <p className="text-green-300 mt-1">Todas las obras superaron el 70% de utilidad</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-2">{OBRA_EMOJIS[winner?.obraId] || '🥇'}</div>
              <h1 className="text-3xl font-black text-yellow-400">
                {winnerPlayer?.player_name || OBRA_NAMES[winner?.obraId]} gana
              </h1>
              <p className="text-indigo-300 mt-1">{OBRA_NAMES[winner?.obraId]} — {winner?.utilidad}% utilidad</p>
            </>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-indigo-900 rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-sm text-indigo-300 mb-3">RESULTADOS FINALES</h2>
          <div className="space-y-3">
            {sortedUtils.map(({ obraId, utilidad }, i) => {
              const obra = obras.find(o => o.id === obraId)
              const obraPlayer = players?.find(p => {
                const map = { o1: 'Director Nave Industrial Altara', o2: 'Director Puente Río Norte', o3: 'Director Data Center Nube9' }
                return p.role === map[obraId]
              })
              const medal = ['🥇', '🥈', '🥉'][i] || '🏅'
              const barColor = utilidad >= 70 ? 'bg-green-500' : utilidad >= 40 ? 'bg-yellow-500' : 'bg-red-500'

              return (
                <div key={obraId} className="bg-indigo-800 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{medal}</span>
                      <span className="text-xl">{OBRA_EMOJIS[obraId]}</span>
                      <div>
                        <p className="font-bold text-sm">{OBRA_NAMES[obraId]}</p>
                        {obraPlayer && <p className="text-xs text-indigo-400">{obraPlayer.player_name}</p>}
                      </div>
                    </div>
                    <span className={`text-2xl font-black ${utilidad >= 70 ? 'text-green-400' : utilidad >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {utilidad}%
                    </span>
                  </div>
                  <div className="h-2 bg-indigo-700 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${utilidad}%` }} />
                  </div>
                  {/* Slots breakdown */}
                  {obra && (
                    <div className="mt-2 grid grid-cols-2 gap-1">
                      {obra.slots.map(slot => {
                        const person = slot.personId ? allTalent.find(t => t.id === slot.personId) : null
                        return (
                          <div key={slot.id} className="text-xs flex items-center gap-1">
                            {person ? <span className="text-green-400">✓ {person.name.split(' ')[0]}</span>
                              : <span className="text-red-400">✗ {slot.role} vacío</span>}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Budget summary */}
        <div className="bg-indigo-900 rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-sm text-indigo-300 mb-3">RESUMEN PRESUPUESTAL</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-800 rounded-xl p-3 text-center">
              <p className="text-xs text-indigo-400">Presupuesto restante</p>
              <p className={`text-2xl font-black ${budget >= 0 ? 'text-green-400' : 'text-red-400'}`}>${budget}k</p>
            </div>
            <div className="bg-indigo-800 rounded-xl p-3 text-center">
              <p className="text-xs text-indigo-400">Total gastado</p>
              <p className="text-2xl font-black text-orange-400">${spent}k</p>
            </div>
          </div>
        </div>

        {/* Optimal vs actual */}
        <div className="bg-indigo-900 rounded-2xl p-4 mb-4">
          <h2 className="font-bold text-sm text-indigo-300 mb-3">💡 ACOMODO ÓPTIMO CALCULADO</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="text-center">
              <p className="text-xs text-indigo-400">Tu resultado</p>
              <p className={`text-3xl font-black ${actualAvg >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{actualAvg}%</p>
            </div>
            <div className="text-2xl text-indigo-500">vs</div>
            <div className="text-center">
              <p className="text-xs text-indigo-400">Óptimo posible</p>
              <p className="text-3xl font-black text-blue-400">{optimalAvg}%</p>
            </div>
          </div>
          <div className="space-y-2">
            {optimalObras.map(obra => (
              <div key={obra.id} className="bg-indigo-800 rounded-xl p-2">
                <p className="text-xs font-bold text-indigo-300 mb-1">{OBRA_EMOJIS[obra.id]} {OBRA_NAMES[obra.id]}</p>
                <div className="grid grid-cols-2 gap-1">
                  {obra.slots.map(slot => {
                    const person = slot.personId ? allTalent.find(t => t.id === slot.personId) : null
                    return (
                      <div key={slot.id} className="text-xs text-indigo-300">
                        {slot.role}: <span className="text-white font-semibold">{person?.name?.split(' ')[0] || 'Vacío'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost explanation */}
        <div className="bg-indigo-900 rounded-2xl p-4 mb-4 border border-indigo-700">
          <h2 className="font-bold text-sm text-indigo-300 mb-3">💸 ¿QUÉ PASÓ CON EL PRESUPUESTO?</h2>
          <div className="flex justify-between mb-3">
            <div className="text-center">
              <p className="text-2xl font-black text-green-400">${budget}k</p>
              <p className="text-xs text-indigo-400">restante</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-red-400">-${spent}k</p>
              <p className="text-xs text-indigo-400">gastado en {room?.max_rounds || 3} rondas</p>
            </div>
          </div>
          <p className="text-xs text-indigo-300 leading-relaxed">
            Cada persona ociosa (sin asignar) y cada slot vacío costó <strong className="text-white">$8k por ronda</strong>.
            Los foráneos tienen costo de movilidad de <strong className="text-white">$10k</strong> al moverlos,
            y los externos de emergencia cuestan <strong className="text-white">$50k</strong> fijos.
          </p>
        </div>

        {/* Score explanation per obra */}
        <div className="bg-indigo-900 rounded-2xl p-4 mb-4 border border-indigo-700">
          <h2 className="font-bold text-sm text-indigo-300 mb-3">🔍 ¿POR QUÉ ESOS PORCENTAJES?</h2>
          <div className="space-y-4">
            {obras.map(obra => {
              const util = utilidades.find(u => u.obraId === obra.id)
              return (
                <div key={obra.id}>
                  <p className="font-bold text-sm text-white mb-2">
                    {OBRA_EMOJIS[obra.id]} {OBRA_NAMES[obra.id]} — {util?.utilidad ?? 0}%
                  </p>
                  <div className="space-y-1.5">
                    {obra.slots.map(slot => {
                      const person = slot.personId ? allTalent.find(t => t.id === slot.personId) : null
                      if (!person) return (
                        <div key={slot.id} className="text-xs text-red-400 bg-red-950/40 rounded-lg px-3 py-1.5">
                          ❌ {slot.role} vacío — -{TIER_PTS[slot.tier] + 8}pts potenciales perdidos
                        </div>
                      )
                      const reasons = explainScore(person)
                      return (
                        <div key={slot.id} className="text-xs bg-indigo-800/50 rounded-lg px-3 py-2">
                          <p className="font-semibold text-white mb-1">{person.avatar} {person.name} ({slot.role})</p>
                          <div className="flex flex-wrap gap-1">
                            {reasons.map((r, i) => <span key={i} className="text-indigo-200">{r}</span>)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* The big reveal */}
        <div className={`rounded-2xl p-5 mb-4 border-2 text-center
          ${allAbove70 ? 'bg-green-950 border-green-500' : 'bg-indigo-900 border-yellow-500'}`}>
          {allAbove70 ? (
            <>
              <p className="text-4xl mb-2">🤝</p>
              <p className="text-yellow-400 font-black text-lg mb-2">¡Jugaron en equipo y ganaron todos!</p>
              <p className="text-green-300 text-sm">Cuando nadie acapara el talento y todos colaboran, la empresa entera gana. Eso era el juego dentro del juego.</p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-2">💡</p>
              <p className="text-yellow-400 font-black text-base mb-2">¿Sabías que TODOS podían ganar?</p>
              <p className="text-indigo-200 text-sm leading-relaxed">Si cada obra hubiera alcanzado <span className="font-bold text-white">70% o más</span> de utilidad, la empresa entera ganaba. No era solo una competencia entre directores… era una colaboración disfrazada. La próxima vez, intenten coordinarse.</p>
            </>
          )}
        </div>

        {/* Restart */}
        <button onClick={onRestart}
          className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-black text-lg hover:bg-yellow-400 transition mb-8">
          🔄 Jugar de nuevo
        </button>
      </div>
    </div>
  )
}
