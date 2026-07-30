import { LIST_ROLE } from '@/constants/role'
import type { Role } from '@/types/role'

export type RoleCounts = Partial<Record<Role, number>>
export type RolePresetId = 'balanced' | 'classic' | 'chaos'

export interface RolePreset {
  id: RolePresetId
  name: string
  description: string
  tone: string
  emoji: string
}

export interface CompositionValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

const RARE_ROLES: Role[] = [
  'seer',
  'witch',
  'hunter',
  'bodyguard',
  'tanner',
  'cupid',
]

const VALID_ROLE_IDS = new Set<Role>(LIST_ROLE.map((role) => role.id))

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'balanced',
    name: 'Cân bằng',
    description: 'Dễ bắt đầu, đủ sói và vài vai đặc biệt để ván chơi rõ nhịp.',
    tone: 'Phù hợp nhóm mới hoặc ván đầu tiên',
    emoji: '⚖️',
  },
  {
    id: 'classic',
    name: 'Cổ điển',
    description: 'Nhiều dân làng hơn, ít biến số, tập trung vào suy luận và tranh luận.',
    tone: 'Ít drama, dễ giải thích luật',
    emoji: '🌙',
  },
  {
    id: 'chaos',
    name: 'Nhiều biến số',
    description: 'Thêm nhiều vai đặc biệt để tạo bất ngờ và các pha lật kèo.',
    tone: 'Hợp nhóm đã quen luật',
    emoji: '🔥',
  },
]

export function getPresetById(presetId: RolePresetId | 'custom' | null) {
  if (!presetId || presetId === 'custom') return null
  return ROLE_PRESETS.find((preset) => preset.id === presetId) ?? null
}

export function getRecommendedPresetId(playerCount: number): RolePresetId {
  if (playerCount >= 8) return 'balanced'
  return 'classic'
}

export function normalizeRoleCounts(counts: RoleCounts): RoleCounts {
  return Object.entries(counts).reduce<RoleCounts>((acc, [roleId, count]) => {
    if (!VALID_ROLE_IDS.has(roleId as Role)) return acc
    const normalizedCount = Math.max(0, Math.floor(Number(count) || 0))
    if (normalizedCount > 0) {
      acc[roleId as Role] = normalizedCount
    }
    return acc
  }, {})
}

export function countSelectedRoles(counts: RoleCounts): number {
  return Object.values(counts).reduce((sum, count) => sum + (count ?? 0), 0)
}

export function flattenRoleCounts(counts: RoleCounts): Role[] {
  return LIST_ROLE.flatMap((role) => {
    const count = counts[role.id] ?? 0
    return Array.from({ length: count }, () => role.id)
  })
}

export function getRoleCounts(roles: Role[]): RoleCounts {
  return roles.reduce<RoleCounts>((acc, role) => {
    if (!VALID_ROLE_IDS.has(role)) return acc
    acc[role] = (acc[role] ?? 0) + 1
    return acc
  }, {})
}

export function buildPresetRoleCounts(
  presetId: RolePresetId,
  playerCount: number,
): RoleCounts {
  const safePlayerCount = Math.max(0, playerCount)
  const counts: RoleCounts = {}

  const addRole = (role: Role, amount = 1) => {
    if (countSelectedRoles(counts) >= safePlayerCount) return
    const available = safePlayerCount - countSelectedRoles(counts)
    counts[role] = (counts[role] ?? 0) + Math.min(amount, available)
  }

  const fillVillagers = () => {
    const remaining = safePlayerCount - countSelectedRoles(counts)
    if (remaining > 0) addRole('villager', remaining)
  }

  if (safePlayerCount === 0) return counts

  if (presetId === 'classic') {
    addRole('werewolf', safePlayerCount >= 8 ? 2 : 1)
    if (safePlayerCount >= 5) addRole('seer')
    if (safePlayerCount >= 7) addRole('witch')
    fillVillagers()
    return counts
  }

  if (presetId === 'chaos') {
    addRole('werewolf', safePlayerCount >= 8 ? 2 : 1)
    if (safePlayerCount >= 5) addRole('seer')
    if (safePlayerCount >= 6) addRole('witch')
    if (safePlayerCount >= 7) addRole('bodyguard')
    if (safePlayerCount >= 8) addRole('hunter')
    if (safePlayerCount >= 9) addRole('cupid')
    if (safePlayerCount >= 10) addRole('tanner')
    fillVillagers()
    return counts
  }

  addRole('werewolf', safePlayerCount >= 8 ? 2 : 1)
  if (safePlayerCount >= 5) addRole('seer')
  if (safePlayerCount >= 6) addRole('witch')
  if (safePlayerCount >= 7) addRole('bodyguard')
  if (safePlayerCount >= 9) addRole('hunter')
  fillVillagers()

  return counts
}

export function fillRemainingWithVillagers(
  counts: RoleCounts,
  playerCount: number,
): RoleCounts {
  const normalizedCounts = normalizeRoleCounts(counts)
  const remaining = playerCount - countSelectedRoles(normalizedCounts)
  if (remaining <= 0) return normalizedCounts

  return {
    ...normalizedCounts,
    villager: (normalizedCounts.villager ?? 0) + remaining,
  }
}

export function validateRoleComposition(
  roles: Role[],
  playerCount: number,
  minPlayer = 4,
): CompositionValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const invalidRoles = roles.filter((role) => !VALID_ROLE_IDS.has(role))
  const counts = getRoleCounts(roles)
  const specialRoleCount = RARE_ROLES.reduce(
    (sum, role) => sum + (counts[role] ?? 0),
    0,
  )

  if (playerCount < minPlayer) {
    errors.push(`Cần ít nhất ${minPlayer} người chơi để phân vai.`)
  }

  if (roles.length === 0) {
    errors.push('Chưa có vai nào trong cấu hình.')
  }

  if (roles.length !== playerCount) {
    errors.push(`Cần chọn đúng ${playerCount} vai cho ${playerCount} người chơi.`)
  }

  if (!roles.includes('werewolf')) {
    errors.push('Cấu hình phải có ít nhất 1 Sói.')
  }

  if (invalidRoles.length > 0) {
    errors.push('Có vai không hợp lệ trong cấu hình.')
  }

  if (roles.length > 0 && !roles.includes('villager')) {
    warnings.push('Không có Dân làng, ván có thể khó cân bằng cho người mới.')
  }

  if (playerCount >= 8 && (counts.werewolf ?? 0) < 2) {
    warnings.push('Từ 8 người trở lên thường nên có 2 Sói để cân bằng hơn.')
  }

  if (playerCount > 0 && specialRoleCount > Math.ceil(playerCount / 2)) {
    warnings.push('Có khá nhiều vai đặc biệt, hãy chắc nhóm đã quen luật.')
  }

  RARE_ROLES.forEach((role) => {
    if ((counts[role] ?? 0) > 1) {
      const roleName = LIST_ROLE.find((item) => item.id === role)?.name ?? role
      warnings.push(`Có nhiều hơn 1 ${roleName}; hãy chắc GM muốn biến thể này.`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
