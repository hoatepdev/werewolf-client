import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.4 }}
      className="flex h-full w-full flex-1 flex-col"
    >
      {children}
    </motion.div>
  </AnimatePresence>
)

export default PhaseTransition
