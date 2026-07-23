const ROOM_CODE_LENGTH = 6
const ROOM_CODE_PATTERN = /^\d{6}$/

export function parseRoomCodeInput(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  try {
    const url = new URL(trimmed, 'https://werewolf.local')
    const queryRoomCode = url.searchParams.get('roomCode')
    if (queryRoomCode) return normalizeRoomCode(queryRoomCode)
  } catch {
    // Fall through to raw room code parsing.
  }

  return normalizeRoomCode(trimmed)
}

export function buildJoinRoomUrl(roomCode: string, origin?: string): string {
  const path = `/join-room?roomCode=${encodeURIComponent(normalizeRoomCode(roomCode))}`
  return origin ? `${origin}${path}` : path
}

export function isRoomCodeValid(roomCode: string): boolean {
  return ROOM_CODE_PATTERN.test(roomCode)
}

export function formatRoomCode(roomCode: string): string {
  return normalizeRoomCode(roomCode).split('').join(' ')
}

function normalizeRoomCode(value: string): string {
  return value.trim().replace(/\D/g, '').slice(0, ROOM_CODE_LENGTH)
}
