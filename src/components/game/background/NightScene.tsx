'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export const NightScene = () => (
  <motion.div
    key="night-scene"
    className="absolute inset-0 overflow-hidden bg-zinc-950"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Image
      src="/images/phase/night.jpg"
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="object-cover opacity-40"
    />
    <div className="absolute inset-0 bg-slate-950/55" />
  </motion.div>
)
