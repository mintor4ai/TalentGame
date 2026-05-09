import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

export function useGameState(roomCode, playerId) {
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [gameState, setGameState] = useState(null)
  const [proposals, setProposals] = useState([])
  const [logEntries, setLogEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const channelsRef = useRef([])

  const myPlayer = players.find(p => p.id === playerId)
  const pendingProposal = proposals.find(
    p => p.target_player_id === playerId && p.status === 'pending'
  )

  const fetchInitialData = useCallback(async (roomId) => {
    const [{ data: gs }, { data: props }, { data: logs }] = await Promise.all([
      supabase.from('game_state').select('*').eq('room_id', roomId).single(),
      supabase.from('transfer_proposals').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(20),
      supabase.from('game_log').select('*').eq('room_id', roomId).order('created_at', { ascending: false }).limit(50),
    ])
    if (gs) setGameState(gs)
    if (props) setProposals(props)
    if (logs) setLogEntries(logs.reverse())
  }, [])

  useEffect(() => {
    if (!roomCode) return

    let roomId = null

    const init = async () => {
      setLoading(true)
      try {
        const { data: roomData, error: roomErr } = await supabase
          .from('game_rooms')
          .select('*')
          .eq('code', roomCode.toUpperCase())
          .single()

        if (roomErr || !roomData) {
          setError('Sala no encontrada.')
          setLoading(false)
          return
        }

        roomId = roomData.id
        setRoom(roomData)

        const { data: playersData } = await supabase
          .from('game_players')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at')

        if (playersData) setPlayers(playersData)

        await fetchInitialData(roomId)
        subscribeToRoom(roomId)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    const subscribeToRoom = (rid) => {
      // Cleanup existing
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
      channelsRef.current = []

      const roomChannel = supabase
        .channel(`room:${rid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${rid}` },
          ({ new: updated }) => setRoom(updated))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `room_id=eq.${rid}` },
          async () => {
            const { data } = await supabase.from('game_players').select('*').eq('room_id', rid).order('created_at')
            if (data) setPlayers(data)
          })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state', filter: `room_id=eq.${rid}` },
          ({ new: updated }) => setGameState(updated))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_proposals', filter: `room_id=eq.${rid}` },
          async () => {
            const { data } = await supabase
              .from('transfer_proposals').select('*').eq('room_id', rid)
              .order('created_at', { ascending: false }).limit(20)
            if (data) setProposals(data)
          })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_log', filter: `room_id=eq.${rid}` },
          ({ new: entry }) => setLogEntries(prev => [...prev.slice(-99), entry]))
        .subscribe()

      channelsRef.current.push(roomChannel)
    }

    init()

    return () => {
      channelsRef.current.forEach(ch => supabase.removeChannel(ch))
    }
  }, [roomCode, fetchInitialData])

  const updateGameState = useCallback(async (updates) => {
    if (!room?.id) return
    const { error } = await supabase
      .from('game_state')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('room_id', room.id)
    return error
  }, [room?.id])

  const updateRoom = useCallback(async (updates) => {
    if (!room?.id) return
    const { error } = await supabase
      .from('game_rooms')
      .update(updates)
      .eq('id', room.id)
    return error
  }, [room?.id])

  const addLog = useCallback(async (message, type = 'info') => {
    if (!room?.id) return
    await supabase.from('game_log').insert({ room_id: room.id, message, type })
  }, [room?.id])

  const proposeTransfer = useCallback(async ({ personId, slotId, toObraId, fromObra, targetPlayerId }) => {
    if (!room?.id || !myPlayer) return

    const expiresAt = new Date(Date.now() + 20000).toISOString()
    const { data, error } = await supabase.from('transfer_proposals').insert({
      room_id: room.id,
      proposer_id: myPlayer.id,
      proposer_name: myPlayer.player_name,
      target_player_id: targetPlayerId,
      person_id: personId,
      slot_id: slotId,
      from_obra: fromObra,
      to_obra_id: toObraId,
      status: 'pending',
      expires_at: expiresAt,
    }).select().single()
    return { data, error }
  }, [room?.id, myPlayer])

  const resolveProposal = useCallback(async (proposalId, accepted) => {
    const { error } = await supabase
      .from('transfer_proposals')
      .update({ status: accepted ? 'accepted' : 'vetoed' })
      .eq('id', proposalId)
    return error
  }, [])

  const updatePlayerReady = useCallback(async (ready) => {
    if (!playerId) return
    await supabase.from('game_players').update({ is_ready: ready }).eq('id', playerId)
  }, [playerId])

  const updateVetosLeft = useCallback(async (vetosLeft) => {
    if (!playerId) return
    await supabase.from('game_players').update({ vetos_left: vetosLeft }).eq('id', playerId)
  }, [playerId])

  return {
    room, players, gameState, proposals, logEntries, loading, error,
    myPlayer, pendingProposal,
    updateGameState, updateRoom, addLog,
    proposeTransfer, resolveProposal,
    updatePlayerReady, updateVetosLeft,
    refetch: () => room?.id && fetchInitialData(room.id),
  }
}
