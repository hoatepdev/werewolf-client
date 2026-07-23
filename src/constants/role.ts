import { RoleObject } from '@/types/role'

export const LIST_ROLE: RoleObject[] = [
  {
    id: 'villager',
    name: 'Dân làng',
    description: 'Không có khả năng đặc biệt',
    emoji: '🧑‍🌾',
  },
  {
    id: 'werewolf',
    name: 'Sói',
    description: 'Thức dậy vào ban đêm để giết một người',
    emoji: '🐺',
  },
  {
    id: 'seer',
    name: 'Tiên tri',
    description: 'Có thể kiểm tra một người có phải là sói không',
    emoji: '🔮',
  },
  {
    id: 'witch',
    name: 'Phù thủy',
    description: 'Có thể hồi phục hoặc đầu độc một người mỗi đêm',
    emoji: '🧪',
  },
  {
    id: 'bodyguard',
    name: 'Bảo vệ',
    description: 'Bảo vệ 1 người mỗi đêm',
    emoji: '🛡️',
  },
  {
    id: 'hunter',
    name: 'Thợ săn',
    description: 'Có thể giết một người khi họ chết',
    emoji: '🎯',
  },

  {
    id: 'tanner',
    name: 'Chán đời',
    description: 'Thắng khi bị vote chết',
    emoji: '😵',
  },
  {
    id: 'cupid',
    name: 'Thần tình yêu',
    description:
      'Đêm đầu tiên chọn hai người để ghép đôi. Một người chết thì người kia chết theo.',
    emoji: '💘',
  },
]
