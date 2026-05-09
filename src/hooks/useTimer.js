import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer(initialSeconds, onExpire) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onExpireRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const start = useCallback((secs) => {
    if (secs !== undefined) setSeconds(secs)
    setRunning(true)
  }, [])

  const stop = useCallback(() => {
    clearInterval(intervalRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback((secs) => {
    clearInterval(intervalRef.current)
    setSeconds(secs ?? initialSeconds)
    setRunning(false)
  }, [initialSeconds])

  const timerColor = seconds > 10 ? 'text-green-400'
    : seconds > 5 ? 'text-yellow-400'
    : 'text-red-500'

  const timerClass = seconds <= 5 ? 'animate-[blink-red_0.5s_ease-in-out_infinite]' : ''

  return { seconds, running, start, stop, reset, timerColor, timerClass }
}
