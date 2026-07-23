# Werewolf Client

A modern, responsive web PWA client for the Ma Sói game, built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Features

- Join or create game rooms for Ma Sói
- Real-time gameplay via WebSocket (Socket.IO)
- Avatar selection and player management
- Progressive Web App (PWA) with offline support
- Modern UI/UX with Tailwind CSS and Radix UI
- Vietnamese language support
- Persisted game state with Zustand
- Reconnect support via persistent player ID

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
# Production example:
# NEXT_PUBLIC_SOCKET_URL=https://your-server-domain.com

# Firebase web config (public) + VAPID key for Cloud Messaging
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

## Architecture

### State Management (Zustand)

Two stores are used:

#### `useRoomStore` (`src/hook/useRoomStore.ts`) — Persisted to `localStorage`

Holds all game state for the current player:

| Field                 | Type                  | Persisted | Description                       |
| --------------------- | --------------------- | --------- | --------------------------------- |
| `roomCode`            | `string`              | ✅        | Current room code                 |
| `playerId`            | `string`              | ✅        | Current socket ID                 |
| `persistentPlayerId`  | `string`              | ✅        | UUID across reconnects            |
| `role`                | `Role \| null`        | ✅        | Assigned role                     |
| `phase`               | `Phase`               | ✅        | Current game phase                |
| `username`            | `string`              | ✅        | Player display name               |
| `avatarKey`           | `number`              | ✅        | Avatar index                      |
| `approvedPlayers`     | `Player[]`            | ✅        | All players in room               |
| `alive`               | `boolean \| null`     | ✅        | Player alive status               |
| `rehydrated`          | `boolean`             | ❌        | `localStorage` load complete flag |
| `socket`              | `Socket \| null`      | ❌        | Socket.IO instance                |
| `nightPrompt`         | `NightPrompt \| null` | ❌        | Current night action prompt       |
| `nightResult`         | `NightResult \| null` | ❌        | Night resolution result           |
| `hunterDeathShooting` | `boolean`             | ❌        | Hunter targeting after death      |

#### `useGameStore` (`src/store/game/gameStore.ts`) — Non-persisted

Client-only UI phase state:

| Field                                         | Description                                                       |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `currentPhase`                                | `'IDLE' \| 'day' \| 'night' \| 'voting' \| 'conclude' \| 'ended'` |
| `isTransitioning`                             | Animation transition in progress                                  |
| `setPhase()`                                  | Debounced 100ms to prevent race conditions                        |
| `startDay()`, `startNight()`, `startVoting()` | Shortcut setters                                                  |

`'IDLE'` is a client-only initial state before the game starts, does not exist on the server.

### Socket.IO Integration

- `src/lib/socket.ts` — Singleton Socket.IO client, `autoConnect: false`
- Connects manually when entering a room
- Reconnect via `rq_player:rejoinRoom` using `persistentPlayerId`

### Component Structure

```
src/components/
├── ui/              # Base components (shadcn/ui pattern: Radix UI + cn())
├── actions/         # Role-specific night action components
├── phase/           # Phase-specific UI (Night, Day, Voting, results)
└── game/            # Shared game components
```

### Socket Events (Client → Server)

| Event                         | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `rq_gm:createRoom`            | Create new game room                             |
| `rq_gm:connectGmRoom`         | GM connects to private GM room for notifications |
| `rq_gm:approvePlayer`         | Approve waiting player                           |
| `rq_gm:rejectPlayer`          | Reject waiting player                            |
| `rq_gm:getPlayers`            | Fetch current player list                        |
| `rq_gm:randomizeRole`         | Randomize and assign roles                       |
| `rq_player:joinRoom`          | Player joins by room code                        |
| `rq_player:rejoinRoom`        | Reconnect using persistentPlayerId               |
| `rq_player:ready`             | Toggle ready status                              |
| `rq_player:updateInfo`        | Update name/avatar                               |
| `game:vote`                   | Cast vote during voting phase                    |
| `night:werewolf-action:done`  | Werewolf target selection                        |
| `night:seer-action:done`      | Seer investigation result                        |
| `night:witch-action:done`     | Witch heal/poison choice                         |
| `night:bodyguard-action:done` | Bodyguard protection target                      |

### Socket Events (Server → Client)

| Event                     | Description                                             |
| ------------------------- | ------------------------------------------------------- |
| `room:updatePlayers`      | Player list updated                                     |
| `room:playerDisconnected` | A player lost connection                                |
| `player:approved`         | This player was approved by GM                          |
| `player:rejected`         | This player was rejected by GM                          |
| `player:rejoined`         | Reconnect successful (new socket ID)                    |
| `game:phaseChanged`       | Phase transition (`phase: string`)                      |
| `game:nightResult`        | Night resolution (`diedPlayerIds`, `deaths`)            |
| `game:hunterShoot`        | Hunter must choose a target                             |
| `game:hunterShot`         | Hunter fired (target announced)                         |
| `game:gameEnded`          | Game over (`winner`, `players`, `gameLog`)              |
| `game:timerStart`         | Countdown started (`context`, `durationMs`, `deadline`) |
| `game:timerStop`          | Countdown stopped                                       |
| `game:timerSync`          | Timer sync on reconnect                                 |
| `night:seer-result`       | Seer result — private, only to seer socket              |
| `night:action-timeout`    | Player timed out on night action                        |
| `votingResult`            | Voting resolved (`eliminatedPlayerId`, `cause`)         |
| `gm:nightAction`          | GM-only: night step updates                             |
| `gm:votingAction`         | GM-only: voting updates                                 |
| `gm:gameEnded`            | GM-only: game ended summary                             |
| `gm:hunterAction`         | GM-only: hunter triggered                               |
| `gm:connected`            | GM successfully joined GM room                          |

## Project Structure

- `src/app/` - Main app pages and layout
  - `page.tsx` - Home page (entry point)
  - `layout.tsx` - App layout
  - `create-room/`, `join-room/`, `approve-room/`, `gm-room/`, `lobby/`, `room/` - Game flows
- `src/components/` - Reusable UI components
- `src/lib/` - Socket.IO singleton
- `src/hook/` - Zustand stores
- `src/store/game/` - Non-persisted game UI store
- `src/types/` - TypeScript types
- `src/constants/` - Role definitions, constants
- `src/helpers/` - Utility functions
- `public/` - Static assets (images, icons)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Scripts

- `dev`: Start development server (port 4000)
- `build`: Build for production (includes service worker)
- `start`: Start production server
- `lint`: Lint code with ESLint
- `format`: Format code with Prettier + Tailwind plugin

## PWA Configuration

Service worker is configured via `next-pwa` in `next.config.js`. For production:

- Service worker is automatically generated during build
- Caches static assets for offline access
- Requires HTTPS (or localhost) to work properly

## Technologies

- [Next.js](https://nextjs.org/) (v15) — App Router
- [React](https://react.dev/) (v19)
- [Tailwind CSS](https://tailwindcss.com/) (v4)
- [Socket.IO Client](https://socket.io/)
- [Radix UI](https://www.radix-ui.com/) — Headless components
- [Zustand](https://zustand-demo.pmnd.rs/) — State management
- [next-pwa](https://github.com/shadowwalker/next-pwa) — PWA support

## Troubleshooting

### Socket connection issues

- Verify `NEXT_PUBLIC_SOCKET_URL` is correct
- Check that server is running on expected port
- Browser console will show connection errors

### State persistence issues

- Zustand state is persisted in localStorage
- Clear browser data to reset stored state
- `rehydrated` flag gates rendering until localStorage is loaded

### Push notifications not arriving

- Verify Firebase web env values and `NEXT_PUBLIC_FIREBASE_VAPID_KEY` are set before running `npm run build` or `npm run start:dev`
- `public/sw.js` is generated from `public/sw.template.js` by `scripts/build-sw.js`
- The server must be configured with Firebase Admin credentials and users must grant notification permission in the player/GM room

### PWA not updating

- Service worker may cache old content
- Use "Update on reload" in DevTools Application tab during development

## License

This project is private. All rights reserved.
