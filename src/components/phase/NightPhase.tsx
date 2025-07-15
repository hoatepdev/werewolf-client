import React from 'react'
import { useRoomStore } from '@/hook/useRoomStore'
import WerewolfAction from '../actions/WerewolfAction'
import SeerAction from '../actions/SeerAction'
import WitchAction from '../actions/WitchAction'
import BodyguardAction from '../actions/BodyguardAction'
import PhaseTransitionImage from '../PhaseTransitionImage'
import HunterAction from '../actions/HunterAction'
import Waiting from './Waiting'
import { Player } from '@/types/player'

interface NightPhaseProps {
  roomCode: string
}

const NightPhase: React.FC<NightPhaseProps> = ({ roomCode }) => {
  const { role } = useRoomStore()

  function renderRoleAction(role: Player['role'] | null, roomCode: string) {
    switch (role) {
      case 'werewolf':
        return <WerewolfAction roomCode={roomCode} />
      case 'seer':
        return <SeerAction roomCode={roomCode} />
      case 'witch':
        return <WitchAction roomCode={roomCode} />
      case 'bodyguard':
        return <BodyguardAction roomCode={roomCode} />
      case 'hunter':
        return <HunterAction roomCode={roomCode} />
      case 'villager':
        return <Waiting />
      default:
        return null
    }
  }

  return (
    <div className="relative h-full w-full flex-1">
      <PhaseTransitionImage
        image="/images/phase/night.gif"
        bgColor="bg-[#2E3A62]"
      />
      {renderRoleAction(role, roomCode)}
    </div>
  )
}

export default NightPhase
