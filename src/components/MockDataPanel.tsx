'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRoomStore } from '@/hook/useRoomStore'
import {
  mockRoomScenarios,
  getMockPlayersByCount,
  createMockPlayer,
  mockGamePresets,
  mockCurrentPlayer,
} from '@/lib/mockData'
import { X } from 'lucide-react'
import { useClickOutside } from '@/hook/useClickOutside'

interface MockDataPanelProps {
  isVisible?: boolean
  toggleMockDataPanel?: () => void
}

export function MockDataPanel({
  isVisible = false,
  toggleMockDataPanel,
}: MockDataPanelProps) {
  const mockPanelRef = useClickOutside<HTMLDivElement>(toggleMockDataPanel!)

  const [customPlayerCount, setCustomPlayerCount] = useState(5)
  const [customPlayerName, setCustomPlayerName] = useState('')

  const approvedPlayers = useRoomStore((s) => s.approvedPlayers)
  const setPhase = useRoomStore((s) => s.setPhase)
  const setApprovedPlayers = useRoomStore((s) => s.setApprovedPlayers)
  const setRole = useRoomStore((s) => s.setRole)
  const setRoomCode = useRoomStore((s) => s.setRoomCode)
  const setPlayerId = useRoomStore((s) => s.setPlayerId)
  const setUsername = useRoomStore((s) => s.setUsername)
  const setAvatarKey = useRoomStore((s) => s.setAvatarKey)
  const setResetGame = useRoomStore((s) => s.setResetGame)

  const loadScenario = (scenarioName: keyof typeof mockRoomScenarios) => {
    const scenario = mockRoomScenarios[scenarioName]
    setPhase(scenario.phase)
    setApprovedPlayers(scenario.players)
    console.log(`Loaded scenario: ${scenario.description}`)
  }

  const loadCustomPlayerCount = () => {
    const players = getMockPlayersByCount(customPlayerCount)
    setApprovedPlayers(players)
    console.log(`Loaded ${customPlayerCount} players`)
  }

  const addCustomPlayer = () => {
    if (!customPlayerName.trim()) return

    const newPlayer = createMockPlayer(
      `player_${Date.now()}`,
      customPlayerName,
      'approved',
      true,
    )

    setApprovedPlayers([...approvedPlayers, newPlayer])
    setCustomPlayerName('')
    console.log(`Added player: ${newPlayer.username}`)
  }

  const clearPlayers = () => {
    setApprovedPlayers([])
    console.log('Cleared all players')
  }

  const setRandomRole = () => {
    const roles = [
      'werewolf',
      'villager',
      'seer',
      'witch',
      'hunter',
      'bodyguard',
    ]
    const randomRole = roles[Math.floor(Math.random() * roles.length)]
    setRole(randomRole as Player['role'])
    console.log(`Set random role: ${randomRole}`)
  }

  const toggleAliveStatus = () => {
    console.log('Toggled alive status')
  }

  const loadGamePreset = (presetName: keyof typeof mockGamePresets) => {
    const preset = mockGamePresets[presetName]
    setRoomCode(preset.roomCode)
    setPhase(preset.phase)
    setApprovedPlayers(preset.players)

    const currentPlayer = preset.players[0]
    setPlayerId(currentPlayer.id)
    setUsername(currentPlayer.username)
    setRole(currentPlayer.role || null)
    setAvatarKey(currentPlayer.avatarKey)

    console.log(`Loaded game preset: ${preset.description}`)
  }

  const loadCurrentPlayerPreset = () => {
    setPlayerId(mockCurrentPlayer.playerId)
    setUsername(mockCurrentPlayer.username)
    setRole(mockCurrentPlayer.role)
    setAvatarKey(mockCurrentPlayer.avatarKey)
    console.log('Loaded current player preset')
  }

  const resetToDefault = () => {
    setResetGame()
    console.log('Reset game to default state')
  }

  if (!isVisible) return null

  return (
    <Card
      ref={mockPanelRef}
      className="fixed top-4 right-4 z-50 max-h-96 w-80 overflow-x-hidden overflow-y-auto border-zinc-600 bg-zinc-800"
    >
      <CardHeader className="flex w-80 flex-row justify-between bg-zinc-800">
        <CardTitle className="w-full text-sm text-yellow-400">
          🧪 Bảng dữ liệu mẫu
        </CardTitle>
        <X className="h-4 w-4" onClick={toggleMockDataPanel} />
      </CardHeader>
      <CardContent className="mt-10 space-y-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            🎮 Thiết lập game nhanh
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(mockGamePresets).map(([key, preset]) => (
              <Button
                key={key}
                variant="default"
                className="h-auto py-1 text-xs"
                onClick={() =>
                  loadGamePreset(key as keyof typeof mockGamePresets)
                }
              >
                {preset.description}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Kịch bản (Cơ bản)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(mockRoomScenarios).map(([key, scenario]) => (
              <Button
                key={key}
                variant="default"
                className="h-auto py-1 text-xs"
                onClick={() =>
                  loadScenario(key as keyof typeof mockRoomScenarios)
                }
              >
                {scenario.description}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Custom Player Count
          </h4>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="9"
              value={customPlayerCount}
              onChange={(e) => setCustomPlayerCount(Number(e.target.value))}
              className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
            />
            <Button
              variant="default"
              className="px-2 py-1 text-xs"
              onClick={loadCustomPlayerCount}
            >
              Load
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Add Custom Player
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Player name"
              value={customPlayerName}
              onChange={(e) => setCustomPlayerName(e.target.value)}
              className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
            />
            <Button
              variant="default"
              className="px-2 py-1 text-xs"
              onClick={addCustomPlayer}
            >
              Add
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={clearPlayers}
            >
              Clear Players
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={setRandomRole}
            >
              Random Role
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={toggleAliveStatus}
            >
              Toggle Alive
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={loadCurrentPlayerPreset}
            >
              Load Player
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={resetToDefault}
            >
              Reset All
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Phase Controls
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {(['night', 'day', 'voting', 'ended'] as const).map((phase) => (
              <Button
                key={phase}
                variant="default"
                className="h-auto py-1 text-xs"
                onClick={() => setPhase(phase)}
              >
                {phase}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
