// Example usage of mock data for development and testing
import {
  mockPlayers,
  mockRoomScenarios,
  getMockPlayersByCount,
  createMockPlayer,
  mockSocketEvents,
} from './mockData'

// Example 1: Load a specific scenario
export const loadEmptyRoom = () => {
  const scenario = mockRoomScenarios.empty
  console.log('Loading empty room scenario:', scenario.description)
  return scenario
}

// Example 2: Load players with custom count
export const loadFivePlayers = () => {
  const players = getMockPlayersByCount(5)
  console.log(
    'Loaded 5 players:',
    players.map((p) => p.username),
  )
  return players
}

// Example 3: Create a custom player
export const createTestPlayer = () => {
  const player = createMockPlayer(999, 'Test Player', 'approved', true)
  console.log('Created test player:', player)
  return player
}

// Example 4: Simulate socket events
export const simulateSocketEvents = () => {
  console.log('Simulating socket events:')

  Object.entries(mockSocketEvents).forEach(([key, event]) => {
    console.log(`${key}:`, event.event, event.data)
  })
}

// Example 5: Test different room states
export const testRoomStates = () => {
  console.log('Testing different room states:')

  Object.entries(mockRoomScenarios).forEach(([key, scenario]) => {
    console.log(
      `${key}: ${scenario.description} (${scenario.players.length} players, phase: ${scenario.phase})`,
    )
  })
}

// Example 6: Filter players by status
export const filterPlayersByStatus = () => {
  const allPlayers = [...mockPlayers]

  const approved = allPlayers.filter((p) => p.status === 'approved')
  const alive = allPlayers.filter((p) => p.alive)
  const dead = allPlayers.filter((p) => !p.alive)

  console.log('Player filters:')
  console.log('- Approved:', approved.length)
  console.log('- Alive:', alive.length)
  console.log('- Dead:', dead.length)

  return { approved, alive, dead }
}

// Example 7: Generate test data for different game phases
export const generatePhaseTestData = () => {
  const phases = ['night', 'day', 'voting', 'ended'] as const

  return phases.map((phase) => ({
    phase,
    players: getMockPlayersByCount(Math.floor(Math.random() * 9) + 1),
    description: `Test data for ${phase} phase`,
  }))
}

// Example 8: Mock API responses
export const mockApiResponses = {
  getPlayers: {
    success: true,
    data: mockPlayers,
    message: 'Players retrieved successfully',
  },

  joinRoom: {
    success: true,
    playerId: 'player_123',
    message: 'Successfully joined room',
  },

  approvePlayer: {
    success: true,
    message: 'Player approved successfully',
  },

  startGame: {
    success: true,
    message: 'Game started successfully',
  },
}

// Example 9: Performance testing data
export const generateLargePlayerSet = (count: number = 100) => {
  const players = []
  for (let i = 1; i <= count; i++) {
    players.push(
      createMockPlayer(
        i,
        `Player ${i}`,
        'approved',
        Math.random() > 0.3, // 70% alive
      ),
    )
  }
  return players
}

// Example 10: Edge case testing
export const edgeCasePlayers = [
  createMockPlayer(1, '', 'approved', true), // Empty name
  createMockPlayer(2, 'A', 'approved', true), // Single character name
  createMockPlayer(
    3,
    'Very Long Player Name That Exceeds Normal Limits',
    'approved',
    true,
  ), // Very long name
  createMockPlayer(4, 'Player 4', 'pending', true), // Pending player
  createMockPlayer(5, 'Player 5', 'rejected', true), // Rejected player
]

console.log(
  'Mock data examples loaded. Use these functions for development and testing.',
)
