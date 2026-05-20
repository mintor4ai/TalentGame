export default function VetoResultDialog({ proposal, person, onKeep, onTerminate }) {
  if (!proposal || !person) return null

  const liquidacion = person.salary * 2
  const demandaRisk = person.actas > 0 ? 60 : 25 // % más alto si tiene actas

  return (
    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-indigo-950 border-2 border-orange-500 rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="bg-orange-950 border-b border-orange-700 px-5 py-4">
          <p className="text-orange-400 font-black text-xs uppercase tracking-widest mb-1">🚫 Propuesta Vetada</p>
          <p className="text-white font-bold text-base">
            {proposal.proposer_name}, <span className="text-orange-300">{person.obra?.name || 'la otra obra'}</span> rechazó a{' '}
            <span className="text-yellow-400">{person.name}</span>.
          </p>
          <p className="text-indigo-300 text-sm mt-1">¿Qué haces con él/ella?</p>
        </div>

        {/* Person info */}
        <div className="px-5 py-3 bg-indigo-900/50 flex items-center gap-3 border-b border-indigo-800">
          <span className="text-4xl">{person.avatar}</span>
          <div>
            <p className="font-bold text-white">{person.name}</p>
            <p className="text-indigo-300 text-sm">{person.role} · ${person.salary}k/ronda</p>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">

          {/* Mantener */}
          <button
            onClick={() => onKeep(proposal.id)}
            className="w-full bg-indigo-800 hover:bg-indigo-700 border border-indigo-600 rounded-2xl p-4 text-left transition active:scale-95">
            <p className="font-black text-white mb-1">🏠 Mantener en tu obra (ocioso)</p>
            <p className="text-indigo-300 text-sm">
              {person.name} queda asignado a tu obra sin rol activo.
              Su sueldo <span className="text-red-400 font-bold">-${person.salary}k</span> se carga a tu obra cada ronda.
            </p>
          </button>

          {/* Terminar */}
          <button
            onClick={() => onTerminate(proposal.id, person)}
            className="w-full bg-red-950 hover:bg-red-900 border border-red-700 rounded-2xl p-4 text-left transition active:scale-95">
            <p className="font-black text-red-400 mb-1">🚪 Terminar (liquidación)</p>
            <div className="text-sm space-y-1">
              <p className="text-white">Liquidación: <span className="text-red-400 font-bold">-${liquidacion}k</span> (2 meses de sueldo)</p>
              <p className="text-orange-300">
                ⚠️ Riesgo de demanda: <span className="font-bold">{demandaRisk}%</span> de probabilidad
                {person.actas > 0 && <span className="text-red-400"> (elevado por {person.actas} acta{person.actas > 1 ? 's' : ''})</span>}
              </p>
              <p className="text-indigo-400 text-xs">Si hay demanda: costo adicional de $30k</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
