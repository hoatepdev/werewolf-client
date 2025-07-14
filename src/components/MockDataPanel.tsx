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
import { Player } from '@/types/player'
import { Role } from '@/types/role'

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

  const {
    approvedPlayers,
    setPhase,
    setApprovedPlayers,
    setRole,
    setRoomCode,
    setPlayerId,
    setUsername,
    setAvatarKey,
    setResetGame,
  } = useRoomStore()

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
    const roles: Role[] = [
      'werewolf',
      'villager',
      'seer',
      'witch',
      'hunter',
      'bodyguard',
    ]
    const randomRole = roles[Math.floor(Math.random() * roles.length)]
    setRole(randomRole)
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
    setRole(mockCurrentPlayer.role as Role)
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
            Số người chơi tùy chỉnh
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
              Tải
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Thêm người chơi tùy chỉnh
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tên người chơi"
              value={customPlayerName}
              onChange={(e) => setCustomPlayerName(e.target.value)}
              className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-xs text-white"
            />
            <Button
              variant="default"
              className="px-2 py-1 text-xs"
              onClick={addCustomPlayer}
            >
              Thêm
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Hành động
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={clearPlayers}
            >
              Xóa người chơi
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={setRandomRole}
            >
              Vai ngẫu nhiên
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={toggleAliveStatus}
            >
              Chuyển trạng thái
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={loadCurrentPlayerPreset}
            >
              Tải người chơi
            </Button>
            <Button
              variant="default"
              className="h-auto py-1 text-xs"
              onClick={resetToDefault}
            >
              Đặt lại tất cả
            </Button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-300">
            Điều khiển giai đoạn
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
