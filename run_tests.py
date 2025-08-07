#!/usr/bin/env python3

import subprocess
import time
import sys
import os
from typing import Dict, List, Tuple

class TestRunner:
    def __init__(self):
        self.results = {}
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.results[test_name] = {"success": success, "message": message}
        
    def check_dependencies(self):
        try:
            import requests
            import socketio
            self.log_test("Python Dependencies", True, "All required packages available")
            return True
        except ImportError as e:
            self.log_test("Python Dependencies", False, f"Missing package: {str(e)}")
            return False
            
    def check_node_dependencies(self):
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                self.log_test("Node.js", True, f"Version: {result.stdout.strip()}")
                return True
            else:
                self.log_test("Node.js", False, "Node.js not found")
                return False
        except Exception as e:
            self.log_test("Node.js", False, f"Error: {str(e)}")
            return False
            
    def check_npm_dependencies(self):
        try:
            if os.path.exists("package.json"):
                result = subprocess.run(["npm", "list", "--depth=0"], capture_output=True, text=True)
                if result.returncode == 0:
                    self.log_test("NPM Dependencies", True, "All dependencies installed")
                    return True
                else:
                    self.log_test("NPM Dependencies", False, "Dependencies not installed")
                    return False
            else:
                self.log_test("NPM Dependencies", False, "package.json not found")
                return False
        except Exception as e:
            self.log_test("NPM Dependencies", False, f"Error: {str(e)}")
            return False
            
    def start_server(self):
        try:
            print("🚀 Starting server...")
            server_process = subprocess.Popen(
                ["npm", "run", "start:dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            time.sleep(10)
            
            if server_process.poll() is None:
                self.log_test("Server Start", True, "Server started successfully")
                return server_process
            else:
                stdout, stderr = server_process.communicate()
                self.log_test("Server Start", False, f"Server failed to start: {stderr}")
                return None
        except Exception as e:
            self.log_test("Server Start", False, f"Error: {str(e)}")
            return None
            
    def run_game_tests(self):
        try:
            print("\n🎮 Running game logic tests...")
            result = subprocess.run([sys.executable, "test_game.py"], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_test("Game Logic Tests", True, "All game tests passed")
                return True
            else:
                self.log_test("Game Logic Tests", False, f"Game tests failed: {result.stderr}")
                return False
        except Exception as e:
            self.log_test("Game Logic Tests", False, f"Error: {str(e)}")
            return False
            
    def run_client_tests(self):
        try:
            print("\n🎮 Running client tests...")
            result = subprocess.run([sys.executable, "test_client.py"], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_test("Client Tests", True, "All client tests passed")
                return True
            else:
                self.log_test("Client Tests", False, f"Client tests failed: {result.stderr}")
                return False
        except Exception as e:
            self.log_test("Client Tests", False, f"Error: {str(e)}")
            return False
            
    def run_unit_tests(self):
        try:
            print("\n🧪 Running unit tests...")
            result = subprocess.run(["npm", "test"], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_test("Unit Tests", True, "All unit tests passed")
                return True
            else:
                self.log_test("Unit Tests", False, f"Unit tests failed: {result.stderr}")
                return False
        except Exception as e:
            self.log_test("Unit Tests", False, f"Error: {str(e)}")
            return False
            
    def run_linting(self):
        try:
            print("\n🔍 Running linting...")
            result = subprocess.run(["npm", "run", "lint"], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_test("Linting", True, "Code passes linting")
                return True
            else:
                self.log_test("Linting", False, f"Linting failed: {result.stderr}")
                return False
        except Exception as e:
            self.log_test("Linting", False, f"Error: {str(e)}")
            return False
            
    def run_build_test(self):
        try:
            print("\n🏗️  Testing build process...")
            result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True)
            
            if result.returncode == 0:
                self.log_test("Build Test", True, "Build completed successfully")
                return True
            else:
                self.log_test("Build Test", False, f"Build failed: {result.stderr}")
                return False
        except Exception as e:
            self.log_test("Build Test", False, f"Error: {str(e)}")
            return False
            
    def test_pwa_features(self):
        try:
            print("\n📱 Testing PWA features...")
            
            if not os.path.exists("public/manifest.json"):
                self.log_test("PWA Manifest", False, "manifest.json not found")
                return False
                
            if not os.path.exists("public/sw.js"):
                self.log_test("PWA Service Worker", False, "sw.js not found")
                return False
                
            if not os.path.exists("public/icons/icon-192x192.png"):
                self.log_test("PWA Icons", False, "PWA icons not found")
                return False
                
            self.log_test("PWA Features", True, "All PWA features present")
            return True
            
        except Exception as e:
            self.log_test("PWA Features", False, f"Error: {str(e)}")
            return False
            
    def test_game_assets(self):
        try:
            print("\n🎨 Testing game assets...")
            
            required_assets = [
                "public/images/logo/logo.png",
                "public/images/phase/day.gif",
                "public/images/phase/night.gif",
                "public/images/phase/voting.gif",
                "public/images/role/werewolf.png",
                "public/images/role/villager.png",
                "public/images/role/seer.png",
                "public/images/role/witch.png",
                "public/images/role/bodyguard.png",
                "public/images/role/hunter.png"
            ]
            
            missing_assets = []
            for asset in required_assets:
                if not os.path.exists(asset):
                    missing_assets.append(asset)
                    
            if missing_assets:
                self.log_test("Game Assets", False, f"Missing assets: {missing_assets[:3]}...")
                return False
            else:
                self.log_test("Game Assets", True, f"All {len(required_assets)} assets present")
                return True
                
        except Exception as e:
            self.log_test("Game Assets", False, f"Error: {str(e)}")
            return False
            
    def run_comprehensive_test_suite(self):
        print("🎮 Ma Sói Game - Comprehensive Test Suite")
        print("=" * 60)
        
        server_process = None
        
        try:
            tests = [
            ("Dependencies Check", self.check_dependencies),
            ("Node.js Check", self.check_node_dependencies),
            ("NPM Dependencies", self.check_npm_dependencies),
            ("PWA Features", self.test_pwa_features),
            ("Game Assets", self.test_game_assets),
            ("Linting", self.run_linting),
            ("Unit Tests", self.run_unit_tests),
        ]
            
            passed = 0
            total = len(tests)
            
            for test_name, test_func in tests:
                try:
                    if test_func():
                        passed += 1
                except Exception as e:
                    self.log_test(test_name, False, f"Exception: {str(e)}")
                    
            print("\n" + "=" * 60)
            print(f"📊 Static Tests: {passed}/{total} tests passed")
            
            if passed == total:
                print("🎉 All static tests passed! Starting server tests...")
                
                server_process = self.start_server()
                if server_process:
                    time.sleep(5)
                    
                    if self.run_game_tests():
                        passed += 1
                    total += 1
                        
                    if self.run_client_tests():
                        passed += 1
                    total += 1
                        
            print("\n" + "=" * 60)
            print(f"📊 Final Results: {passed}/{total} tests passed")
            
            if passed == total:
                print("🎉 All tests passed! Game is ready for production.")
                return True
            else:
                print("⚠️  Some tests failed. Check the logs above for details.")
                return False
                
        finally:
            if server_process:
                print("\n🛑 Stopping server...")
                server_process.terminate()
                server_process.wait()

def main():
    runner = TestRunner()
    success = runner.run_comprehensive_test_suite()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 