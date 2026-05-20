import { ROUND_DURATION_SECONDS } from '../lib/constants.js'

export default function PhaseBar({ round, secondsLeft, budget, maxRounds = 3 }) {
  const timerColor = secondsLeft > 60 ? 'text-green-400'
    : secondsLeft > 30 ? 'text-yellow-400' : 'text-red-500'
  const timerBlink = secondsLeft <= 30 ? 'animate-[blink-red_0.5s_ease-in-out_infinite]' : ''

  const budgetColor = budget > 150 ? 'text-green-400'
    : budget > 75 ? 'text-yellow-400' : 'text-red-400'

  const progress = (secondsLeft / ROUND_DURATION_SECONDS) * 100

  return (
    <div className="bg-indigo-900 border-b border-indigo-800 px-4 py-2 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs text-indigo-400">Ronda</span>
          <span className="font-black text-white">{round}/{maxRounds}</span>
        </div>

        <div className="flex-1 mx-3">
          <div className="h-1.5 bg-indigo-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={`text-right ${timerColor} ${timerBlink}`}>
          <span className="font-mono font-black text-lg">
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </span>
        </div>

        <div className="ml-3">
          <span className={`font-bold text-sm ${budgetColor}`}>💰${budget}k</span>
        </div>
      </div>
    </div>
  )
}
