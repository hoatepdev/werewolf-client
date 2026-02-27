# Masoi Client

A modern, responsive web PWA client for the 5Star Werewolf (Ma Sói) game, built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Features

- Join or create game rooms for 5Star Werewolf
- Real-time gameplay via WebSocket (Socket.IO)
- Avatar selection and player management
- Progressive Web App (PWA) with offline support
- Modern UI/UX with Tailwind CSS and Radix UI
- Vietnamese language support
- Persisted game state with Zustand

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:4001
# Production example:
# NEXT_PUBLIC_SOCKET_URL=https://your-server-domain.com
```

## Architecture

### State Management (Zustand)
- `src/hook/useRoomStore.ts` — Persisted store holding:
  - `roomCode`, `playerId`, `role`
  - `phase`, `players`, `isAlive`
  - GM-specific state

### Socket.IO Integration
- `src/lib/socket.ts` — Singleton Socket.IO client
- Auto-reconnect on connection loss
- Event listeners for real-time game updates

### Component Structure
```
src/components/
├── ui/              # Base components (shadcn/ui pattern)
├── actions/         # Role-specific action components
├── phase/           # Phase-specific UI components
└── game/            # Game-related shared components
```

### Socket Events (Client → Server)
- `rq_gm:createRoom` — Create new game room
- `rq_gm:joinRoom` — GM joins room
- `rq_player:joinRoom` — Player joins room
- `rq_player:ready` — Player marks ready
- `night:werewolf-action:done` — Werewolf target selection
- `night:seer-action:done` — Seer investigation
- `night:witch-action:done` — Witch heal/poison
- `game:vote` — Day voting

### Socket Events (Server → Client)
- `game:stateUpdated` — Game state change
- `game:phaseChanged` — Phase transition
- `game:playerJoined` — New player joined
- `game:playerLeft` — Player disconnected
- `game:roleRevealed` — Role assignment (night only)

## Project Structure

- `src/app/` - Main app pages and layout
  - `page.tsx` - Home page (entry point)
  - `layout.tsx` - App layout
  - `create-room/`, `join-room/`, `approve-room/`, `gm-room/`, `lobby/`, `room/` - Game flows
- `src/components/` - Reusable UI components
- `src/lib/`, `src/hook/`, `src/types/`, `src/constants/`, `src/helpers/` - Utilities and logic
- `public/` - Static assets (images, icons)

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

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

### PWA not updating
- Service worker may cache old content
- Use "Update on reload" in DevTools Application tab during development

## License

This project is private. All rights reserved.
