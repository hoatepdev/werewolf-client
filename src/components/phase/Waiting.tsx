import { motion } from 'framer-motion'
import Image from 'next/image'
import React from 'react'

const Waiting = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeInOut', delay: 1.5 }}
      className="absolute inset-0 z-10 flex h-full w-full flex-1 flex-col items-center justify-center overflow-hidden bg-zinc-900 object-cover select-none"
    >
      <Image
        src="/images/logo/logo.png"
        alt="Waiting"
        width={200}
        height={200}
      />
    </motion.div>
  )
}

export default Waiting
