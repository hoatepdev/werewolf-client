'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const IdleScene = () => {
  return (
    <motion.div
      key="idle-scene"
      className="absolute inset-0 bg-slate-950 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      style={{ willChange: 'opacity' }}
    >
      {/* Subtle ambient gradient */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.5) 0%, rgba(2, 6, 23, 1) 100%)',
        }}
      />
    </motion.div>
  );
};
