import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat.js'

const COLOR_MAP = {
  indigo: 'text-indigo-400',
  red: 'text-red-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  orange: 'text-orange-400',
  pink: 'text-pink-400',
  purple: 'text-purple-400',
  blue: 'text-blue-400',
  teal: 'text-teal-400',
  cyan: 'text-cyan-400',
}

function formatHora(iso) {
  const d = new Date(iso)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function ChatBubble({ roomId, playerName, playerColor }) {
  const { messages, unread, isOpen, openChat, closeChat, sendMessage } = useChat(roomId)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  // Scroll al fondo cuando llegan nuevos mensajes y el chat está abierto
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isOpen])

  async function handleSend() {
    if (!input.trim()) return
    const text = input
    setInput('')
    await sendMessage(playerName, playerColor, text)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Panel de chat */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 w-full max-w-sm bg-indigo-900 rounded-2xl shadow-2xl border border-indigo-700 flex flex-col"
          style={{ maxHeight: '420px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-700">
            <span className="font-bold text-sm text-white">💬 Chat de sala</span>
            <button onClick={closeChat} className="text-indigo-400 hover:text-white text-lg leading-none">✕</button>
          </div>

          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2" style={{ maxHeight: '288px' }}>
            {messages.length === 0 && (
              <p className="text-xs text-indigo-500 text-center py-4">Aún no hay mensajes. ¡Sé el primero!</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} className="text-xs">
                <span className={`font-bold ${COLOR_MAP[msg.player_color] || 'text-indigo-400'}`}>
                  {msg.player_name}
                </span>
                <span className="text-indigo-500 ml-1">{formatHora(msg.created_at)}</span>
                <p className="text-white mt-0.5 leading-snug">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-indigo-700">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              maxLength={200}
              className="flex-1 bg-indigo-800 text-white text-xs rounded-xl px-3 py-2 outline-none placeholder-indigo-500 border border-indigo-700 focus:border-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Badge de no leídos */}
        {unread > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center z-50">
            {unread > 9 ? '9+' : unread}
          </div>
        )}
        <button
          onClick={isOpen ? closeChat : openChat}
          className="bg-indigo-700 hover:bg-indigo-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition active:scale-95">
          💬
        </button>
      </div>
    </>
  )
}
