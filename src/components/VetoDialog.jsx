import { useState, useEffect, useCallback } from 'react'
import { useTimer } from '../hooks/useTimer.js'

const STAT_COLORS = {
  energia: 'bg-yellow-400',
  calidad: 'bg-blue-400',
  antiguedad: 'bg-purple-400',
  actitud: 'bg-green-400',
}
const STAT_LABELS = { energia: '⚡ Energía', calidad: '📊 Calidad', antiguedad: '📅 Antigüedad', actitud: '😊 Actitud' }

export default function VetoDialog({ proposal, person, obra, myPlayer, onAccept, onVeto, onHireExternal }) {
  const [deciding, setDeciding] = useState(false)

  const handleExpire = useCallback(() => {
    if (!deciding) {
      onAccept(proposal.id)
    }
  }, [deciding, proposal.id, onAccept])

  const { seconds, start, timerColor, timerClass } = useTimer(20, handleExpire)

  useEffect(() => {
    start(20)
  }, [proposal.id])

  const vetosLeft = myPlayer?.vetos_left ?? 0

  async function handleAccept() {
    setDeciding(true)
    await onAccept(proposal.id)
  }

  async function handleVeto() {
    if (vetosLeft <= 0) return
    setDeciding(true)
    await onVeto(proposal.id)
  }

  async function handleExternal() {
    setDeciding(true)
    await onHireExternal(proposal)
  }

  if (!person || !obra) return null

  const utilidad_color = person.stats.calidad >= 80 ? 'text-green-400'
    : person.stats.calidad >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-end sm:justify-center p-4">
          <div className="bg-indigo-900 rounded-3xl border-2 border-indigo-600 overflow-hidden w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="bg-indigo-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📨</span>
                <div>
                  <p className="font-black text-sm">PROPUESTA DE MOVIMIENTO</p>
                  <p className="text-xs text-indigo-300">de {proposal.proposer_name}</p>
                </div>
              </div>
              <div className={`text-right ${timerColor} ${timerClass}`}>
                <p className="text-3xl font-black font-mono">{seconds}</p>
                <p className="text-xs">segundos</p>
              </div>
            </div>

            {/* Proposal message */}
            <div className="px-4 pt-4 pb-2">
              <p className="text-base font-semibold text-center text-indigo-100 leading-relaxed">
                "{proposal.proposer_name} quiere mandarte a{' '}
                <span className="text-yellow-400 font-black">{person.name}</span> {person.avatar}"
              </p>
              <p className="text-center text-sm text-indigo-300 mt-1">Para: <span className="text-white font-bold">{obra.name} {obra.emoji}</span></p>
            </div>

            {/* Person card */}
            <div className="px-4 py-3">
              <div className="bg-indigo-800/60 rounded-2xl p-4 border border-indigo-600">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-5xl">{person.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-white">{person.name}</h3>
                    <p className="text-indigo-300">{person.role} · <span className={person.level === 'senior' ? 'text-blue-400' : 'text-gray-400'}>{person.level}</span></p>
                    <p className="text-green-400 font-bold text-lg mt-1">💰 ${person.salary}k/ronda</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-3">
                  {Object.entries(person.stats).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-indigo-300 w-24 flex-shrink-0">{STAT_LABELS[key]}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div className={`h-full ${STAT_COLORS[key]} rounded-full`} style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {person.foraneo && (
                    <span className="bg-orange-800 text-orange-200 text-sm px-2 py-1 rounded-full">✈️ Foráneo (+$10k movilidad)</span>
                  )}
                  {person.actas > 0 && (
                    <span className="bg-red-900 text-red-200 text-sm px-2 py-1 rounded-full">⚠️ {person.actas} acta{person.actas > 1 ? 's' : ''} disciplinaria{person.actas > 1 ? 's' : ''}</span>
                  )}
                  {person.dc && (
                    <span className="bg-cyan-900 text-cyan-200 text-sm px-2 py-1 rounded-full">🖥️ DC Certificada</span>
                  )}
                </div>

                <p className="text-sm text-indigo-300 italic">"{person.desc}"</p>
              </div>
            </div>

            {/* Question */}
            <div className="px-4 pb-2 text-center">
              <p className="text-white font-bold text-lg">¿Lo aceptas para tu obra?</p>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAccept}
                  disabled={deciding}
                  className="py-4 rounded-2xl bg-green-600 hover:bg-green-500 font-black text-lg transition active:scale-95 disabled:opacity-50 min-h-[60px]">
                  ✅ SÍ, lo acepto
                </button>
                <button
                  onClick={handleVeto}
                  disabled={deciding || vetosLeft <= 0}
                  className={`py-4 rounded-2xl font-black text-lg transition active:scale-95 min-h-[60px] ${vetosLeft > 0 ? 'bg-red-700 hover:bg-red-600' : 'bg-gray-700 opacity-50 cursor-not-allowed'}`}>
                  🚫 VETO
                </button>
              </div>

              {vetosLeft > 0 ? (
                <p className="text-center text-sm text-indigo-300">
                  Si vetas: te quedan <span className="text-red-400 font-bold">{vetosLeft - 1} veto{vetosLeft - 1 !== 1 ? 's' : ''}</span> restante{vetosLeft - 1 !== 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-center text-sm text-red-400 font-bold">Sin vetos disponibles</p>
              )}

              <button
                onClick={handleExternal}
                disabled={deciding}
                className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-600 font-semibold text-sm transition active:scale-95 disabled:opacity-50">
                🆕 Contratar externo ($50k ⚠️ el más caro)
              </button>

              <div className="flex items-center justify-between text-xs text-indigo-400 bg-indigo-800/50 rounded-xl px-3 py-2">
                <span>⏱️ Si no decides en {seconds}s → se acepta automáticamente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
