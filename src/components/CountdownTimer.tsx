// TODO: remove this component if not used
import React, { useEffect, useState } from 'react'

interface CountdownTimerProps {
  seconds: number
  onEnd?: () => void
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ seconds, onEnd }) => {
  const [time, setTime] = useState(seconds)
  useEffect(() => {
    if (time <= 0) {
      if (onEnd) onEnd()
      return
    }
    const timer = setTimeout(() => setTime(time - 1), 1000)
    return () => clearTimeout(timer)
  }, [time, onEnd])
  return (
    <div className="text-center text-sm text-zinc-400">
      Time left: <span className="font-bold text-yellow-400">{time}s</span>
    </div>
  )
}

export default CountdownTimer
