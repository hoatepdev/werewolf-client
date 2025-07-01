import { Role } from '@/types/role'

export const LIST_ROLE: Role[] = [
  {
    id: 'villager',
    name: 'Villager',
    description: 'No special ability',
    emoji: '🧑‍🌾',
  },
  {
    id: 'werewolf',
    name: 'Werewolf',
    description: 'Wake up at night and kill',
    emoji: '🐺',
  },
  {
    id: 'seer',
    name: 'Seer',
    description: "Can see one player's role each night",
    emoji: '🔮',
  },
  {
    id: 'witch',
    name: 'Witch',
    description: 'Can heal or poison once per game',
    emoji: '🧪',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    description: 'Can kill one person when they die',
    emoji: '🎯',
  },
  {
    id: 'bodyguard',
    name: 'Bodyguard',
    description: 'Protects 1 player per night',
    emoji: '🛡️',
  },
  {
    id: 'idiot',
    name: 'Idiot',
    description: 'Wins by getting voted out',
    emoji: '🤡',
  },
]
