'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRoomStore } from '@/hook/useRoomStore';
import { DayScene } from './DayScene';
import { NightScene } from './NightScene';
import { VotingScene } from './VotingScene';
import { IdleScene } from './IdleScene';

export const BackgroundEngine = () => {
  const pathname = usePathname();
  const roomCode = useRoomStore((state) => state.roomCode);
  const phase = useRoomStore((state) => state.phase);
  const isGameRoute =
    pathname?.startsWith('/room/') || pathname?.startsWith('/gm-room/');
  const currentPhase = isGameRoute && roomCode ? phase : 'IDLE';
  const [showFlash, setShowFlash] = useState(false);
  const [prevPhase, setPrevPhase] = useState(currentPhase);

  // Trigger Flash Effect khi chuyển từ Đêm sang Ngày
  useEffect(() => {
    if (prevPhase === 'night' && currentPhase === 'day') {
      setShowFlash(true);
      // Xoá flash sau 600ms (dư dả so với animation 400ms)
      const t = setTimeout(() => setShowFlash(false), 600);
      setPrevPhase(currentPhase); // Update prevPhase even when triggering flash
      return () => clearTimeout(t);
    }
    setPrevPhase(currentPhase);
  }, [currentPhase, prevPhase]);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-black overflow-hidden pointer-events-none">
      <AnimatePresence mode="popLayout">
        {currentPhase === 'IDLE' && <IdleScene key="idle" />}
        {currentPhase === 'day' && <DayScene key="day" />}
        {currentPhase === 'night' && <NightScene key="night" />}
        {(currentPhase === 'voting' || currentPhase === 'conclude') && (
          <VotingScene key="voting" />
        )}
        {currentPhase === 'ended' && <IdleScene key="ended" />}
      </AnimatePresence>

      {/* Transition Effect: White Flash (Night -> Day) */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="absolute inset-0 bg-white z-50 mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, times: [0, 0.2, 1], ease: "easeOut" }}
            style={{ willChange: "opacity" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
