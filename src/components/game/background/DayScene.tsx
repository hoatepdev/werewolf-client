'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const DayScene = () => {
  return (
    <motion.div
      key="day-scene"
      className="absolute inset-0 bg-blue-300 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'brightness(0.5)' }}
      transition={{ 
        duration: 2, 
        ease: 'easeInOut' 
      }}
      style={{ willChange: 'opacity, transform, filter' }} // GPU boost
    >
      {/* TODO: Add day background image */}
      {/* <img src="/assets/bg/day.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Day Background" /> */}
      
      {/* Ambient lighting/Sun effect */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-[100px] opacity-60"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity' }}
      />
    </motion.div>
  );
};
