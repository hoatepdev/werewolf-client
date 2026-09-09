'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export const DayScene = () => (
  <motion.div
    key="day-scene"
    className="absolute inset-0 overflow-hidden bg-zinc-900"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Image
      src="/images/phase/day.jpg"
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="object-cover opacity-35"
    />
    <div className="absolute inset-0 bg-zinc-950/45" />
  </motion.div>
)
