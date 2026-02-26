import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { phaseVariants } from '@/lib/motion'

interface PhaseTransitionProps {
  phase: string
  children: ReactNode
}

const PhaseTransition: React.FC<PhaseTransitionProps> = ({
  phase,
  children,
}) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={phase}
      variants={phaseVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full w-full flex-1 flex-col"
    >
      {children}
    </motion.div>
  </AnimatePresence>
)

export default PhaseTransition
