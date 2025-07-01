export type Player = {
  id: number
  username: string
  avatarKey: number
  status: 'pending' | 'approved' | 'rejected'
  alive: boolean
}
