import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function useChat(roomId) {
  const [messages, setMessages] = useState([])
  const [unread, setUnread] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const isOpenRef = useRef(false)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  // Cargar los últimos 50 mensajes al montar
  useEffect(() => {
    if (!roomId) return

    supabase
      .from('game_chat')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data) setMessages(data)
      })

    // Suscribir a inserts en tiempo real
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_chat', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newMsg = payload.new
          setMessages(prev => [...prev, newMsg])
          if (!isOpenRef.current) {
            setUnread(prev => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  const openChat = useCallback(() => {
    setIsOpen(true)
    setUnread(0)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  const sendMessage = useCallback(async (playerName, playerColor, messageText) => {
    if (!roomId || !messageText.trim()) return
    await supabase.from('game_chat').insert({
      room_id: roomId,
      player_name: playerName,
      player_color: playerColor || 'indigo',
      message: messageText.trim(),
    })
  }, [roomId])

  return { messages, unread, isOpen, openChat, closeChat, sendMessage }
}
