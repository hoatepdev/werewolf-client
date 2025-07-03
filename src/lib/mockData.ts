import { Player } from '@/types/player'
import { Phase } from '@/hook/useRoomStore'

export const mockPlayers: Player[] = [
  {
    id: 1,
    username: 'Alice Johnson',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 2,
    username: 'Bob Smith',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 3,
    username: 'Charlie Brown',
    status: 'approved',
    alive: false,
    avatarKey: 0,
  },
  {
    id: 4,
    username: 'Diana Prince',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 5,
    username: 'Eve Wilson',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 6,
    username: 'Frank Miller',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 7,
    username: 'Grace Lee',
    status: 'approved',
    alive: false,
    avatarKey: 0,
  },
  {
    id: 8,
    username: 'Henry Davis',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 9,
    username: 'Ivy Chen',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
]

export const mockPendingPlayers: Player[] = [
  {
    id: 10,
    username: 'Jack Wilson',
    status: 'pending',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 11,
    username: 'Kate Anderson',
    status: 'pending',
    alive: true,
    avatarKey: 0,
  },
]

export const mockRejectedPlayers: Player[] = [
  {
    id: 12,
    username: "Liam O'Connor",
    status: 'rejected',
    alive: true,
    avatarKey: 0,
  },
]

export const mockRoomData = {
  roomCode: 'ABC123',
  phase: 'night' as Phase,
  playerId: 'player_1',
  role: 'werewolf',
  alive: true,
  username: 'Test Player',
}

export const mockRoomScenarios = {
  empty: {
    players: [],
    phase: 'night' as Phase,
    description: 'Empty room with no players',
  },
  fewPlayers: {
    players: mockPlayers.slice(0, 3),
    phase: 'night' as Phase,
    description: 'Room with 3 players',
  },
  halfFull: {
    players: mockPlayers.slice(0, 5),
    phase: 'night' as Phase,
    description: 'Room with 5 players',
  },
  full: {
    players: mockPlayers,
    phase: 'night' as Phase,
    description: 'Room with 9 players (full)',
  },
  gameStarted: {
    players: mockPlayers,
    phase: 'night' as Phase,
    description: 'Game started - night phase',
  },
  dayPhase: {
    players: mockPlayers,
    phase: 'day' as Phase,
    description: 'Day phase with some dead players',
  },
  votingPhase: {
    players: mockPlayers,
    phase: 'voting' as Phase,
    description: 'Voting phase',
  },
  gameEnded: {
    players: mockPlayers,
    phase: 'ended' as Phase,
    description: 'Game ended',
  },
}

export const mockPlayerRoles = {
  werewolf: '🐺 Werewolf',
  villager: '🧑 Villager',
  seer: '🔮 Seer',
  witch: '🧪 Witch',
  hunter: '🎯 Hunter',
  bodyguard: '🛡️ Bodyguard',
}

export const mockSocketEvents = {
  roomJoin: {
    event: 'room:join',
    data: { roomCode: 'ABC123', playerId: 'player_1', isGM: false },
  },
  getPlayers: {
    event: 'room:getPlayers',
    data: { roomCode: 'ABC123' },
  },
  updatePlayers: {
    event: 'room:updatePlayers',
    data: mockPlayers,
  },
  phaseChange: {
    event: 'room:phase',
    data: 'night',
  },
  roleAssignment: {
    event: 'room:role',
    data: 'werewolf',
  },
  aliveStatus: {
    event: 'room:alive',
    data: true,
  },
}

export const getMockPlayersByCount = (count: number): Player[] => {
  return mockPlayers.slice(0, Math.min(count, mockPlayers.length))
}

export const getMockScenario = (
  scenarioName: keyof typeof mockRoomScenarios,
) => {
  return mockRoomScenarios[scenarioName]
}

export const createMockPlayer = (
  id: number,
  username: string,
  status: 'pending' | 'approved' | 'rejected' = 'approved',
  alive: boolean = true,
  avatarKey: number = 0,
): Player => ({
  id,
  username,
  status,
  alive,
  avatarKey,
})
