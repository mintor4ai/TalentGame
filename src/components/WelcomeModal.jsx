export default function WelcomeModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.90)' }}>
      <div className="w-full max-w-md bg-indigo-950 border border-indigo-700 rounded-3xl overflow-hidden shadow-2xl">

        {/* Memo header */}
        <div className="bg-indigo-900 px-6 py-4 border-b border-indigo-700">
          <p className="text-xs text-indigo-400 uppercase tracking-widest mb-1">📋 Memorándum Corporativo</p>
          <p className="text-xs text-indigo-300"><span className="text-indigo-400">Para:</span> Todo el equipo directivo</p>
          <p className="text-xs text-indigo-300"><span className="text-indigo-400">De:</span> El CEO (sí, yo mismo, con mi mejor pluma)</p>
          <p className="text-xs text-indigo-300"><span className="text-indigo-400">Asunto:</span> Asignación de Talento Q2 — URGENTE y sin excusas</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 text-sm text-indigo-100 max-h-[60vh] overflow-y-auto">

          <p>Equipo, tenemos obras abiertas, talento disponible y un presupuesto que no se renueva solo. Su misión es simple:</p>

          <div className="bg-indigo-900 rounded-2xl p-4 border border-indigo-700">
            <p className="font-black text-yellow-400 mb-1">🏗️ Objetivo principal</p>
            <p>Llenen su obra con el mejor talento posible. Cada slot vacío le cuesta a la empresa. Cada persona sin asignar… también.</p>
          </div>

          <div className="bg-red-950 rounded-2xl p-4 border border-red-800">
            <p className="font-black text-red-400 mb-1">⚠️ Regla de oro (no la ignoren)</p>
            <p>El talento <span className="font-bold text-white">ocioso</span> le cuesta a <span className="font-bold text-white">todas</span> las obras por igual. Si alguien se queda en banca, ese gasto se reparte entre todos. No es personal. Es aritmética.</p>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-4 border border-indigo-700">
            <p className="font-black text-indigo-300 mb-2">🔍 Revisen bien antes de aceptar a alguien</p>
            <ul className="space-y-1 text-indigo-200">
              <li>😤 <span className="font-semibold">Actitud baja</span> — drama garantizado en obra.</li>
              <li>📄 <span className="font-semibold">Actas de disciplina</span> — una es tolerable, dos son una señal del universo.</li>
              <li>✈️ <span className="font-semibold">Foráneos</span> — excelentes, pero tienen costo de movilidad.</li>
              <li>🆕 <span className="font-semibold">Externo de emergencia</span> — existe, cuesta $50k, y no pregunten de dónde viene.</li>
            </ul>
          </div>

          <div className="bg-yellow-950 rounded-2xl p-4 border border-yellow-800">
            <p className="font-black text-yellow-400 mb-1">🏆 La meta final</p>
            <p>Maximicen la <span className="font-bold text-white">utilidad</span> de su obra. Pero… quizás el juego tiene otro nivel. Ya lo verán al final.</p>
          </div>

          <p className="text-indigo-400 text-xs text-center italic">Suerte. La van a necesitar. — CEO</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-indigo-700">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-yellow-500 text-black font-black text-base hover:bg-yellow-400 transition active:scale-95">
            Entendido, jefe 👔
          </button>
        </div>
      </div>
    </div>
  )
}
