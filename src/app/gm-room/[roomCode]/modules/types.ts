export type AudioStatus = 'idle' | 'speaking' | 'error'

export interface AudioEvent {
  type:
    | 'nightStart'
    | 'roleWake'
    | 'roleSleep'
    | 'nightEnd'
    | 'gameEnded'
    | 'nightAction'
    | 'phaseChanged'
    | 'votingAction'
  role?: 'werewolf' | 'seer' | 'witch' | 'bodyguard'
  message: string
  timestamp?: number
  data?: NightActionData | { phase: string }
}

export interface NightActionData {
  step: string
  action: string
  message: string
  timestamp: number
}

export interface GmLogEntry {
  type: string
  message: string
  data?: unknown
  timestamp: number
  sensitive: boolean
}
