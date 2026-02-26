import { create } from 'zustand';

// Align with server Phase type: 'night' | 'day' | 'voting' | 'conclude' | 'ended'
// 'IDLE' is client-only initial state
export type GamePhase = 'IDLE' | 'day' | 'night' | 'voting' | 'conclude' | 'ended';

interface GameState {
  currentPhase: GamePhase;
  isTransitioning: boolean;
  setPhase: (phase: GamePhase) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  // Các hàm tiện ích hỗ trợ trigger phase nhanh gọn
  startDay: () => void;
  startNight: () => void;
  startVoting: () => void;
}

export const useGameStore = create<GameState>((set, get) => {
  // Track timeout ID to allow cleanup on rapid phase changes
  let phaseTimeout: ReturnType<typeof setTimeout> | null = null;

  return {
    currentPhase: 'IDLE',
    isTransitioning: false,
    setPhase: (phase) => {
      // Clear any pending timeout to prevent race conditions
      if (phaseTimeout !== null) {
        clearTimeout(phaseTimeout);
        phaseTimeout = null;
      }

      set({ isTransitioning: true });

      // setTimeout mô phỏng transition delay (sẽ được handle bằng Animation onComplete sau)
      phaseTimeout = setTimeout(() => {
        set({ currentPhase: phase, isTransitioning: false });
        phaseTimeout = null;
      }, 100);
    },
    setTransitioning: (isTransitioning) => set({ isTransitioning }),
    startDay: () => get().setPhase('day'),
    startNight: () => get().setPhase('night'),
    startVoting: () => get().setPhase('voting'),
  };
});
