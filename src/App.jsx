import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import Lobby from './components/Lobby.jsx'
import PlayerView from './components/PlayerView.jsx'

function JoinByCode() {
  const { code } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // Pre-fill the join code and go to lobby with it
    sessionStorage.setItem('joinCode', code?.toUpperCase() || '')
    navigate('/', { replace: true })
  }, [code, navigate])

  return null
}

function GameRoute() {
  const { roomCode } = useParams()
  const playerId = sessionStorage.getItem('playerId')
  const storedRoom = JSON.parse(sessionStorage.getItem('roomData') || 'null')

  if (!playerId || !storedRoom || storedRoom.code !== roomCode) {
    window.location.href = '/'
    return null
  }

  return <PlayerView room={storedRoom} playerId={playerId} />
}

export default function App() {
  const [gameSession, setGameSession] = useState(() => {
    const stored = sessionStorage.getItem('gameSession')
    return stored ? JSON.parse(stored) : null
  })

  function handleGameStart({ room, playerId }) {
    const session = { room, playerId }
    sessionStorage.setItem('gameSession', JSON.stringify(session))
    sessionStorage.setItem('playerId', playerId)
    sessionStorage.setItem('roomData', JSON.stringify(room))
    setGameSession(session)
  }

  function handleRestart() {
    sessionStorage.removeItem('gameSession')
    sessionStorage.removeItem('playerId')
    sessionStorage.removeItem('roomData')
    setGameSession(null)
  }

  if (gameSession) {
    return (
      <BrowserRouter>
        <PlayerView
          room={gameSession.room}
          playerId={gameSession.playerId}
          onRestart={handleRestart}
        />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/join/:code" element={<JoinByCode />} />
        <Route path="*" element={<Lobby onGameStart={handleGameStart} />} />
      </Routes>
    </BrowserRouter>
  )
}
