'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const NightScene = () => {
  return (
    <motion.div
      key="night-scene"
      className="absolute inset-0 overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-black"
      initial={{ opacity: 0, filter: 'blur(4px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 2 }}
      style={{ willChange: 'opacity, filter' }}
    >
      {/* TODO: Add actual night image */}
      {/* <img src="/assets/bg/night.jpg" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Night" /> */}

      {/* Fog Overlay (gentle infinite pan) */}
      <motion.div
        className="absolute inset-0 bg-blue-900/20 object-cover mix-blend-screen"
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ willChange: 'transform' }}
      />

      {/* Moon Radial Glow */}
      <motion.div
        className="absolute top-10 right-10 w-48 h-48 rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(circle, rgba(200,220,255,0.8) 0%, rgba(200,220,255,0) 70%)',
          willChange: 'opacity, transform',
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Particle container mockup */}
      <div className="absolute inset-0 pointer-events-none">
        {/* We can add a simple particle system here later using div mapping or a lightweight library */}
      </div>

    </motion.div>
  );
};
