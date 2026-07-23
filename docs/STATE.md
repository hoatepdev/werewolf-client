# Project State

## werewolf-client

Last updated: 2026-07-23

## Current State

### Features

- Next.js 15 PWA client for Vietnamese Ma Sói gameplay
- Socket.IO room, GM, player, phase, voting, night-action, and reconnect flows
- Zustand persisted room state plus non-persisted game UI state
- Role UI supports villager, werewolf, seer, witch, hunter, bodyguard, tanner, and Cupid
- Cupid night action UI and lover-linked death handling are present on player views
- Lobby notification control supports room push registration and opt-out
- Six-digit numeric room-code validation and formatted display are used across entry/room pages
- Ready checklist shows role-assignment readiness before game start
- Shared player/GM game HUD and reusable game-history log components are available
- PWA branding/assets now use Ma Sói naming

### Recent Changes

- Added Cupid role metadata, image, night action component, and lover-linked result handling
- Added room push opt-out state and notification controls
- Enforced six-digit numeric room-code entry, normalization, and display formatting
- Added player ready checklist after role assignment
- Added shared game HUD components for player and GM views
- Added controlled GM tools UI for reset, eliminate, revive, and voting progress flows
- Extracted reusable game history log rendering
- Redesigned guide page content and updated Ma Sói branding/assets

### Technical Debt

- Client still has no automated test suite
- Some large room and GM pages remain high-coupling integration points
- Binary PWA/icon changes require manual visual review

### Known Issues

- None critical in tracked state; generated `.next.bak-*` output is ignored and should not be committed
