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
    | 'hunterAction'
  role?: 'werewolf' | 'seer' | 'witch' | 'bodyguard' | 'cupid'
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

export interface VotingProgress {
  votedCount: number
  respondedCount: number
  totalVoters: number
}

export interface GmCommandAck {
  success: boolean
  status?:
    | 'ok'
    | 'invalid_data'
    | 'not_authorized'
    | 'room_not_found'
    | 'player_not_found'
    | 'invalid_state'
    | 'requires_force'
  message?: string
}
