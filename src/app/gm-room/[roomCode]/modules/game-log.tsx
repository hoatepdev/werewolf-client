'use client'

import { memo, useMemo } from 'react'
import type { GmLogEntry } from './types'

interface GameLogProps {
  logs: GmLogEntry[]
  filtered: boolean
}

export const GameLog = memo(function GameLog({ logs, filtered }: GameLogProps) {
  const visibleLogs = useMemo(() => {
    if (!filtered) return logs
    return logs.filter((log) => !log.sensitive)
  }, [logs, filtered])

  return (
    <div className="m-6 max-h-96 overflow-y-auto rounded-lg bg-zinc-800">
      <h3 className="mb-2 font-bold text-yellow-400">Lịch sử game (log)</h3>
      <ul className="space-y-1 text-sm">
        {visibleLogs.map((log, idx) => (
          <li key={idx}>
            <span className="text-zinc-400">
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>
            <span className="ml-2 font-semibold">
              {log.type.toUpperCase()}:
            </span>
            <span className="ml-2">{log.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})
