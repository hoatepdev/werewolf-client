import React from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import WerewolfAction from '../actions/WerewolfAction'
import SeerAction from '../actions/SeerAction'
import WitchAction from '../actions/WitchAction'
import BodyguardAction from '../actions/BodyguardAction'

interface NightPhaseProps {
  roomCode: string
}

const NightPhase: React.FC<NightPhaseProps> = ({ roomCode }) => {
  const { phase, role, nightPrompt, nightResult } = useRoomStore()

  if (phase !== 'night') {
    return null
  }

  const renderRoleAction = () => {
    if (!role) return null
    const roleAction = {
      werewolf: <WerewolfAction roomCode={roomCode} />,
      seer: <SeerAction roomCode={roomCode} />,
      witch: <WitchAction roomCode={roomCode} />,
      bodyguard: <BodyguardAction roomCode={roomCode} />,
      hunter: null,
      villager: null,
    }
    return roleAction[role] || null
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {renderRoleAction()}

      {nightResult && (
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-lg bg-gray-900 p-4">
            <h3 className="mb-2 text-lg font-bold text-red-400">
              🌙 Kết quả đêm
            </h3>
            {nightResult.diedPlayerIds.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-300">
                  Người chết: {nightResult.diedPlayerIds.length}
                </p>
                <p className="text-sm text-gray-300">
                  Nguyên nhân: {nightResult.cause}
                </p>
              </div>
            ) : (
              <p className="text-sm text-green-400">Không ai chết trong đêm</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NightPhase
