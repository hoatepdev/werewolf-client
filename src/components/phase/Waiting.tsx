import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const Waiting = () => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
      className="absolute inset-0 z-20 flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-zinc-900 select-none"
    >
      <Image
        src="/images/phase/night.jpg"
        alt="Đang chờ"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </motion.div>
  )
}

export default Waiting
