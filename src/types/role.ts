import { Player } from './player'

export interface Role {
  id: Player['role']
  name: string
  description: string
  emoji: string
}
