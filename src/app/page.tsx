"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hook/useDebounce";
import { useRoomStore } from "./useRoomStore";

export default function Home() {
  const router = useRouter();
  const username = useRoomStore((state) => state.username);
  const rehydrated = useRoomStore((state) => state.rehydrated);
  const setUsername = useRoomStore((state) => state.setUsername);

  useEffect(() => {
    if (rehydrated && username === "") {
      const randomUsername = Math.floor(Math.random() * 1000);
      setUsername(`Dân ngu ${randomUsername}`);
    }
  }, [rehydrated]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex flex-col px-4 pt-6 pb-4 max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👤</span>
          <div className="flex flex-col leading-tight">
            <span className="text-sm text-zinc-300">Hello</span>
            <span className="text-lg font-bold text-yellow-400">
              <input
                type="text"
                defaultValue={username}
                onChange={useDebounce(handleUsernameChange, 500)}
              />
            </span>
          </div>
        </div>
      </header>

      {/* Center Content */}
      <section className="flex flex-col items-center flex-1 justify-center">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-5xl">🐺</span>
            <span className="text-4xl font-extrabold text-white tracking-tight">
              Wolves Ville
            </span>
            <span className="ml-2 px-2 py-1 rounded bg-yellow-400 text-xs font-bold text-zinc-900 align-top">
              OFFLINE
            </span>
          </div>
          <p className="text-zinc-300 text-center text-base mt-2 max-w-xs">
            Choose your game mode
            <br />
            <span className="text-xs text-zinc-400">
              (Please note: This game requires stable Internet connection to
              operate normally.)
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            className="w-full py-3 rounded-xl bg-yellow-400 text-zinc-900 text-lg font-bold shadow hover:bg-yellow-300 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
            onClick={() => router.push("/create-room")}
            type="button"
          >
            GAME MASTER MODE
          </button>
          <button
            className="w-full py-3 rounded-xl bg-zinc-700 text-white text-lg font-bold shadow hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
            onClick={() => router.push("/join-room")}
            type="button"
          >
            PLAYER MODE
          </button>
        </div>
      </section>

      {/* Bottom Navigation & Version */}
      <footer className="flex flex-col items-center gap-3 pb-6">
        <div className="flex items-center gap-8 mb-2">
          <a
            href="#"
            className="flex flex-col items-center text-zinc-200 text-xs hover:text-yellow-400 transition-colors"
          >
            <span className="text-xl">📖</span>
            Guidebook
          </a>
          <a
            href="#"
            className="flex flex-col items-center text-zinc-200 text-xs hover:text-yellow-400 transition-colors"
          >
            <span className="text-xl">👥</span>
            Terms of usage
          </a>
          <a
            href="#"
            className="flex flex-col items-center text-zinc-200 text-xs hover:text-yellow-400 transition-colors"
          >
            <span className="text-xl">🛡️</span>
            Privacy policy
          </a>
        </div>
        <div className="text-zinc-400 text-xs text-center">
          VERSION 1.0.3
          <br />
          Powered by:{" "}
          <a
            href="https://www.p.hoatepdev.site"
            target="_blank"
            className="text-yellow-400"
          >
            hoatep
          </a>
        </div>
      </footer>
    </main>
  );
}
