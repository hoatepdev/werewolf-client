import { Variants, Easing, Transition } from 'framer-motion'

// --- EASINGS ---
// Standard iOS-like spring for UI micro-interactions (buttons, cards)
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1,
}

// Smooth slow easing for full screen phases (Night / Day transitions)
export const slowEaseOut: Easing = [0.2, 0.8, 0.2, 1]

// Anticipate easing for "hero elements" like revealing a role
export const anticipateEase: Easing = [0.4, -0.3, 0.6, 1.3]

// --- VARIANTS ---

// 1. Phasing transition variants (For changing day/night layers)
export const phaseVariants: Variants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: slowEaseOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.8, ease: slowEaseOut },
  },
}

// 2. Micro-interactions variants (Hover & Tap)
export const hoverTapVariants = {
  hover: { scale: 1.02, transition: springTransition },
  tap: { scale: 0.95, transition: springTransition },
}

// 3. Stagger children for grid of avatars (PlayerGrid)
export const staggerContainerVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const staggerItemVars: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: springTransition },
}
