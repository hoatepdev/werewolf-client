# Masoi Server Updates Required

Based on the client-side improvements, the server needs to handle these new events and logic:

## New Socket Events to Handle

### 1. Win Condition Events
- `game:checkWinCondition` - Client sends when win condition detected
- `game:tannerWin` - Client sends when tanner is voted out

### 2. Enhanced Hunter Shoot
- `game:hunterShoot:done` now includes `winCondition` parameter

### 3. Bodyguard Protection Tracking
- Need to track `lastProtected` player ID for consecutive protection restriction

## Server Logic Updates Needed

### 1. Game State Management
- Track bodyguard's last protected player
- Implement win condition validation
- Handle immediate game end scenarios

### 2. Night Phase Logic
- Send `lastProtected` in bodyguard night prompt
- Validate bodyguard cannot protect same player twice

### 3. Win Condition Validation
- Server-side validation of client win condition checks
- Immediate game end when tanner wins
- Proper game end broadcasting

### 4. Enhanced Game Events
- Broadcast win conditions to all players
- Handle tanner immediate win scenario
- Update game state after hunter shoots with win check