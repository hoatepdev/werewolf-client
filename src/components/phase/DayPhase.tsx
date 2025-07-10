import { NightResult } from '@/hook/useRoomStore'
import React from 'react'

interface DayPhaseProps {
  nightResult: NightResult | null
}

const DayPhase: React.FC<DayPhaseProps> = ({ nightResult }) => {
  console.log('⭐ nightResult', nightResult)
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <div className="text-center text-lg font-bold">Day Phase</div>
      <div className="text-center text-zinc-300">
        {/* {nightResult.diedPlayerIds.map((item) => (
            <div key={item}>{item}</div>
          ))} */}
      </div>
    </div>
  )
}

export default DayPhase
