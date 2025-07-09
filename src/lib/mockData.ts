import { Player } from '@/types/player'
import { Phase } from '@/hook/useRoomStore'

export const mockPlayers: Player[] = [
  {
    id: 'player_1',
    username: 'Alice Johnson',
    status: 'approved',
    alive: true,
    avatarKey: 0,
  },
  {
    id: 'player_2',
    username: 'Bob Smith',
    status: 'approved',
    alive: true,
    avatarKey: 1,
  },
  {
    id: 'player_3',
    username: 'Charlie Brown',
    status: 'approved',
    alive: false,
    avatarKey: 2,
  },
  {
    id: 'player_4',
    username: 'Diana Prince',
    status: 'approved',
    alive: true,
    avatarKey: 3,
  },
  {
    id: 'player_5',
    username: 'Eve Wilson',
    status: 'approved',
    alive: true,
    avatarKey: 4,
  },
  {
    id: 'player_6',
    username: 'Frank Miller',
    status: 'approved',
    alive: true,
    avatarKey: 5,
  },
  {
    id: 'player_7',
    username: 'Grace Lee',
    status: 'approved',
    alive: false,
    avatarKey: 6,
  },
  {
    id: 'player_8',
    username: 'Henry Davis',
    status: 'approved',
    alive: true,
    avatarKey: 7,
  },
  {
    id: 'player_9',
    username: 'Ivy Chen',
    status: 'approved',
    alive: true,
    avatarKey: 8,
  },
]

export const mockGmPlayer: Player = {
  id: 'gm_1',
  username: 'Game Master',
  status: 'gm',
  alive: true,
  avatarKey: 9,
}

export const mockPendingPlayers: Player[] = [
  {
    id: 'player_10',
    username: 'Jack Wilson',
    status: 'pending',
    alive: true,
    avatarKey: 10,
  },
  {
    id: 'player_11',
    username: 'Kate Anderson',
    status: 'pending',
    alive: true,
    avatarKey: 11,
  },
]

export const mockRejectedPlayers: Player[] = [
  {
    id: 'player_12',
    username: "Liam O'Connor",
    status: 'rejected',
    alive: true,
    avatarKey: 12,
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
  withGm: {
    players: [mockGmPlayer, ...mockPlayers.slice(0, 5)],
    phase: 'night' as Phase,
    description: 'Room with GM and 5 players',
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
    event: 'game:phaseChanged',
    data: { phase: 'night' },
  },
  roleAssignment: {
    event: 'room:role',
    data: 'werewolf',
  },
  aliveStatus: {
    event: 'room:alive',
    data: true,
  },
  playerApproved: {
    event: 'player:approved',
    data: { roomCode: 'ABC123', players: mockPlayers },
  },
  playerRejected: {
    event: 'player:rejected',
    data: { message: 'You were rejected by the GM.' },
  },
  nightWerewolfAct: {
    event: 'night:werewolfAct',
    data: {
      message: 'Sói thức dậy - Hãy chọn người để cắn',
      candidates: mockPlayers
        .filter((p) => p.alive && p.role !== 'werewolf')
        .map((p) => ({ id: p.id, username: p.username })),
      werewolves: mockPlayers
        .filter((p) => p.role === 'werewolf')
        .map((p) => ({ id: p.id, username: p.username })),
    },
  },
  nightSeerAct: {
    event: 'night:seerAct',
    data: {
      message: 'Tiên tri thức dậy - Hãy chọn người để xem',
      candidates: mockPlayers
        .filter((p) => p.alive)
        .map((p) => ({ id: p.id, username: p.username })),
    },
  },
  nightWitchAct: {
    event: 'night:witchAct',
    data: {
      message: 'Phù thủy thức dậy - Hãy thực hiện hành động',
      targetKilledByWerewolf: 'player_3',
      canHeal: true,
      canPoison: true,
      alivePlayerIds: mockPlayers
        .filter((p) => p.alive)
        .map((p) => ({ id: p.id, username: p.username })),
    },
  },
  nightBodyguardAct: {
    event: 'night:bodyguardAct',
    data: {
      message: 'Bảo vệ thức dậy - Hãy chọn người để bảo vệ',
      candidates: mockPlayers
        .filter((p) => p.alive && p.id !== 'player_8')
        .map((p) => ({ id: p.id, username: p.username })),
      lastProtected: 'player_4',
    },
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
  id: string,
  username: string,
  status: 'pending' | 'approved' | 'rejected' | 'gm' = 'approved',
  alive: boolean = true,
  avatarKey: number = 0,
  role?: 'villager' | 'werewolf' | 'seer' | 'witch' | 'hunter' | 'bodyguard',
): Player => ({
  id,
  username,
  status,
  alive,
  avatarKey,
  role,
})

export const createMockRoom = (
  roomCode: string,
  hostId: string,
  players: Player[],
  phase: Phase = 'night',
  round: number = 0,
) => ({
  roomCode,
  hostId,
  players,
  phase,
  round,
  actions: [],
})

export const mockGamePresets = {
  quickTest: {
    roomCode: 'TEST123',
    phase: 'night' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[1], role: 'villager' as const, alive: true },
      { ...mockPlayers[2], role: 'seer' as const, alive: true },
      { ...mockPlayers[3], role: 'witch' as const, alive: true },
      { ...mockPlayers[4], role: 'villager' as const, alive: true },
    ],
    description: 'Quick test with 5 players - all roles',
  },
  werewolfTest: {
    roomCode: 'WOLF456',
    phase: 'night' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[1], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[2], role: 'villager' as const, alive: true },
      { ...mockPlayers[3], role: 'villager' as const, alive: true },
      { ...mockPlayers[4], role: 'seer' as const, alive: true },
      { ...mockPlayers[5], role: 'witch' as const, alive: true },
      { ...mockPlayers[6], role: 'hunter' as const, alive: true },
      { ...mockPlayers[7], role: 'bodyguard' as const, alive: true },
    ],
    description: 'Full game with 8 players - all roles',
  },
  nightPhase: {
    roomCode: 'NIGHT789',
    phase: 'night' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[1], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[2], role: 'villager' as const, alive: false },
      { ...mockPlayers[3], role: 'seer' as const, alive: true },
      { ...mockPlayers[4], role: 'witch' as const, alive: true },
      { ...mockPlayers[5], role: 'hunter' as const, alive: true },
    ],
    description: 'Night phase - 1 dead player',
  },
  dayPhase: {
    roomCode: 'DAY012',
    phase: 'day' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[1], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[2], role: 'villager' as const, alive: false },
      { ...mockPlayers[3], role: 'seer' as const, alive: true },
      { ...mockPlayers[4], role: 'witch' as const, alive: false },
      { ...mockPlayers[5], role: 'hunter' as const, alive: true },
    ],
    description: 'Day phase - 2 dead players',
  },
  votingPhase: {
    roomCode: 'VOTE345',
    phase: 'voting' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[1], role: 'werewolf' as const, alive: true },
      { ...mockPlayers[2], role: 'villager' as const, alive: false },
      { ...mockPlayers[3], role: 'seer' as const, alive: true },
      { ...mockPlayers[4], role: 'witch' as const, alive: false },
      { ...mockPlayers[5], role: 'hunter' as const, alive: true },
    ],
    description: 'Voting phase - ready to vote',
  },
  gameEnded: {
    roomCode: 'END678',
    phase: 'ended' as Phase,
    players: [
      { ...mockPlayers[0], role: 'werewolf' as const, alive: false },
      { ...mockPlayers[1], role: 'werewolf' as const, alive: false },
      { ...mockPlayers[2], role: 'villager' as const, alive: false },
      { ...mockPlayers[3], role: 'seer' as const, alive: true },
      { ...mockPlayers[4], role: 'witch' as const, alive: false },
      { ...mockPlayers[5], role: 'hunter' as const, alive: true },
    ],
    description: 'Game ended - villagers won',
  },
}

export const mockCurrentPlayer = {
  playerId: 'player_1',
  username: 'Alice Johnson',
  role: 'werewolf',
  alive: true,
  avatarKey: 0,
  isGm: false,
}
