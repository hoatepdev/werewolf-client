import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Role } from '@/types/role'
import { motion, AnimatePresence } from 'framer-motion'
import { LIST_ROLE } from '@/constants/role'
import Image from 'next/image'
import { Loader2Icon } from 'lucide-react'

interface RoleRandomizerModalProps {
  assignedRole: Role
  onContinue: () => void
  open: boolean
}

const WHEEL_SIZE = 300
const CENTER = WHEEL_SIZE / 2
const RADIUS = CENTER - 8
const SEGMENTS = LIST_ROLE.length
const ANGLE_PER_SEGMENT = 360 / SEGMENTS

function getSegmentColor(idx: number) {
  // Alternate colors for clarity
  return idx % 2 === 0 ? '#fde047' : '#fbbf24'
}

function getRotationForRole(role: Role) {
  const idx = LIST_ROLE.findIndex((r) => r.id === role.id)
  // The wheel should stop so the selected role is at the top (0deg)
  // SVG 0deg is at 3 o'clock, so rotate so the segment's center is at 270deg
  const segmentCenter = idx * ANGLE_PER_SEGMENT + ANGLE_PER_SEGMENT / 2
  return 360 * 5 - segmentCenter + 270 // 5 full spins for effect
}

export const RoleRandomizerModal = ({
  assignedRole,
  onContinue,
  open,
}: RoleRandomizerModalProps) => {
  const [isSpinning, setIsSpinning] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setIsSpinning(true)
      setRotation(0)
      // Start spin after a short delay for effect
      setTimeout(() => {
        const targetRotation = getRotationForRole(assignedRole)
        setRotation(targetRotation)
        setTimeout(() => {
          setIsSpinning(false)
        }, 5000)
      }, 1000)
    }
  }, [open, assignedRole])

  const handleContinue = () => {
    setIsReady(true)
    onContinue()
  }

  return (
    <Dialog open={open}>
      <DialogContent
        style={{
          border: '1px solid transparent',
        }}
        className="flex items-center justify-center bg-transparent p-0 shadow-none focus:outline-none"
      >
        <DialogTitle className="sr-only">Kết quả vai trò</DialogTitle>
        <div className="flex h-full w-full flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isSpinning ? (
              <div className="relative">
                <div className="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
                  <svg
                    width={WHEEL_SIZE}
                    height={WHEEL_SIZE}
                    viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                  >
                    <path
                      d={`M${CENTER},${CENTER - RADIUS + 130} 
                            Q${CENTER - 16},${
                              CENTER - RADIUS + 156
                            } ${CENTER},${CENTER - RADIUS + 152} 
                            Q${CENTER + 16},${
                              CENTER - RADIUS + 156
                            } ${CENTER},${CENTER - RADIUS + 130} Z`}
                      fill="#222"
                      stroke="#fff"
                      strokeWidth={3}
                    />
                  </svg>
                </div>

                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[320px] flex-col items-center justify-center"
                >
                  <motion.div
                    ref={wheelRef}
                    style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
                    animate={{ rotate: rotation }}
                    transition={{
                      type: 'spring',
                      duration: 3,
                      ease: 'easeInOut',
                    }}
                    className="relative"
                  >
                    <svg
                      width={WHEEL_SIZE}
                      height={WHEEL_SIZE}
                      viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                    >
                      {LIST_ROLE.map((role, idx) => {
                        const startAngle = idx * ANGLE_PER_SEGMENT
                        const endAngle = startAngle + ANGLE_PER_SEGMENT
                        const largeArc = ANGLE_PER_SEGMENT > 180 ? 1 : 0
                        const x1 =
                          CENTER +
                          RADIUS * Math.cos((Math.PI * startAngle) / 180)
                        const y1 =
                          CENTER +
                          RADIUS * Math.sin((Math.PI * startAngle) / 180)
                        const x2 =
                          CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180)
                        const y2 =
                          CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180)
                        // For text rotation
                        const textAngle = startAngle + ANGLE_PER_SEGMENT / 2
                        const textRadius = RADIUS - 60
                        const textX =
                          CENTER +
                          textRadius * Math.cos((Math.PI * textAngle) / 180)
                        const textY =
                          CENTER +
                          textRadius * Math.sin((Math.PI * textAngle) / 180)
                        return (
                          <g key={role.id}>
                            <path
                              d={`M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${x2},${y2} Z`}
                              fill={getSegmentColor(idx)}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                            <text
                              x={textX}
                              y={textY}
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              fontSize="28"
                              fontWeight="bold"
                              fill="#222"
                              transform={`rotate(${
                                -rotation + textAngle
                              }, ${textX}, ${textY})`}
                            >
                              {role.emoji}
                            </text>
                          </g>
                        )
                      })}
                      <g>
                        <circle
                          cx={CENTER}
                          cy={CENTER}
                          r={24}
                          fill="#fff"
                          stroke="#fde047"
                          strokeWidth={6}
                        />
                      </g>
                    </svg>
                  </motion.div>

                  {/* <div className="text-xl font-semibold text-white mb-2 text-center">
                    Đang chọn vai trò của bạn...
                  </div> */}
                </motion.div>
              </div>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[320px] flex-col items-center justify-center gap-6"
              >
                <Image
                  width={192}
                  height={258}
                  src={`/images/role/${assignedRole.id}.png`}
                  alt={assignedRole.name}
                  className="rounded-xl border-4 border-yellow-400 bg-zinc-800 object-contain shadow-lg"
                />
                <div className="text-center text-2xl font-bold text-yellow-400">
                  {assignedRole.name}
                </div>
                <div className="max-w-xs text-center text-base text-zinc-200">
                  {assignedRole.description}
                </div>
                <Button
                  variant="yellow"
                  onClick={handleContinue}
                  disabled={isSpinning || isReady}
                >
                  {isReady ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Waiting for players ready
                    </>
                  ) : (
                    'Ready'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleRandomizerModal
