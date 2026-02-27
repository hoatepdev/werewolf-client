export interface NightLogEntry {
  type: 'night_result'
  round: number
  werewolfTarget: string | null
  bodyguardTarget: string | null
  seerTarget: string | null
  seerResult: boolean | null
  witchHeal: boolean
  witchPoisonTarget: string | null
  deaths: Array<{ username: string; cause: string }>
  saved: string[]
}

export interface VotingLogEntry {
  type: 'voting_result'
  round: number
  votes: Array<{ voter: string; target: string }>
  eliminatedPlayer: string | null
  cause: 'vote' | 'hunter' | 'tie' | 'no_votes'
  tiedPlayers?: string[]
}

export interface HunterShotLogEntry {
  type: 'hunter_shot'
  round: number
  hunter: string
  target: string | null
}

export interface GameEndLogEntry {
  type: 'game_end'
  round: number
  winner: 'villagers' | 'werewolves' | 'tanner'
  totalRounds: number
  players: Array<{ username: string; role: string; alive: boolean }>
}

export type GameLogEntry =
  | NightLogEntry
  | VotingLogEntry
  | HunterShotLogEntry
  | GameEndLogEntry
