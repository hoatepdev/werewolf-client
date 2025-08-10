# Masoi Client

A modern, responsive web client for the 5Star Werewolf (Ma Sói) game, built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/).

## Features

- Join or create game rooms for 5Star Werewolf
- Real-time gameplay via WebSocket (Socket.IO)
- Avatar selection and player management
- Modern UI/UX with Tailwind CSS and Radix UI
- Vietnamese language support

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

- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Lint code
- `format`: Format code with Prettier

## Technologies

- [Next.js](https://nextjs.org/) (v15)
- [React](https://react.dev/) (v19)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO Client](https://socket.io/)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

## License

This project is private. All rights reserved.
