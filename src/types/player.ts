export type Player = {
  id: string
  username: string
  avatarKey: number
  status: 'pending' | 'approved' | 'rejected' | 'gm'
  alive: boolean
  role?: 'villager' | 'werewolf' | 'seer' | 'witch' | 'hunter' | 'bodyguard'
}
