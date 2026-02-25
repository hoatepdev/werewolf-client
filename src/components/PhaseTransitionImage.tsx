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
          initial={{ opacity: 0, x: 0 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, ease: 'easeInOut', delay: 0.2 },
          }}
          exit={{
            opacity: 0,
            x: 0,
            transition: { duration: 0.5, ease: 'easeInOut' },
          }}
          className={`absolute inset-0 z-10 flex h-screen w-full flex-1 items-center justify-center rounded-lg ${bgColor} object-cover select-none`}
        >
          <Image
            src={image}
            alt={image}
            className="h-auto w-full object-cover"
            width={1000}
            height={1000}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PhaseTransitionImage
