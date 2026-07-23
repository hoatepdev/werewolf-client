'use client'

import React from 'react'
import { VotingResultSummary } from '@/hook/useRoomStore'

interface VotingResultPhaseProps {
  result: VotingResultSummary | null
}

const getOutcome = (result: VotingResultSummary) => {
  if (result.cause === 'tie') {
    const names = result.tiedPlayers?.map((player) => player.username).join(', ')
    return {
      emoji: '⚖️',
      title: 'Hòa phiếu',
      description: names
        ? `Hòa phiếu giữa ${names}. Không ai bị loại.`
        : 'Hòa phiếu. Không ai bị loại.',
      className: 'text-yellow-300',
    }
  }

  if (result.cause === 'no_votes') {
    return {
      emoji: '🤷',
      title: 'Không có phiếu hợp lệ',
      description: 'Không ai bị loại trong lượt bỏ phiếu này.',
      className: 'text-zinc-300',
    }
  }

  if (result.cause === 'hunter') {
    return {
      emoji: '🎯',
      title: 'Thợ săn bị loại',
      description: `${result.eliminatedPlayerName ?? 'Thợ săn'} bị loại và đang chọn có bắn trả hay không.`,
      className: 'text-red-300',
    }
  }

  return {
    emoji: '💀',
    title: 'Một người bị loại',
    description: `${result.eliminatedPlayerName ?? 'Một người chơi'} bị loại khỏi ván.`,
    className: 'text-red-300',
  }
}

const VotingResultPhase: React.FC<VotingResultPhaseProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6 text-center">
        <h3 className="text-xl font-bold text-yellow-400">🗳️ Kết quả bỏ phiếu</h3>
        <div className="w-full rounded-lg bg-gray-900/80 p-4 text-sm text-gray-300">
          Đang tổng hợp kết quả bỏ phiếu...
        </div>
      </div>
    )
  }

  const outcome = getOutcome(result)
  const targetVoteCount =
    result.targetVoteCount ??
    result.totals.reduce((sum, total) => sum + total.count, 0)
  const timeoutCount =
    result.timeoutCount ??
    result.votes.filter((vote) => vote.kind === 'timeout').length
  const respondedCount = result.respondedCount ?? result.votedCount

  return (
    <div className="relative h-full w-full flex-1">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-6">
        <div className="text-center">
          <div className="text-4xl">{outcome.emoji}</div>
          <h3 className="mt-2 text-xl font-bold text-yellow-400">
            Kết quả bỏ phiếu
          </h3>
          <p className="text-sm text-gray-400">Vòng {result.round}</p>
        </div>

        <div className="w-full rounded-xl border border-yellow-400/30 bg-gray-900/80 p-4 text-center">
          <div className={`text-lg font-bold ${outcome.className}`}>
            {outcome.title}
          </div>
          <p className="mt-2 text-sm text-gray-300">{outcome.description}</p>
        </div>

        {result.additionalDeaths && result.additionalDeaths.length > 0 && (
          <div className="w-full rounded-xl border border-pink-400/30 bg-pink-950/30 p-4">
            <div className="text-lg font-bold text-pink-300">💔 Chết vì tình</div>
            <p className="mt-2 text-sm text-gray-300">
              {result.additionalDeaths
                .map((death) => death.playerName)
                .join(', ')}{' '}
              chết theo người yêu.
            </p>
          </div>
        )}

        <div className="w-full rounded-lg bg-gray-900/80 p-4">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-700 pb-2">
            <span className="font-semibold text-yellow-300">Tổng quan</span>
            <span className="text-sm text-gray-400">
              {respondedCount}/{result.totalVoters} đã phản hồi
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-2xl font-bold text-red-300">{targetVoteCount}</div>
              <div className="text-gray-400">Phiếu chọn người</div>
            </div>
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-2xl font-bold text-zinc-300">
                {result.abstainCount}
              </div>
              <div className="text-gray-400">Phiếu trắng</div>
            </div>
            <div className="rounded-lg bg-zinc-800 p-3">
              <div className="text-2xl font-bold text-blue-300">{timeoutCount}</div>
              <div className="text-gray-400">Không phản hồi</div>
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg bg-gray-900/80 p-4">
          <div className="mb-3 font-semibold text-yellow-300">Bảng phiếu</div>
          {result.votes.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {result.votes.map((vote) => (
                <li
                  key={vote.voterId}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2"
                >
                  <span className="font-semibold text-gray-200">{vote.voterName}</span>
                  <span className="mx-2 text-zinc-500">→</span>
                  <span
                    className={
                      vote.kind === 'target' || vote.targetName
                        ? 'text-red-300'
                        : vote.kind === 'timeout'
                          ? 'text-blue-300'
                          : 'text-zinc-400'
                    }
                  >
                    {vote.kind === 'timeout'
                      ? 'Không phản hồi'
                      : vote.targetName ?? 'Bỏ phiếu trắng'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-400">
              Không có phiếu nào được ghi nhận.
            </div>
          )}
        </div>

        {result.totals.length > 0 && (
          <div className="w-full rounded-lg bg-gray-900/80 p-4">
            <div className="mb-3 font-semibold text-yellow-300">Tổng phiếu theo người</div>
            <ul className="space-y-2 text-sm">
              {result.totals.map((total) => (
                <li
                  key={total.targetId}
                  className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2"
                >
                  <span className="font-semibold text-gray-200">{total.targetName}</span>
                  <span className="font-bold text-yellow-300">{total.count} phiếu</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          Trò chơi sẽ tự chuyển sang giai đoạn tiếp theo.
        </div>
      </div>
    </div>
  )
}

export default VotingResultPhase
