import { Role } from './role'

export type Player = {
  id: string
  username: string
  avatarKey: number
  status: 'pending' | 'approved' | 'rejected' | 'gm'
  alive: boolean
  role?: Role
}
export interface GameStats {
  totalPlayers: number
  alivePlayers: number
  deadPlayers: number
  werewolves: number
  villagers: number
}
