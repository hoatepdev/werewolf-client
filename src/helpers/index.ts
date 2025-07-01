import { AVATAR_OPTIONS } from '@/lib/mockAvatar'
import { Player } from '@/types/player'

export const getInitialsName = (name: string) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const renderAvatar = (player: Partial<Player>) => {
  return player.avatarKey
    ? AVATAR_OPTIONS[player.avatarKey]
    : getInitialsName(player.username || '')
}
