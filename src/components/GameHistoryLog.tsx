'use client'

import { useState } from 'react'
import type {
  GameEndLogEntry,
  GameLogEntry,
  HunterShotLogEntry,
  NightLogEntry,
  VotingLogEntry,
} from '@/types/game-log'

const WINNER_DISPLAY: Record<
  'villagers' | 'werewolves' | 'tanner',
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
  lover: 'chết theo người yêu',
  tie: 'Hòa phiếu — không ai bị loại',
  no_votes: 'Không ai bỏ phiếu',
}

interface GameHistoryLogProps {
  gameLog?: GameLogEntry[]
  title?: string
  initiallyExpanded?: boolean
  compact?: boolean
  showEmptyState?: boolean
  revealDetails?: boolean
}

function NightLogEntryView({
  entry,
  revealDetails,
}: {
  entry: NightLogEntry
  revealDetails: boolean
}) {
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
        {revealDetails && (
          <>
            <li className="flex items-start gap-2">
              <span className="text-red-400">🐺</span>
              <span>
                Sói tấn công:{' '}
                <span className="font-semibold">{werewolfTarget ?? 'Không ai'}</span>
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
                  Tiên tri xem <span className="font-semibold">{seerTarget}</span> →{' '}
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
                  Được cứu:{' '}
                  <span className="font-semibold text-green-400">
                    {saved.join(', ')}
                  </span>
                </span>
              </li>
            )}
          </>
        )}
        {deaths.length > 0 ? (
          <li className="flex items-start gap-2">
            <span className="text-red-500">💀</span>
            <span>
              Kết quả:{' '}
              {deaths.map((d, index) => (
                <span key={`${d.username}-${index}`} className="text-red-400">
                  <span className="font-semibold">{d.username}</span>{' '}
                  {getDeathCauseText(d.cause)}
                  {index < deaths.length - 1 ? ', ' : ''}
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

function NarrativeLog({
  entries,
  revealDetails,
}: {
  entries: GameLogEntry[]
  revealDetails: boolean
}) {
  const groupedByRound = entries.reduce(
    (acc, entry) => {
      const round = entry.round
      if (!acc[round]) {
        acc[round] = []
      }
      acc[round].push(entry)
      return acc
    },
    {} as Record<number, GameLogEntry[]>,
  )

  const rounds = Object.keys(groupedByRound)
    .map(Number)
    .sort((a, b) => a - b)

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
                  return (
                    <NightLogEntryView
                      key={idx}
                      entry={entry}
                      revealDetails={revealDetails}
                    />
                  )
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

export default function GameHistoryLog({
  gameLog = [],
  title = 'Lịch sử ván',
  initiallyExpanded = false,
  compact = false,
  showEmptyState = false,
  revealDetails = false,
}: GameHistoryLogProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const hasGameLog = gameLog.length > 0

  if (!hasGameLog && !showEmptyState) return null

  return (
    <div
      className={
        compact
          ? 'w-full rounded-2xl border border-zinc-800 bg-zinc-950/85 p-3 shadow-xl backdrop-blur-md'
          : 'w-full'
      }
    >
      <button
        className="flex w-full items-center justify-between rounded-lg bg-zinc-800 px-3 py-2 text-left transition-colors hover:bg-zinc-700"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-semibold text-yellow-400">{title}</span>
        <span className="text-xs text-zinc-400">
          {expanded ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
        </span>
      </button>
      {!hasGameLog && expanded && (
        <p className="mt-3 rounded-lg border border-dashed border-zinc-700 px-3 py-4 text-sm text-zinc-400">
          Lịch sử ván sẽ xuất hiện sau kết quả ban đêm, bỏ phiếu và sự kiện công khai.
        </p>
      )}
      {hasGameLog && expanded && (
        <NarrativeLog entries={gameLog} revealDetails={revealDetails} />
      )}
    </div>
  )
}
