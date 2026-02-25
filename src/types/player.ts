import { Role } from './role'

type StatusPlayer = 'pending' | 'approved' | 'rejected' | 'gm'

export type Player = {
  id: string
  avatarKey: number
  username: string
  status: StatusPlayer
  alive: boolean
  role: Role
}
export interface GameStats {
  totalPlayers: number
  alivePlayers: number
  deadPlayers: number
  werewolves: number
  villagers: number
}
