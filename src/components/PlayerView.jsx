import { useState, useEffect, useCallback } from 'react'
import { useGameState } from '../hooks/useGameState.js'
import { useTimer } from '../hooks/useTimer.js'
import ObraCard from './ObraCard.jsx'
import TalentCard from './TalentCard.jsx'
import VetoDialog from './VetoDialog.jsx'
import TransferFeed from './TransferFeed.jsx'
import GanttBar from './GanttBar.jsx'
import PhaseBar from './PhaseBar.jsx'
import IdleBanner from './IdleBanner.jsx'
import EndScreen from './EndScreen.jsx'
import {
  findCompatibleSlots, applyAssignment, removePersonFromObras,
  calcObraUtilidad, getAssignedPersonIds, determineWinner, calcRoundCosts,
} from '../lib/gameLogic.js'
import { ROLE_TO_OBRA, ROLES, ROUND_DURATION_SECONDS, MAX_ROUNDS, EXTERNAL_HIRE_COST, FORANEO_MOBILITY_COST, GAP_COST, LOG_TYPES } from '../lib/constants.js'
import { EXTERNAL_TALENT_TEMPLATE, EVENTS_BY_ROUND, DIFFICULTY_EVENTS } from '../lib/gameData.js'
import { supabase } from '../lib/supabase.js'
import EventAlert from './EventAlert.jsx'
import WelcomeModal from './WelcomeModal.jsx'
import { playEventAlert } from '../lib/sounds.js'

export default function PlayerView({ room: initialRoom, playerId, onRestart }) {
  const {
    room, players, gameState, proposals, logEntries, loading, error,
    myPlayer, pendingProposal,
    updateGameState, updateRoom, addLog,
    proposeTransfer, resolveProposal,
    updateVetosLeft,
  } = useGameState(initialRoom?.code, playerId)

  const [selectedPerson, setSelectedPerson] = useState(null)
  const [tab, setTab] = useState('obras') // obras|talent|feed|stats
  const [notification, setNotification] = useState(null)
  const [proposalContext, setProposalContext] = useState(null)
  const [roundEnding, setRoundEnding] = useState(false)
  const [eventAlert, setEventAlert] = useState(null)
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => !!sessionStorage.getItem(`welcomed_${initialRoom?.id}`)
  )

  const isRH = myPlayer?.role === ROLES.GERENTE_RH
  const myObraId = myPlayer ? ROLE_TO_OBRA[myPlayer.role] : null

  const obras = gameState?.obras || []
  const allTalent = [...(gameState?.talent || []), ...(gameState?.extra_talent || [])]
  const round = room?.round || 1
  const budget = room?.budget ?? 300
  const status = room?.status
  const roundDuration = room?.round_duration || ROUND_DURATION_SECONDS

  // Show welcome once per game session (after loading completes)
  const showWelcome = status === 'playing' && !loading && !welcomeDismissed

  function handleCloseWelcome() {
    sessionStorage.setItem(`welcomed_${initialRoom?.id}`, '1')
    setWelcomeDismissed(true)
  }

  // Refs to access latest state inside setTimeout callbacks
  const obrasRef = useRef([])
  const budgetRef = useRef(300)
  useEffect(() => { obrasRef.current = obras }, [obras])
  useEffect(() => { budgetRef.current = budget }, [budget])

  // Round timer
  const handleRoundExpire = useCallback(async () => {
    if (myPlayer?.is_host && !roundEnding) {
      await advanceRound()
    }
  }, [myPlayer?.is_host, roundEnding, round])

  const { seconds: roundSeconds, start: startRound, reset: resetRound } = useTimer(
    roundDuration, handleRoundExpire
  )

  useEffect(() => {
    if (status === 'playing') startRound(roundDuration)
  }, [status])

  // Show toast notification
  function showNotification(msg, type = 'info') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 4000)
  }

  // Watch for pending proposal directed to me
  useEffect(() => {
    if (!pendingProposal) { setProposalContext(null); return }
    const person = allTalent.find(t => t.id === pendingProposal.person_id)
    const obra = obras.find(o => o.id === pendingProposal.to_obra_id)
    setProposalContext({ person, obra })
  }, [pendingProposal?.id, allTalent.length, obras.length])

  // Watch for log events
  useEffect(() => {
    const latest = logEntries[logEntries.length - 1]
    if (!latest) return
    const sinceLastSecond = Date.now() - new Date(latest.created_at).getTime() < 3000
    if (sinceLastSecond) {
      showNotification(latest.message, latest.type)
      if (latest.type === 'event' || latest.type === 'bad') {
        setEventAlert(latest)
        playEventAlert()
      }
    }
  }, [logEntries.length])

  // Select person
  function handleSelectPerson(person) {
    if (selectedPerson?.id === person.id) {
      setSelectedPerson(null)
      return
    }
    setSelectedPerson(person)
    // Auto-switch to obras tab to see compatible slots
    if (tab === 'talent') setTab('obras')
  }

  // Compatible slots for selected person
  const compatibleSlots = selectedPerson ? findCompatibleSlots(selectedPerson, obras) : []

  // Click on slot to assign
  async function handleSlotClick(obraId, slotId) {
    if (!selectedPerson || !myPlayer) return

    const destObra = obras.find(o => o.id === obraId)
    if (!destObra) return

    const destPlayer = players.find(p => ROLE_TO_OBRA[p.role] === obraId)
    const isMyObra = myObraId === obraId

    if (isMyObra || isRH) {
      // Direct assignment if it's my obra or I'm RH
      await doAssign(selectedPerson, obraId, slotId, destObra)
    } else {
      // Propose to the director of that obra
      if (!destPlayer) {
        showNotification('No hay director asignado a esa obra.', 'warn')
        return
      }
      await proposeMove(selectedPerson, obraId, slotId, destObra, destPlayer)
    }
  }

  async function doAssign(person, obraId, slotId, destObra) {
    const foraneoFirst = person.foraneo && !obras.some(o => o.slots.some(s => s.personId === person.id))
    const cost = foraneoFirst ? FORANEO_MOBILITY_COST : 0

    const removedObras = removePersonFromObras(obras, person.id)
    const newObras = applyAssignment(removedObras, person.id, obraId, slotId)
    const newBudget = budget - cost

    const transfer = {
      personId: person.id, personName: person.name,
      obraId, obraName: destObra.name,
      slotId, by: myPlayer.player_name,
      round, ts: new Date().toISOString(),
    }

    await updateGameState({
      obras: newObras,
      transfers: [...(gameState.transfers || []), transfer],
    })

    if (cost > 0) await updateRoom({ budget: newBudget })

    const msg = `✅ ${myPlayer.player_name} asignó a ${person.name} → ${destObra.name}${cost > 0 ? ` (-$${cost}k movilidad)` : ''}`
    await addLog(msg, 'good')
    setSelectedPerson(null)
  }

  async function proposeMove(person, obraId, slotId, destObra, destPlayer) {
    const fromObra = obras.find(o => o.slots.some(s => s.personId === person.id))?.name || 'Pool'
    const { data, error } = await proposeTransfer({
      personId: person.id,
      slotId,
      toObraId: obraId,
      fromObra,
      targetPlayerId: destPlayer.id,
    })

    if (error) { showNotification('Error al proponer movimiento.', 'bad'); return }

    await addLog(
      `📨 ${myPlayer.player_name} propone mover a ${person.name} → ${destObra.name} (pendiente aprobación de ${destPlayer.player_name})`,
      'info'
    )
    setSelectedPerson(null)
    showNotification(`📨 Propuesta enviada a ${destPlayer.player_name}`, 'info')
  }

  // Accept proposal
  async function handleAcceptProposal(proposalId) {
    const proposal = proposals.find(p => p.id === proposalId)
    if (!proposal) return

    await resolveProposal(proposalId, true)

    const person = allTalent.find(t => t.id === proposal.person_id)
    const destObra = obras.find(o => o.id === proposal.to_obra_id)

    if (person && destObra) {
      const removedObras = removePersonFromObras(obras, person.id)
      const newObras = applyAssignment(removedObras, person.id, proposal.to_obra_id, proposal.slot_id)

      await updateGameState({
        obras: newObras,
        transfers: [...(gameState.transfers || []), {
          personId: person.id, personName: person.name,
          obraId: proposal.to_obra_id, obraName: destObra.name,
          slotId: proposal.slot_id, by: myPlayer.player_name,
          round, ts: new Date().toISOString(),
        }],
      })

      await addLog(`✅ ${myPlayer.player_name} aceptó: ${person.name} → ${destObra.name}`, 'good')
    }
    setProposalContext(null)
  }

  // Veto proposal
  async function handleVetoProposal(proposalId) {
    await resolveProposal(proposalId, false)

    const vetosLeft = (myPlayer?.vetos_left || 1) - 1
    await updateVetosLeft(vetosLeft)

    const proposal = proposals.find(p => p.id === proposalId)
    const person = allTalent.find(t => t.id === proposal?.person_id)

    await addLog(
      `🚫 ${myPlayer.player_name} vetó la propuesta de ${person?.name || '?'}. Vetos restantes: ${vetosLeft}`,
      'bad'
    )
    setProposalContext(null)
  }

  // Hire external
  async function handleHireExternal(proposal) {
    const externalId = `ext_${Date.now()}`
    const external = { ...EXTERNAL_TALENT_TEMPLATE, id: externalId }

    const newExtraTalent = [...(gameState.extra_talent || []), external]
    const removedObras = obras
    const newObras = applyAssignment(removedObras, externalId, proposal.to_obra_id, proposal.slot_id)

    await resolveProposal(proposal.id, false)
    await updateGameState({ obras: newObras, extra_talent: newExtraTalent })
    await updateRoom({ budget: budget - EXTERNAL_HIRE_COST })
    await addLog(`🆕 ${myPlayer.player_name} contrató externo de emergencia (-$${EXTERNAL_HIRE_COST}k)`, 'warn')
    setProposalContext(null)
  }

  // Advance round (host only)
  async function advanceRound() {
    if (!myPlayer?.is_host || roundEnding) return
    setRoundEnding(true)

    try {
      const { totalCost, breakdown, newBudget } = calcRoundCosts(obras, allTalent, budget)

      for (const item of breakdown) {
        await addLog(item.message, item.amount > 0 ? 'bad' : 'info')
      }

      const nextRound = round + 1

      if (nextRound > MAX_ROUNDS) {
        // Game over
        await updateRoom({ status: 'ended', budget: newBudget })
        await addLog('🏁 ¡Partida terminada! Calculando resultados...', 'event')
        return
      }

      // Schedule events staggered within the new round
      const difficulty = room?.difficulty || 2
      scheduleRoundEvents(nextRound, difficulty)

      await updateRoom({ round: nextRound, budget: newBudget })
      await addLog(`⏭️ Ronda ${nextRound} iniciada. Presupuesto: $${newBudget}k`, 'event')
      resetRound(roundDuration)
      startRound(roundDuration)
    } finally {
      setRoundEnding(false)
    }
  }

  async function fireScheduledEvent(evt) {
    await addLog(evt.message, evt.type)

    if (evt.action?.type === 'clear_slot') {
      const current = JSON.parse(JSON.stringify(obrasRef.current))
      const updated = current.map(o => {
        if (o.id !== evt.action.obraId) return o
        return { ...o, slots: o.slots.map(s => s.id === evt.action.slotId ? { ...s, personId: null } : s) }
      })
      await updateGameState({ obras: updated })
    } else if (evt.action?.type === 'reduce_budget') {
      await updateRoom({ budget: budgetRef.current - evt.action.amount })
    } else if (evt.action?.type === 'covid_double') {
      const current = JSON.parse(JSON.stringify(obrasRef.current))
      const filled = current.flatMap(o => o.slots.filter(s => s.personId))
      const toClear = filled.slice(0, 2).map(s => s.id)
      const updated = current.map(o => ({
        ...o,
        slots: o.slots.map(s => toClear.includes(s.id) ? { ...s, personId: null } : s),
      }))
      await updateGameState({ obras: updated })
    }
  }

  function scheduleRoundEvents(nextRound, difficulty) {
    const scripted = (EVENTS_BY_ROUND[nextRound] || []).filter(e => (e.difficulty || 1) <= difficulty)
    const diffEvents = DIFFICULTY_EVENTS[difficulty]?.[nextRound] || []
    const allEvents = [...scripted, ...diffEvents]
    if (allEvents.length === 0) return

    // Space events between 30-60s, scaled to round duration
    const intervalMs = roundDuration >= 300 ? 50000
      : roundDuration >= 180 ? 38000
      : 28000

    allEvents.forEach((evt, i) => {
      const jitter = Math.random() * 15000
      const delay = (i + 1) * (intervalMs + jitter)
      setTimeout(() => fireScheduledEvent(evt), delay)
    })
  }

  // Annotate talent with assigned obra name
  const annotatedTalent = allTalent.map(person => {
    const assignedObra = obras.find(o => o.slots.some(s => s.personId === person.id))
    return { ...person, assignedObraName: assignedObra?.name || null }
  })

  const poolTalent = annotatedTalent.filter(p => !p.assignedObraName)
  const assignedTalent = annotatedTalent.filter(p => p.assignedObraName)

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-spin">⚙️</div>
          <p className="text-indigo-300">Cargando partida...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-indigo-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    )
  }

  async function handleLeave() {
    if (playerId) {
      await supabase.from('game_players').delete().eq('id', playerId)
    }
    sessionStorage.removeItem('gameSession')
    sessionStorage.removeItem('playerId')
    sessionStorage.removeItem('roomData')
    if (onRestart) onRestart()
    else window.location.href = '/'
  }

  if (status === 'ended') {
    return <EndScreen gameState={gameState} players={players} room={room} onRestart={handleLeave} />
  }

  return (
    <div className="min-h-screen bg-indigo-950 text-white flex flex-col">
      {/* Phase bar */}
      <PhaseBar round={round} secondsLeft={roundSeconds} budget={budget} />

      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-16 left-4 right-4 z-40 rounded-2xl p-4 shadow-2xl border animate-bounce max-w-lg mx-auto
          ${notification.type === 'good' ? 'bg-green-900 border-green-600' :
            notification.type === 'bad' ? 'bg-red-900 border-red-600' :
            notification.type === 'event' ? 'bg-yellow-900 border-yellow-600' :
            'bg-indigo-800 border-indigo-600'}`}>
          <p className="text-sm font-semibold">{notification.msg}</p>
        </div>
      )}

      {/* Welcome modal — shown once at game start */}
      {showWelcome && (
        <WelcomeModal onClose={handleCloseWelcome} />
      )}

      {/* Event alert overlay */}
      {eventAlert && (
        <EventAlert event={eventAlert} onDismiss={() => setEventAlert(null)} />
      )}

      {/* VetoDialog overlay */}
      {pendingProposal && proposalContext?.person && (
        <VetoDialog
          proposal={pendingProposal}
          person={proposalContext.person}
          obra={proposalContext.obra}
          myPlayer={myPlayer}
          onAccept={handleAcceptProposal}
          onVeto={handleVetoProposal}
          onHireExternal={handleHireExternal}
        />
      )}

      {/* Selected person banner */}
      {selectedPerson && (
        <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between sticky top-12 z-20">
          <p className="text-sm font-bold">
            🎯 {selectedPerson.avatar} {selectedPerson.name} — {selectedPerson.role}
          </p>
          <button onClick={() => setSelectedPerson(null)} className="text-black font-black px-2">✕</button>
        </div>
      )}

      {/* Player info header */}
      <div className="bg-indigo-900 border-b border-indigo-800 px-4 py-2">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="font-bold text-sm">{myPlayer?.player_name}</p>
            <p className="text-xs text-indigo-400">{myPlayer?.role}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-indigo-400">
            <span>🚫 {myPlayer?.vetos_left ?? 2} vetos</span>
            <span>👥 {players.length} jugadores</span>
            {myPlayer?.is_host && (
              <button onClick={advanceRound} disabled={roundEnding}
                className="bg-orange-600 text-white px-2 py-1 rounded-lg font-bold text-xs disabled:opacity-50">
                ⏭️ Fin ronda
              </button>
            )}
            <button onClick={handleLeave}
              className="bg-indigo-700 text-indigo-300 px-2 py-1 rounded-lg font-bold text-xs hover:bg-red-800 hover:text-white transition">
              🚪 Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-indigo-900 border-b border-indigo-800 sticky top-[108px] z-20">
        <div className="flex max-w-lg mx-auto">
          {[
            ['obras', isRH ? '🏗️ Obras' : '🏗️ Mi Obra'],
            ['talent', '👥 Talento'],
            ['feed', '📋 Bitácora'],
            ['stats', '📊 Stats'],
          ].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors
                ${tab === key ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-indigo-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 max-w-lg mx-auto w-full pb-20">

        {/* OBRAS TAB */}
        {tab === 'obras' && (
          <div className="space-y-4">
            <IdleBanner obras={obras} allTalent={allTalent} />

            {isRH ? (
              // RH sees ALL obras
              <>
                <p className="text-xs text-indigo-400 text-center">Gestiona todas las obras</p>
                {obras.map(obra => (
                  <ObraCard key={obra.id} obra={obra} allTalent={annotatedTalent}
                    selectedPerson={selectedPerson}
                    compatibleSlots={compatibleSlots.filter(cs => cs.obraId === obra.id)}
                    onSlotClick={handleSlotClick}
                    myObra={false} />
                ))}
              </>
            ) : (
              // Director sees their obra first, then others compactly
              <>
                {myObraId && (
                  <>
                    <p className="text-xs text-indigo-400">Tu obra</p>
                    {obras.filter(o => o.id === myObraId).map(obra => (
                      <ObraCard key={obra.id} obra={obra} allTalent={annotatedTalent}
                        selectedPerson={selectedPerson}
                        compatibleSlots={compatibleSlots.filter(cs => cs.obraId === obra.id)}
                        onSlotClick={handleSlotClick}
                        myObra />
                    ))}
                    {obras.some(o => o.id !== myObraId) && (
                      <>
                        <p className="text-xs text-indigo-400 mt-4">Otras obras</p>
                        {obras.filter(o => o.id !== myObraId).map(obra => (
                          <ObraCard key={obra.id} obra={obra} allTalent={annotatedTalent}
                            selectedPerson={selectedPerson}
                            compatibleSlots={compatibleSlots.filter(cs => cs.obraId === obra.id)}
                            onSlotClick={handleSlotClick} />
                        ))}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* TALENT TAB */}
        {tab === 'talent' && (
          <div className="space-y-3">
            {poolTalent.length > 0 && (
              <>
                <p className="text-xs text-indigo-400 font-semibold">POOL DISPONIBLE ({poolTalent.length})</p>
                {poolTalent.map(person => (
                  <TalentCard key={person.id} person={person}
                    selected={selectedPerson?.id === person.id}
                    compatible={selectedPerson ? compatibleSlots.length > 0 && findCompatibleSlots(person, obras).length > 0 ? undefined : undefined : undefined}
                    onSelect={handleSelectPerson} />
                ))}
              </>
            )}
            {assignedTalent.length > 0 && (
              <>
                <p className="text-xs text-indigo-400 font-semibold mt-4">ASIGNADOS ({assignedTalent.length})</p>
                {assignedTalent.map(person => (
                  <TalentCard key={person.id} person={person}
                    selected={selectedPerson?.id === person.id}
                    onSelect={handleSelectPerson}
                    compact />
                ))}
              </>
            )}
            {allTalent.length === 0 && (
              <p className="text-center text-indigo-500 py-8">Cargando talento...</p>
            )}
          </div>
        )}

        {/* FEED TAB */}
        {tab === 'feed' && (
          <div className="space-y-3">
            <TransferFeed logEntries={logEntries} transfers={gameState?.transfers || []} />
          </div>
        )}

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div className="space-y-3">
            <GanttBar obras={obras} allTalent={annotatedTalent} round={round} maxRounds={MAX_ROUNDS} />

            {/* Players list */}
            <div className="bg-indigo-900 rounded-2xl p-4 border border-indigo-800">
              <h3 className="font-bold text-sm text-indigo-300 mb-3">JUGADORES</h3>
              <div className="space-y-2">
                {players.map(p => {
                  const obraUtil = p.obra_id ? calcObraUtilidad(obras.find(o => o.id === p.obra_id) || { slots: [] }, annotatedTalent) : null
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-indigo-800 rounded-xl px-3 py-2">
                      <div>
                        <p className="font-semibold text-sm">{p.player_name}</p>
                        <p className="text-xs text-indigo-400">{p.role}</p>
                      </div>
                      <div className="text-right">
                        {obraUtil !== null && (
                          <p className={`font-bold text-sm ${obraUtil >= 70 ? 'text-green-400' : obraUtil >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {obraUtil}%
                          </p>
                        )}
                        <p className="text-xs text-indigo-400">🚫 {p.vetos_left} vetos</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-indigo-900 rounded-2xl p-4 border border-indigo-800">
              <h3 className="font-bold text-sm text-indigo-300 mb-3">PRESUPUESTO</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black text-green-400">${budget}k</p>
                  <p className="text-xs text-indigo-400">restante</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-400">${300 - budget}k</p>
                  <p className="text-xs text-indigo-400">gastado</p>
                </div>
              </div>
              <div className="mt-3 h-3 bg-indigo-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${budget > 150 ? 'bg-green-500' : budget > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.max(0, (budget / 300) * 100)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
