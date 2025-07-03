export type Player = {
  id: number
  username: string
  avatarKey: number
  status: 'pending' | 'approved' | 'rejected'
  alive: boolean
  role?: 'villager' | 'werewolf' | 'seer' | 'witch' | 'hunter' | 'bodyguard'
}
