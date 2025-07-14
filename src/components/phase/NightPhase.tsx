import React from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import WerewolfAction from '../actions/WerewolfAction'
import SeerAction from '../actions/SeerAction'
import WitchAction from '../actions/WitchAction'
import BodyguardAction from '../actions/BodyguardAction'
import PhaseTransitionImage from '../PhaseTransitionImage'
import HunterAction from '../actions/HunterAction'

interface NightPhaseProps {
  roomCode: string
}

const NightPhase: React.FC<NightPhaseProps> = ({ roomCode }) => {
  const { phase, role } = useRoomStore()

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
      hunter: <HunterAction roomCode={roomCode} />,
      villager: null,
    }
    return roleAction[role] || null
  }

  return (
    <div className="relative h-full w-full flex-1">
      <PhaseTransitionImage
        image="/images/phase/night.gif"
        bgColor="bg-[#2E3A62]"
      />
      {renderRoleAction()}
    </div>
  )
}

export default NightPhase
