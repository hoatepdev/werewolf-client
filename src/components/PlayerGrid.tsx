"use client";

import React from "react";
import { Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { renderAvatar } from "@/helpers";

interface PlayerGridProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerGrid({ players, currentPlayerId }: PlayerGridProps) {
  const maxPlayers = 9;
  const emptySlots = maxPlayers - players.length;

  const truncateName = (name: string, maxLength: number = 12) => {
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  };

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-3">
      {players.map((player) => (
        <Card
          key={player.id}
          className={`relative overflow-hidden transition-all duration-200 ${
            player.id.toString() === currentPlayerId
              ? "bg-zinc-700/50 ring-2 ring-yellow-400"
              : "bg-zinc-800"
          } ${!player.alive ? "opacity-50" : ""}`}
        >
          <CardContent className="flex flex-col items-center p-3">
            <div
              className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                player.id.toString() === currentPlayerId
                  ? "bg-yellow-400 text-black"
                  : "bg-zinc-600 text-white"
              }`}
            >
              {renderAvatar(player)}
            </div>
            <div className="text-center">
              <div className="w-full truncate text-sm font-medium text-white">
                {truncateName(player.username)}
              </div>
              {!player.alive && (
                <div className="mt-1 text-xs text-red-400">Dead</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {Array.from({ length: emptySlots }).map((_, index) => (
        <Card
          key={`empty-${index}`}
          className="border-dashed border-zinc-600 bg-zinc-800/50"
        >
          <CardContent className="flex flex-col items-center p-3">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg text-zinc-500">
              ?
            </div>
            <div className="text-center">
              <div className="text-sm text-zinc-500">Empty</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
