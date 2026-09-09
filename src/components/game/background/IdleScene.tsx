'use client'

import { motion } from 'framer-motion'

export const IdleScene = () => (
  <motion.div
    key="idle-scene"
    className="absolute inset-0 bg-zinc-950"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
  />
)
