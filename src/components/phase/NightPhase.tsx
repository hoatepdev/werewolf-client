import React from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import WerewolfAction from '../night/WerewolfAction'
import SeerAction from '../night/SeerAction'
import WitchAction from '../night/WitchAction'
import BodyguardAction from '../night/BodyguardAction'
import HunterAction from '../night/HunterAction'

interface NightPhaseProps {
  roomCode: string
}

const NightPhase: React.FC<NightPhaseProps> = ({ roomCode }) => {
  const {
    phase,
    role,
    alive,

    nightPrompt,
    nightResult,
    isGm,
  } = useRoomStore()

  if (phase !== 'night') {
    return null
  }

  const renderRoleAction = () => {
    if (!alive || !role) return null
    const roleAction = {
      werewolf: <WerewolfAction roomCode={roomCode} />,
      seer: <SeerAction roomCode={roomCode} />,
      witch: <WitchAction roomCode={roomCode} />,
      bodyguard: <BodyguardAction roomCode={roomCode} />,
      hunter: <HunterAction roomCode={roomCode} />,
      villager: null,
    }
    return roleAction[role]
    // || (<div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-lg bg-gray-900 p-6">
    //       <div className="text-center">
    //         <h3 className="text-xl font-bold text-gray-400">🌙 Đêm</h3>
    //         <p className="text-sm text-gray-300">
    //           Hãy nhắm mắt và chờ đợi...
    //         </p>
    //       </div>
    //     </div>
    //   )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Action Message */}
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-lg bg-gray-900 p-4">
          <p className="text-lg font-medium text-gray-300">
            {/* {getActionMessage()} */}
          </p>
        </div>
      </div>

      {/* Role-specific action */}
      {renderRoleAction()}

      {/* Night result */}
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
