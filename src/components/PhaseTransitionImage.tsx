import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

const PhaseTransitionImage = ({
  image,
  duration = 1500,
  bgColor,
}: {
  image: string
  duration?: number
  bgColor?: string
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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 },
          }}
          exit={{
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
          }}
          className={`fixed inset-0 z-50 flex h-screen w-full items-center justify-center ${bgColor} select-none`}
        >
          <Image
            src={image}
            alt={image}
            className="h-full w-full object-cover"
            fill
            priority
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionImage
