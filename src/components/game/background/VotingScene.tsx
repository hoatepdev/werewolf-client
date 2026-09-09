'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export const VotingScene = () => (
  <motion.div
    key="voting-scene"
    className="pointer-events-none absolute inset-0 overflow-hidden bg-zinc-950"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Image
      src="/images/phase/voting.jpg"
      alt=""
      aria-hidden="true"
      fill
      sizes="100vw"
      className="object-cover opacity-35"
    />
    <div className="absolute inset-0 bg-red-950/55" />
  </motion.div>
)
