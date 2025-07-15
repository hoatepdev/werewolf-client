import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'

const PhaseTransitionImage = ({
  image,
  duration = 1500,
  bgColor,
}: {
  image: string
  duration?: number
  bgColor: string
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [])
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: 'easeInOut', delay: 0.2 },
          }}
          exit={{
            opacity: 0,
            x: 100,
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
          className={`absolute inset-0 z-10 flex h-full w-full flex-1 items-center justify-center ${bgColor} object-cover select-none`}
        >
          <img src={image} alt={image} className="h-auto w-full object-cover" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionImage
