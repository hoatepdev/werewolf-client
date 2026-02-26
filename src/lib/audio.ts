import { Howl } from 'howler'

export const SOUND_ENABLED = true // can be toggled via settings store later

// We define a global sprite map for game sounds
// The user should place an 'audio-sprite.mp3' in public/audio/
// Time is in ms [start, duration]
const SPRITE_DATA: Record<string, [number, number]> = {
  night_start: [0, 4000],
  day_start: [4500, 3000],
  wolf_howl: [8000, 2500],
  heartbeat_fast: [11000, 5000],
  click: [17000, 200],
  player_die: [18000, 1500],
  victory: [20000, 5000],
}

let gameAudioSprite: Howl | null = null

export const initAudio = () => {
  if (typeof window === 'undefined') return

  if (!gameAudioSprite) {
    gameAudioSprite = new Howl({
      src: ['/audio/audio-sprite.mp3'], // Ensure to create this logic/file
      sprite: SPRITE_DATA,
      preload: true,
      volume: 0.8,
    })
  }
}

export const playSound = (spriteName: keyof typeof SPRITE_DATA) => {
  if (!SOUND_ENABLED) return
  if (!gameAudioSprite) initAudio()

  if (gameAudioSprite) {
    gameAudioSprite.play(spriteName)
  }
}

// Optional helper for triggering device haptic (vibration)
export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern)
  }
}
