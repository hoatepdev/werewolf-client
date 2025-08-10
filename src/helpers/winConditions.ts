import { Player } from '@/types/player'

export type WinCondition = 'villagers' | 'werewolves' | 'tanner' | null

export function checkWinCondition(players: Player[]): WinCondition {
  const alivePlayers = players.filter(p => p.alive)
  const aliveWerewolves = alivePlayers.filter(p => p.role === 'werewolf')
  const aliveNonWerewolves = alivePlayers.filter(p => p.role !== 'werewolf')
  
  // Werewolves win if they equal or outnumber non-werewolves
  if (aliveWerewolves.length >= aliveNonWerewolves.length && aliveWerewolves.length > 0) {
    return 'werewolves'
  }
  
  // Villagers win if all werewolves are eliminated
  if (aliveWerewolves.length === 0) {
    return 'villagers'
  }
  
  // Game continues
  return null
}

export function getWinnerDisplayName(winner: WinCondition): string {
  switch (winner) {
    case 'villagers':
      return 'Dân làng'
    case 'werewolves':
      return 'Sói'
    case 'tanner':
      return 'Chán đời'
    default:
      return ''
  }
}