# Project State

## werewolf-client

Last updated: 2025-01-21

## Current State

### Features
- Next.js 15 PWA with React 19 and TypeScript
- Socket.IO real-time communication with game server
- Zustand state management with persistent storage
- Tailwind CSS 4 with dark theme
- Firebase Cloud Messaging (FCM) push notifications
- Role-based game UI (villager, werewolf, seer, witch, hunter, bodyguard, tanner)
- Phase-based UI (night, day, voting, conclude)
- QR code generation and scanning for room joining
- PWA with service worker and offline support
- Audio system with Howler.js
- Animations with Framer Motion
- Toast notifications with Sonner
- Victory celebrations with Canvas Confetti

### Recent Changes
- Added comprehensive voting system with progress tracking and result display
- Enhanced FCM integration with automatic room-based registration
- Added GM reconnection support with persistent IDs and tokens
- Updated session management for better state cleanup
- Downgraded Next.js from 15.3.8 to 15.3.4
- Downgraded next-pwa from ^5.6.0 to ^2.0.2
- Changed linting from `next lint` to `eslint .`

### Technical Debt
- No unit tests configured yet
- Service worker build process needs optimization
- Some components could benefit from further modularization

### Dependencies
- Next.js 15.3.4
- React 19.0.0
- Socket.IO client 4.8.1
- Zustand 5.0.2
- Tailwind CSS 4
- Firebase messaging ^14.2.0 (via server integration)
- Framer Motion ^11.15.0
- Howler.js ^2.2.4
- Canvas Confetti ^1.9.2

### Known Issues
- None critical

### Next Steps
- Add unit testing framework and write tests
- Optimize service worker build and caching strategy
- Consider splitting large components into smaller reusable pieces
