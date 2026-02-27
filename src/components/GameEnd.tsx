'use client'

import React, { useState } from 'react'
import { Player } from '@/types/player'
import { LIST_ROLE } from '@/constants/role'
import type {
  GameLogEntry,
  NightLogEntry,
  VotingLogEntry,
  HunterShotLogEntry,
  GameEndLogEntry,
} from '@/types/game-log'

type WinnerType = 'villagers' | 'werewolves' | 'tanner'

const WINNER_DISPLAY: Record<
  WinnerType,
  { name: string; emoji: string; color: string }
> = {
  villagers: { name: 'Dân làng', emoji: '🏘️', color: 'text-blue-400' },
  werewolves: { name: 'Sói', emoji: '🐺', color: 'text-red-400' },
  tanner: { name: 'Chán đời', emoji: '😈', color: 'text-purple-400' },
}

const CAUSE_VI: Record<string, string> = {
  werewolf: 'bị Sói cắn',
  witch: 'bị Phù thủy đầu độc',
  vote: 'bị bỏ phiếu loại',
  hunter: 'bị Thợ săn bắn',
  tie: 'Hòa phiếu — không ai bị loại',
  no_votes: 'Không ai bỏ phiếu',
}

interface GameEndProps {
  winningTeam: WinnerType
  players: Player[]
  currentPlayerId?: string | null
  gameLog?: GameLogEntry[]
  onReturn: () => void
  onPlayAgain: () => void
}

// Night log entry renderer
function NightLogEntryView({ entry }: { entry: NightLogEntry }) {
  const {
    round,
    werewolfTarget,
    bodyguardTarget,
    seerTarget,
    seerResult,
    witchHeal,
    witchPoisonTarget,
    deaths,
    saved,
  } = entry

  const getDeathCauseText = (cause: string) => CAUSE_VI[cause] || cause

  return (
    <div className="mb-3 rounded-lg bg-zinc-800/50 p-3">
      <div className="mb-2 flex items-center gap-2 border-b border-zinc-700 pb-2">
        <span className="text-lg">🌙</span>
        <span className="font-semibold text-yellow-400">Đêm {round}</span>
      </div>
      <ul className="space-y-1 text-sm">
        <li className="flex items-start gap-2">
          <span className="text-red-400">🐺</span>
          <span>
            Sói tấn công: <span className="font-semibold">{werewolfTarget ?? 'Không ai'}</span>
          </span>
        </li>
        {bodyguardTarget && (
          <li className="flex items-start gap-2">
            <span className="text-blue-400">🛡️</span>
            <span>
              Bảo vệ: <span className="font-semibold">{bodyguardTarget}</span>
            </span>
          </li>
        )}
        {seerTarget && (
          <li className="flex items-start gap-2">
            <span className="text-purple-400">🔮</span>
            <span>
              Tiên tri xem{' '}
              <span className="font-semibold">{seerTarget}</span> →{' '}
              <span className={seerResult ? 'text-red-400' : 'text-green-400'}>
                {seerResult ? 'Sói' : 'Dân'}
              </span>
            </span>
          </li>
        )}
        {(witchHeal || witchPoisonTarget) && (
          <li className="flex items-start gap-2">
            <span className="text-pink-400">🧪</span>
            <span>
              Phù thủy:{' '}
              {witchHeal && <span className="text-green-400"> Cứu người</span>}
              {witchPoisonTarget && (
                <span className="text-red-400">
                  {' '}
                  Đầu độc <span className="font-semibold">{witchPoisonTarget}</span>
                </span>
              )}
            </span>
          </li>
        )}
        {saved.length > 0 && (
          <li className="flex items-start gap-2">
            <span className="text-green-400">✨</span>
            <span>
              Được cứu: <span className="font-semibold text-green-400">{saved.join(', ')}</span>
            </span>
          </li>
        )}
        {deaths.length > 0 ? (
          <li className="flex items-start gap-2">
            <span className="text-red-500">💀</span>
            <span>
              Kết quả:{' '}
              {deaths.map((d) => (
                <span key={d.username} className="text-red-400">
                  <span className="font-semibold">{d.username}</span> {getDeathCauseText(d.cause)}
                </span>
              ))}
            </span>
          </li>
        ) : (
          <li className="flex items-start gap-2 text-green-400">
            <span>✅</span>
            <span>Đêm bình yên — không ai chết</span>
          </li>
        )}
      </ul>
    </div>
  )
}

// Voting log entry renderer
function VotingLogEntryView({ entry }: { entry: VotingLogEntry }) {
  const { round, votes, eliminatedPlayer, cause, tiedPlayers } = entry

  return (
    <div className="mb-3 rounded-lg bg-zinc-800/50 p-3">
      <div className="mb-2 flex items-center gap-2 border-b border-zinc-700 pb-2">
        <span className="text-lg">🗳️</span>
        <span className="font-semibold text-yellow-400">Bỏ phiếu (Vòng {round})</span>
      </div>
      {votes.length > 0 && (
        <ul className="mb-2 space-y-1 text-sm">
          {votes.map((vote, idx) => (
            <li key={idx} className="text-zinc-300">
              <span className="font-semibold">{vote.voter}</span>
              <span className="mx-1 text-zinc-500">→</span>
              <span className="font-semibold">{vote.target}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="text-sm">
        {eliminatedPlayer ? (
          <span className="text-red-400">
            Kết quả: <span className="font-semibold">{eliminatedPlayer}</span> bị loại
          </span>
        ) : (
          <span className="text-zinc-400">
            Kết quả: {cause === 'tie' ? `Hòa phiếu (${tiedPlayers?.join(', ')})` : CAUSE_VI[cause]}
          </span>
        )}
      </div>
    </div>
  )
}

// Hunter shot log entry renderer
function HunterShotLogEntryView({ entry }: { entry: HunterShotLogEntry }) {
  const { round, hunter, target } = entry

  return (
    <div className="mb-3 rounded-lg bg-zinc-800/50 p-3">
      <div className="mb-2 flex items-center gap-2 border-b border-zinc-700 pb-2">
        <span className="text-lg">🎯</span>
        <span className="font-semibold text-yellow-400">Thợ săn (Vòng {round})</span>
      </div>
      <div className="text-sm">
        {target ? (
          <span className="text-red-400">
            <span className="font-semibold">{hunter}</span> bắn{' '}
            <span className="font-semibold">{target}</span>
          </span>
        ) : (
          <span className="text-zinc-400">
            <span className="font-semibold">{hunter}</span> bỏ qua lượt bắn
          </span>
        )}
      </div>
    </div>
  )
}

// Game end log entry renderer
function GameEndLogEntryView({ entry }: { entry: GameEndLogEntry }) {
  const { winner, totalRounds } = entry
  const winnerConfig = WINNER_DISPLAY[winner]

  return (
    <div className="mb-3 rounded-lg bg-zinc-800/50 p-3">
      <div className="mb-2 flex items-center gap-2 border-b border-zinc-700 pb-2">
        <span className="text-lg">🏆</span>
        <span className="font-semibold text-yellow-400">Kết thúc game</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-2xl">{winnerConfig.emoji}</span>
        <span className="font-semibold text-yellow-400">{winnerConfig.name} thắng!</span>
        <span className="text-zinc-500">•</span>
        <span className="text-zinc-400">{totalRounds} vòng</span>
      </div>
    </div>
  )
}

// Main log renderer
function NarrativeLog({ entries }: { entries: GameLogEntry[] }) {
  // Group entries by round
  const groupedByRound = entries.reduce((acc, entry) => {
    const round = entry.round
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(entry)
    return acc
  }, {} as Record<number, GameLogEntry[]>)

  // Get sorted rounds
  const rounds = Object.keys(groupedByRound).map(Number).sort((a, b) => a - b)

  return (
    <div className="mt-4 space-y-4">
      {rounds.map((round) => (
        <div key={round}>
          <div className="mb-2 border-l-4 border-yellow-400 pl-3">
            <span className="font-bold text-yellow-400">Vòng {round}</span>
          </div>
          <div className="space-y-2 pl-3">
            {groupedByRound[round].map((entry, idx) => {
              switch (entry.type) {
                case 'night_result':
                  return <NightLogEntryView key={idx} entry={entry} />
                case 'voting_result':
                  return <VotingLogEntryView key={idx} entry={entry} />
                case 'hunter_shot':
                  return <HunterShotLogEntryView key={idx} entry={entry} />
                case 'game_end':
                  return <GameEndLogEntryView key={idx} entry={entry} />
                default:
                  return null
              }
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const GameEnd: React.FC<GameEndProps> = ({
  winningTeam,
  players,
  currentPlayerId,
  gameLog,
  onReturn,
  onPlayAgain,
}) => {
  const [showLog, setShowLog] = useState(false)
  const config = WINNER_DISPLAY[winningTeam]

  const hasGameLog = gameLog && gameLog.length > 0

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="mb-2 text-center text-2xl font-bold">Kết thúc game</div>
      <div className="mb-2 flex items-center justify-center gap-2 text-lg">
        <span className="text-3xl">{config.emoji}</span>
        <span className="font-bold text-yellow-400">{config.name}</span>
        <span className="text-3xl">{config.emoji}</span>
      </div>
      <div className="w-full">
        <div className="mb-1 font-semibold">Người chơi</div>
        <ul className="divide-y divide-zinc-700">
          {players.map((p: Player) => (
            <li key={p.id} className="flex justify-between py-1">
              <span>
                <span className={p.id === currentPlayerId ? 'font-bold text-yellow-400' : ''}>
                  {p.username}
                </span>{' '}
                <span className="text-xs text-zinc-400">
                  ({LIST_ROLE.find((r) => r.id === p.role)?.name})
                </span>
              </span>
              <span className={p.alive ? 'text-green-400' : 'text-red-400'}>
                {p.alive ? 'Sống' : 'Chết'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {hasGameLog && (
        <div className="w-full">
          <button
            className="mb-2 flex w-full items-center justify-between rounded-lg bg-zinc-800 px-3 py-2 text-left transition-colors hover:bg-zinc-700"
            onClick={() => setShowLog(!showLog)}
          >
            <span className="font-semibold text-yellow-400">Diễn biến trận đấu</span>
            <span className="text-xs text-zinc-400">
              {showLog ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
            </span>
          </button>
          {showLog && <NarrativeLog entries={gameLog} />}
        </div>
      )}

      <div className="mt-4 flex w-full gap-4">
        <button
          className="flex-1 rounded-xl bg-zinc-700 py-2 text-white"
          onClick={onReturn}
        >
          Về trang chủ
        </button>
        <button
          className="flex-1 rounded-xl bg-yellow-400 py-2 font-semibold text-black"
          onClick={onPlayAgain}
        >
          Chơi lại
        </button>
      </div>
    </div>
  )
}

export default GameEnd
