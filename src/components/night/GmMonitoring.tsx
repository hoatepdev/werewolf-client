// TODO: remove this component if not used
import React from 'react'
import { useRoomStore } from '@/hook/useRoomStore'

const GmMonitoring: React.FC = () => {
  const { gmUpdates, isGm } = useRoomStore()

  if (!isGm) {
    return null
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'nightStart':
        return '🌙'
      case 'werewolf':
        return '🐺'
      case 'seer':
        return '🔮'
      case 'witch':
        return '🧙‍♀️'
      case 'bodyguard':
        return '🛡️'
      case 'hunter':
        return '🏹'
      case 'nightEnd':
        return '🌅'
      case 'dayStart':
        return '☀️'
      case 'voting':
        return '🗳️'
      case 'votingResult':
        return '📊'
      case 'gameEnded':
        return '🏁'
      default:
        return '📋'
    }
  }

  const getStepColor = (step: string) => {
    switch (step) {
      case 'nightStart':
      case 'nightEnd':
        return 'text-blue-400'
      case 'werewolf':
        return 'text-red-400'
      case 'seer':
        return 'text-blue-400'
      case 'witch':
        return 'text-purple-400'
      case 'bodyguard':
        return 'text-green-400'
      case 'hunter':
        return 'text-orange-400'
      case 'dayStart':
        return 'text-yellow-400'
      case 'voting':
      case 'votingResult':
        return 'text-orange-400'
      case 'gameEnded':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const isNightActionData = (
    data: unknown,
  ): data is {
    action: string
    playerName?: string
    targetName?: string
  } => {
    return typeof data === 'object' && data !== null && 'action' in data
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-lg bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-bold text-purple-400">
          👑 GM Monitoring - Night Phase
        </h2>

        <div className="max-h-96 space-y-3 overflow-y-auto">
          {gmUpdates.length === 0 ? (
            <p className="text-sm text-gray-400">No updates yet...</p>
          ) : (
            gmUpdates.map((update, index) => (
              <div
                key={index}
                className="rounded border-l-4 border-purple-500 bg-gray-800 p-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <span className="text-lg">{getStepIcon(update.step)}</span>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${getStepColor(update.step)}`}
                      >
                        {update.message}
                      </p>
                      {update.data && isNightActionData(update.data) && (
                        <div className="mt-1 text-xs text-gray-400">
                          <span className="mr-2">
                            Action: {update.data.action}
                          </span>
                          {update.data.playerName && (
                            <span className="mr-2">
                              Player: {update.data.playerName}
                            </span>
                          )}
                          {update.data.targetName && (
                            <span>Target: {update.data.targetName}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-2 text-xs text-gray-500">
                    {formatTimestamp(update.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default GmMonitoring
