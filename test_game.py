#!/usr/bin/env python3

import asyncio
import json
import random
import time
import requests
from typing import Dict, List, Optional
import socketio
import threading
from dataclasses import dataclass
from enum import Enum

class GamePhase(Enum):
    NIGHT = "night"
    DAY = "day"
    VOTING = "voting"
    ENDED = "ended"

class PlayerStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"

@dataclass
class Player:
    id: str
    username: str
    avatar_key: int
    status: PlayerStatus
    alive: bool = True
    role: Optional[str] = None

class GameTester:
    def __init__(self, server_url: str = "http://localhost:4000", socket_url: str = "http://localhost:4001"):
        self.server_url = server_url
        self.socket_url = socket_url
        self.gm_socket = None
        self.player_sockets = []
        self.room_code = None
        self.gm_room_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": time.time()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def create_socket_client(self, name: str):
        sio = socketio.Client()
        sio.name = name
        return sio
        
    def test_server_connection(self):
        try:
            response = requests.get(f"{self.server_url}/api/health", timeout=5)
            self.log_test("Server Connection", response.status_code == 200, f"Status: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            self.log_test("Server Connection", False, f"Error: {str(e)}")
            return False
            
    def test_room_creation(self):
        try:
            self.gm_socket = self.create_socket_client("GM")
            self.gm_socket.connect(self.socket_url)
            
            room_created = False
            room_data = None
            
            @self.gm_socket.on('connect')
            def on_connect():
                self.gm_socket.emit('rq_gm:createRoom', {
                    'avatarKey': 1,
                    'username': 'TestGM'
                })
                
            @self.gm_socket.on('room:updatePlayers')
            def on_players_update(players):
                nonlocal room_created, room_data
                room_created = True
                room_data = {'players': players}
                
            time.sleep(2)
            
            if room_created:
                self.room_code = room_data.get('roomCode', 'TEST123')
                self.gm_room_id = f"gm_{self.room_code}"
                self.log_test("Room Creation", True, f"Room created: {self.room_code}")
                return True
            else:
                self.log_test("Room Creation", False, "No room data received")
                return False
                
        except Exception as e:
            self.log_test("Room Creation", False, f"Error: {str(e)}")
            return False
            
    def test_player_joining(self, num_players: int = 4):
        try:
            players_joined = 0
            player_data = []
            
            for i in range(num_players):
                player_socket = self.create_socket_client(f"Player{i+1}")
                player_socket.connect(self.socket_url)
                self.player_sockets.append(player_socket)
                
                @player_socket.on('connect')
                def on_player_connect():
                    player_socket.emit('rq_player:joinRoom', {
                        'roomCode': self.room_code,
                        'avatarKey': i + 2,
                        'username': f'TestPlayer{i+1}'
                    })
                    
                @player_socket.on('room:updatePlayers')
                def on_players_update(players):
                    nonlocal players_joined
                    players_joined += 1
                    player_data.append(players)
                    
            time.sleep(3)
            
            if players_joined >= num_players:
                self.log_test("Player Joining", True, f"{num_players} players joined successfully")
                return True
            else:
                self.log_test("Player Joining", False, f"Only {players_joined}/{num_players} players joined")
                return False
                
        except Exception as e:
            self.log_test("Player Joining", False, f"Error: {str(e)}")
            return False
            
    def test_player_approval(self):
        try:
            approval_success = False
            
            @self.gm_socket.on('room:updatePlayers')
            def on_players_update(players):
                nonlocal approval_success
                pending_players = [p for p in players if p.get('status') == 'pending']
                if pending_players:
                    for player in pending_players:
                        self.gm_socket.emit('rq_gm:approvePlayer', {
                            'roomCode': self.room_code,
                            'playerId': player['id']
                        })
                    approval_success = True
                    
            time.sleep(2)
            
            if approval_success:
                self.log_test("Player Approval", True, "All players approved")
                return True
            else:
                self.log_test("Player Approval", False, "No players to approve or approval failed")
                return False
                
        except Exception as e:
            self.log_test("Player Approval", False, f"Error: {str(e)}")
            return False
            
    def test_game_start(self):
        try:
            game_started = False
            
            @self.gm_socket.on('room:readySuccess')
            def on_ready_success():
                nonlocal game_started
                game_started = True
                
            for player_socket in self.player_sockets:
                player_socket.emit('rq_player:ready', {'roomCode': self.room_code})
                
            time.sleep(3)
            
            if game_started:
                self.log_test("Game Start", True, "Game started successfully")
                return True
            else:
                self.log_test("Game Start", False, "Game start failed")
                return False
                
        except Exception as e:
            self.log_test("Game Start", False, f"Error: {str(e)}")
            return False
            
    def test_gm_room_connection(self):
        try:
            gm_connected = False
            
            @self.gm_socket.on('gm:connected')
            def on_gm_connected(data):
                nonlocal gm_connected
                gm_connected = True
                
            self.gm_socket.emit('rq_gm:connectGmRoom', {
                'roomCode': self.room_code,
                'gmRoomId': self.gm_room_id
            })
            
            time.sleep(2)
            
            if gm_connected:
                self.log_test("GM Room Connection", True, "GM connected to game room")
                return True
            else:
                self.log_test("GM Room Connection", False, "GM connection failed")
                return False
                
        except Exception as e:
            self.log_test("GM Room Connection", False, f"Error: {str(e)}")
            return False
            
    def test_game_phases(self):
        try:
            phases_tested = []
            
            @self.gm_socket.on('game:phaseChanged')
            def on_phase_change(data):
                phases_tested.append(data.get('phase'))
                
            @self.gm_socket.on('gm:playersUpdate')
            def on_players_update(data):
                pass
                
            self.gm_socket.emit('rq_gm:nextPhase', {'roomCode': self.room_code})
            time.sleep(2)
            
            self.gm_socket.emit('rq_gm:nextPhase', {'roomCode': self.room_code})
            time.sleep(2)
            
            if len(phases_tested) >= 2:
                self.log_test("Game Phases", True, f"Phases tested: {phases_tested}")
                return True
            else:
                self.log_test("Game Phases", False, f"Only {len(phases_tested)} phases tested")
                return False
                
        except Exception as e:
            self.log_test("Game Phases", False, f"Error: {str(e)}")
            return False
            
    def test_role_assignment(self):
        try:
            roles_assigned = 0
            
            for player_socket in self.player_sockets:
                @player_socket.on('player:assignedRole')
                def on_role_assigned(data):
                    nonlocal roles_assigned
                    roles_assigned += 1
                    
            time.sleep(2)
            
            if roles_assigned >= len(self.player_sockets):
                self.log_test("Role Assignment", True, f"{roles_assigned} roles assigned")
                return True
            else:
                self.log_test("Role Assignment", False, f"Only {roles_assigned}/{len(self.player_sockets)} roles assigned")
                return False
                
        except Exception as e:
            self.log_test("Role Assignment", False, f"Error: {str(e)}")
            return False
            
    def test_night_actions(self):
        try:
            night_actions_received = 0
            
            @self.gm_socket.on('gm:nightAction')
            def on_night_action(data):
                nonlocal night_actions_received
                night_actions_received += 1
                
            for player_socket in self.player_sockets:
                player_socket.emit('rq_player:nightAction', {
                    'roomCode': self.room_code,
                    'action': 'skip'
                })
                
            time.sleep(3)
            
            if night_actions_received > 0:
                self.log_test("Night Actions", True, f"{night_actions_received} night actions processed")
                return True
            else:
                self.log_test("Night Actions", False, "No night actions received")
                return False
                
        except Exception as e:
            self.log_test("Night Actions", False, f"Error: {str(e)}")
            return False
            
    def test_voting_phase(self):
        try:
            voting_actions_received = 0
            
            @self.gm_socket.on('gm:votingAction')
            def on_voting_action(data):
                nonlocal voting_actions_received
                voting_actions_received += 1
                
            for player_socket in self.player_sockets:
                player_socket.emit('rq_player:vote', {
                    'roomCode': self.room_code,
                    'targetId': 'player-1'
                })
                
            time.sleep(3)
            
            if voting_actions_received > 0:
                self.log_test("Voting Phase", True, f"{voting_actions_received} votes processed")
                return True
            else:
                self.log_test("Voting Phase", False, "No votes processed")
                return False
                
        except Exception as e:
            self.log_test("Voting Phase", False, f"Error: {str(e)}")
            return False
            
    def test_player_elimination(self):
        try:
            elimination_success = False
            
            @self.gm_socket.on('gm:playersUpdate')
            def on_players_update(data):
                nonlocal elimination_success
                players = data
                dead_players = [p for p in players if not p.get('alive', True)]
                if dead_players:
                    elimination_success = True
                    
            self.gm_socket.emit('rq_gm:eliminatePlayer', {
                'roomCode': self.room_code,
                'playerId': 'player-1'
            })
            
            time.sleep(2)
            
            if elimination_success:
                self.log_test("Player Elimination", True, "Player eliminated successfully")
                return True
            else:
                self.log_test("Player Elimination", False, "Player elimination failed")
                return False
                
        except Exception as e:
            self.log_test("Player Elimination", False, f"Error: {str(e)}")
            return False
            
    def test_game_end(self):
        try:
            game_ended = False
            
            @self.gm_socket.on('gm:gameEnded')
            def on_game_ended(data):
                nonlocal game_ended
                game_ended = True
                
            self.gm_socket.emit('rq_gm:endGame', {'roomCode': self.room_code})
            
            time.sleep(2)
            
            if game_ended:
                self.log_test("Game End", True, "Game ended successfully")
                return True
            else:
                self.log_test("Game End", False, "Game end failed")
                return False
                
        except Exception as e:
            self.log_test("Game End", False, f"Error: {str(e)}")
            return False
            
    def cleanup(self):
        try:
            if self.gm_socket:
                self.gm_socket.disconnect()
            for player_socket in self.player_sockets:
                player_socket.disconnect()
            self.log_test("Cleanup", True, "All connections closed")
        except Exception as e:
            self.log_test("Cleanup", False, f"Error: {str(e)}")
            
    def run_full_test_suite(self):
        print("🎮 Starting Ma Sói Game Test Suite")
        print("=" * 50)
        
        tests = [
            ("Server Connection", self.test_server_connection),
            ("Room Creation", self.test_room_creation),
            ("Player Joining", lambda: self.test_player_joining(4)),
            ("Player Approval", self.test_player_approval),
            ("Game Start", self.test_game_start),
            ("GM Room Connection", self.test_gm_room_connection),
            ("Role Assignment", self.test_role_assignment),
            ("Game Phases", self.test_game_phases),
            ("Night Actions", self.test_night_actions),
            ("Voting Phase", self.test_voting_phase),
            ("Player Elimination", self.test_player_elimination),
            ("Game End", self.test_game_end),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Exception: {str(e)}")
                
        self.cleanup()
        
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Game is working correctly.")
        else:
            print("⚠️  Some tests failed. Check the logs above for details.")
            
        return passed == total

def main():
    tester = GameTester()
    success = tester.run_full_test_suite()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 