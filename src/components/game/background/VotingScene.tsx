'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const VotingScene = () => {
  return (
    <motion.div
      key="voting-scene"
      className="absolute inset-0 bg-red-950 overflow-hidden flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{ willChange: "transform, opacity" }}
    >
      {/* Dark Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.8)' }} />

      {/* Firelight Flicker Effect (Voting tension) */}
      <motion.div
        className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-orange-600 rounded-full blur-[120px] mix-blend-screen"
        animate={{ 
          opacity: [0.3, 0.6, 0.2, 0.7, 0.4],
          scale: [1, 1.05, 0.95, 1.1, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          repeatType: "mirror",
          ease: "easeInOut" 
        }}
        style={{ willChange: "opacity, transform" }}
      />
    </motion.div>
  );
};
