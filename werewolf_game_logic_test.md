Werewolf (Ma Sói) PWA – Game Logic Testing Prompt
Objective:
Ensure all game logic, role actions, and win conditions work correctly in the PWA with the following roles:
Werewolf, Villager, Seer, Witch, Hunter, Bodyguard, Tanner.

1. Room Creation & Joining
   - Host can create a room successfully → Room Code is displayed.

   - Client can join using a valid Room Code → successfully enters the room.

   - Joining with an invalid Room Code → shows error message.

   - Once all players have joined, the host can Start Game.

2. Role Assignment
   - Each player receives a random role according to the chosen configuration.

   - No role duplication beyond the allowed number.

   - Role is shown only on the player’s own device.

3. Night Phase Logic
   Bodyguard 🛡️
   Can protect 1 player per night.

   Cannot protect the same player two nights in a row.

   Protected player cannot be killed by Werewolves or Witch’s poison that night.

Werewolf 🐺
Can select a target to kill each night.

    If the target is protected by the Bodyguard → target survives.

Seer 🔮
Can check 1 player per night.

    Receives correct result (Werewolf or not).

Witch 🧪
If someone was attacked, can use Healing Potion to save them.

    Can use Poison Potion once per game to kill any player.

    Can choose to heal or poison, or do nothing.

Hunter 🎯
No night action.

    If killed (at night or during the day), can immediately choose 1 player to eliminate.

Tanner 🤡
No night action.

    Wins if voted out during the day.

4. Day Phase Logic
   - Game Master announces who died during the night (if any).

   - Players can discuss and accuse freely.

   - Voting occurs → player with the most votes is eliminated.

   - If Hunter is eliminated → immediately kills another player.

   - If Tanner is eliminated → game ends, Tanner wins instantly.

5. Win Condition Logic
   - Werewolves win: When the number of Werewolves is equal to or greater than the number of other players.

   - Villagers win: When all Werewolves are eliminated.

   - Tanner wins: If voted out during the day.

6. Edge Cases
   - Witch can successfully heal themselves.

   - Bodyguard can protect the Witch on the night she is attacked.

   - Hunter killed at night can still kill a Werewolf before the night ends.

   - Witch’s poison killing the last Werewolf → Villagers win.
