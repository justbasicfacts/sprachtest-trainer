/* Countdown für die Übungsformen mit Zeitdruck (Blitzrunde, 60-Sekunden-Monolog).

   Zählt bewusst nicht in Sekundenschritten hoch, sondern rechnet bei jedem Tick
   gegen einen festen Startzeitpunkt: Ein Browser-Tab im Hintergrund drosselt
   setInterval, ein hochgezählter Zähler würde dadurch nachgehen. */
import { useCallback, useEffect, useRef, useState } from 'react'

export function useCountdown(seconds: number, onDone?: () => void) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const endRef = useRef<number>(0)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!running) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        doneRef.current?.()
      }
    }
    const id = setInterval(tick, 200)
    tick()
    return () => clearInterval(id)
  }, [running])

  const start = useCallback(
    (overrideSeconds?: number) => {
      const total = overrideSeconds ?? seconds
      endRef.current = Date.now() + total * 1000
      setRemaining(total)
      setRunning(true)
    },
    [seconds]
  )

  const stop = useCallback(() => setRunning(false), [])

  const reset = useCallback(() => {
    setRunning(false)
    setRemaining(seconds)
  }, [seconds])

  /** Wie viel der Zeit schon verbraucht ist (0-1), für den Fortschrittsbalken. */
  const progress = seconds === 0 ? 0 : 1 - remaining / seconds

  /** Tatsächlich vergangene Sekunden - für Statistiken wie Wörter/Minute. */
  const elapsed = seconds - remaining

  return { remaining, elapsed, running, progress, start, stop, reset }
}
