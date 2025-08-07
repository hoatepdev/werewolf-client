export type Role =
  | 'villager'
  | 'werewolf'
  | 'seer'
  | 'witch'
  | 'hunter'
  | 'bodyguard'
  | 'tanner'

export interface RoleObject {
  id: Role
  name: string
  description: string
  emoji: string
}
