import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { ROLES, ROLE_EMOJIS, ROLE_TO_OBRA, DIFFICULTY_LABELS } from '../lib/constants.js'
import { generateRoomCode, generatePlayerId } from '../lib/gameLogic.js'
import { getInitialGameState } from '../lib/gameData.js'

const ROLE_LIST = Object.values(ROLES)
const ROLE_COLORS = {
  'Director Torre Altara': 'bg-blue-600',
  'Director Puente Río Norte': 'bg-emerald-600',
  'Director Data Center Nube9': 'bg-purple-600',
  'Gerente de RH': 'bg-amber-600',
}

export default function Lobby({ onGameStart }) {
  const [screen, setScreen] = useState('home') // home|create|join|waiting
  const [playerName, setPlayerName] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [joinCode, setJoinCode] = useState('')
  const [difficulty, setDifficulty] = useState(2)
  const [rhMode, setRhMode] = useState('player')
  const [roomData, setRoomData] = useState(null)
  const [players, setPlayers] = useState([])
  const [myPlayerId, setMyPlayerId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!roomData?.id) return
    const channel = supabase
      .channel(`lobby:${roomData.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${roomData.id}` },
        async () => {
          const { data } = await supabase.from('game_players').select('*').eq('room_id', roomData.id).order('created_at')
          if (data) setPlayers(data)
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomData.id}` },
        ({ new: updated }) => {
          if (updated.status === 'playing') {
            onGameStart({ room: updated, playerId: myPlayerId })
          }
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [roomData?.id, myPlayerId, onGameStart])

  const takenRoles = players.map(p => p.role)
  const myPlayer = players.find(p => p.id === myPlayerId)

  async function handleCreate() {
    if (!playerName.trim() || !selectedRole) { setError('Completa tu nombre y rol.'); return }
    setLoading(true); setError('')
    try {
      const code = generateRoomCode()
      const hostId = generatePlayerId()

      const { data: room, error: roomErr } = await supabase
        .from('game_rooms')
        .insert({ code, host_id: hostId, difficulty, rh_mode: rhMode })
        .select().single()
      if (roomErr) throw roomErr

      const { data: player, error: playerErr } = await supabase
        .from('game_players')
        .insert({
          room_id: room.id, player_name: playerName.trim(),
          role: selectedRole, obra_id: ROLE_TO_OBRA[selectedRole],
          color: 'blue', is_host: true, is_ready: false,
          id: hostId,
        }).select().single()
      if (playerErr) throw playerErr

      setRoomData(room)
      setMyPlayerId(player.id)
      setPlayers([player])
      setScreen('waiting')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function handleJoin() {
    if (!playerName.trim() || !selectedRole) { setError('Completa tu nombre y rol.'); return }
    if (!joinCode.trim()) { setError('Ingresa el código de sala.'); return }
    setLoading(true); setError('')
    try {
      const { data: room, error: roomErr } = await supabase
        .from('game_rooms').select('*').eq('code', joinCode.toUpperCase().trim()).single()
      if (roomErr || !room) { setError('Sala no encontrada.'); setLoading(false); return }
      if (room.status !== 'lobby') { setError('La partida ya inició.'); setLoading(false); return }

      const { data: existingPlayers } = await supabase
        .from('game_players').select('role').eq('room_id', room.id)
      if (existingPlayers?.find(p => p.role === selectedRole)) {
        setError('Ese rol ya está tomado.'); setLoading(false); return
      }

      const playerId = generatePlayerId()
      const { data: player, error: playerErr } = await supabase
        .from('game_players').insert({
          id: playerId, room_id: room.id, player_name: playerName.trim(),
          role: selectedRole, obra_id: ROLE_TO_OBRA[selectedRole],
          color: 'green', is_host: false, is_ready: false,
        }).select().single()
      if (playerErr) throw playerErr

      setRoomData(room)
      setMyPlayerId(player.id)
      const { data: allPlayers } = await supabase.from('game_players').select('*').eq('room_id', room.id).order('created_at')
      setPlayers(allPlayers || [])
      setScreen('waiting')
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function handleStartGame() {
    if (!roomData || !myPlayer?.is_host) return
    setLoading(true)
    try {
      const { getInitialGameState: getState } = await import('../lib/gameData.js')
      const initState = getState(roomData.difficulty)

      await supabase.from('game_state').insert({
        room_id: roomData.id,
        obras: initState.obras,
        talent: initState.talent,
        extra_talent: [],
        transfers: [],
        frozen_obras: [],
      })

      await supabase.from('game_log').insert({
        room_id: roomData.id,
        message: '🎮 Partida iniciada. ¡Bienvenidos al WFM Talent Game!',
        type: 'good',
      })

      await supabase.from('game_rooms').update({ status: 'playing' }).eq('id', roomData.id)
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  async function toggleReady() {
    if (!myPlayerId) return
    const newReady = !myPlayer?.is_ready
    await supabase.from('game_players').update({ is_ready: newReady }).eq('id', myPlayerId)
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${roomData?.code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (screen === 'waiting') {
    const allReady = players.length >= 2 && players.every(p => p.is_ready || p.id === myPlayerId && myPlayer?.is_ready)
    const isHost = myPlayer?.is_host

    return (
      <div className="min-h-screen bg-indigo-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎮</div>
            <h1 className="text-2xl font-bold">Sala de Espera</h1>
            <div className="mt-3 bg-indigo-800 rounded-2xl p-4 inline-block">
              <p className="text-sm text-indigo-300">Código de sala</p>
              <p className="text-4xl font-mono font-black tracking-widest text-yellow-400">{roomData?.code}</p>
            </div>
          </div>

          <button onClick={copyLink}
            className="w-full mb-4 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 transition font-semibold flex items-center justify-center gap-2">
            {copied ? '✅ ¡Link copiado!' : '🔗 Copiar link de sala'}
          </button>

          <div className="bg-indigo-900 rounded-2xl p-4 mb-4">
            <h2 className="text-sm font-bold text-indigo-300 mb-3">JUGADORES ({players.length}/4)</h2>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-indigo-800 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span>{ROLE_EMOJIS[p.role] || '👤'}</span>
                    <div>
                      <p className="font-semibold text-sm">{p.player_name}</p>
                      <p className="text-xs text-indigo-300">{p.role}</p>
                    </div>
                    {p.is_host && <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded font-bold">HOST</span>}
                  </div>
                  <span className={p.is_ready ? 'text-green-400 text-lg' : 'text-gray-500 text-lg'}>
                    {p.is_ready ? '✅' : '⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {!myPlayer?.is_host && (
              <button onClick={toggleReady}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition ${myPlayer?.is_ready ? 'bg-gray-600 hover:bg-gray-500' : 'bg-green-600 hover:bg-green-500'}`}>
                {myPlayer?.is_ready ? '⏳ Esperando...' : '✅ ¡Listo!'}
              </button>
            )}
            {isHost && (
              <button onClick={handleStartGame} disabled={players.length < 1 || loading}
                className="w-full py-4 rounded-2xl font-bold text-lg bg-yellow-500 text-black hover:bg-yellow-400 transition disabled:opacity-50">
                {loading ? 'Iniciando...' : '🚀 Iniciar Partida'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-indigo-400 mt-4">
            Dificultad: {DIFFICULTY_LABELS[roomData?.difficulty]} · Modo RH: {roomData?.rh_mode === 'player' ? 'Jugador' : 'Automático'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {screen === 'home' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h1 className="text-3xl font-black mb-1">WFM Talent Game</h1>
            <p className="text-indigo-300 mb-8 text-sm">Simulación estratégica de Workforce Management</p>
            <div className="space-y-3">
              <button onClick={() => setScreen('create')}
                className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition shadow-lg">
                ➕ Crear sala
              </button>
              <button onClick={() => setScreen('join')}
                className="w-full py-4 rounded-2xl bg-indigo-700 font-bold text-lg hover:bg-indigo-600 transition shadow-lg">
                🔑 Unirme a sala
              </button>
            </div>
          </div>
        )}

        {(screen === 'create' || screen === 'join') && (
          <div>
            <button onClick={() => { setScreen('home'); setError('') }}
              className="text-indigo-300 hover:text-white mb-4 flex items-center gap-1 text-sm">
              ← Volver
            </button>
            <h2 className="text-2xl font-bold mb-6">{screen === 'create' ? '➕ Crear sala' : '🔑 Unirme a sala'}</h2>

            {screen === 'join' && (
              <div className="mb-4">
                <label className="block text-sm text-indigo-300 mb-1">Código de sala</label>
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ALFA42"
                  maxLength={6}
                  className="w-full bg-indigo-800 border border-indigo-600 rounded-xl px-4 py-3 text-xl font-mono tracking-widest text-center uppercase focus:outline-none focus:border-yellow-400" />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-indigo-300 mb-1">Tu nombre</label>
              <input value={playerName} onChange={e => setPlayerName(e.target.value)}
                placeholder="Escribe tu nombre real"
                className="w-full bg-indigo-800 border border-indigo-600 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-400" />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-indigo-300 mb-2">Elige tu rol</label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_LIST.map(role => {
                  const taken = takenRoles.includes(role) && screen === 'join'
                  return (
                    <button key={role} onClick={() => !taken && setSelectedRole(role)}
                      disabled={taken}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${selectedRole === role ? 'border-yellow-400 bg-yellow-400/10' : taken ? 'border-indigo-700 opacity-40' : 'border-indigo-700 hover:border-indigo-500'}`}>
                      <span className="text-2xl">{ROLE_EMOJIS[role]}</span>
                      <div>
                        <p className="font-semibold text-sm">{role}</p>
                        {taken && <p className="text-xs text-red-400">Rol tomado</p>}
                      </div>
                      {selectedRole === role && <span className="ml-auto text-yellow-400">✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {screen === 'create' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm text-indigo-300 mb-2">Dificultad</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${difficulty === d ? 'bg-yellow-500 text-black' : 'bg-indigo-800 hover:bg-indigo-700'}`}>
                        {DIFFICULTY_LABELS[d]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-indigo-300 mb-2">Modo RH</label>
                  <div className="flex gap-2">
                    {[['player', '👤 Jugador'], ['auto', '🤖 Automático']].map(([val, label]) => (
                      <button key={val} onClick={() => setRhMode(val)}
                        className={`flex-1 py-2 rounded-xl font-semibold text-sm transition ${rhMode === val ? 'bg-yellow-500 text-black' : 'bg-indigo-800 hover:bg-indigo-700'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}

            <button
              onClick={screen === 'create' ? handleCreate : handleJoin}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition disabled:opacity-50">
              {loading ? 'Procesando...' : screen === 'create' ? '🚀 Crear sala' : '🔑 Unirme'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
