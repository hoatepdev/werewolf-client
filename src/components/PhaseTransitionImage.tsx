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
          className={`absolute inset-0 z-10 flex h-screen w-full flex-1 items-center justify-center rounded-lg ${bgColor} object-cover select-none`}
        >
          <Image
            src={image}
            alt={image}
            className="h-auto w-full object-cover"
            width={1000}
            height={1000}
            priority
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionImage
