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

function normalizeRoomCode(value: string): string {
  return value.trim().toUpperCase()
}
