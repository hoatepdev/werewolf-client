#!/usr/bin/env python3

import subprocess
import time
import requests
import json
import os
from typing import Dict, List

class ClientTester:
    def __init__(self, client_url: str = "http://localhost:4000"):
        self.client_url = client_url
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
        
    def test_client_server_running(self):
        try:
            response = requests.get(self.client_url, timeout=10)
            self.log_test("Client Server Running", response.status_code == 200, f"Status: {response.status_code}")
            return response.status_code == 200
        except Exception as e:
            self.log_test("Client Server Running", False, f"Error: {str(e)}")
            return False
            
    def test_home_page(self):
        try:
            response = requests.get(f"{self.client_url}/", timeout=10)
            if response.status_code == 200:
                content = response.text
                if "Ma Sói" in content or "werewolf" in content.lower():
                    self.log_test("Home Page", True, "Home page loads with game content")
                    return True
                else:
                    self.log_test("Home Page", False, "Home page missing game content")
                    return False
            else:
                self.log_test("Home Page", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Home Page", False, f"Error: {str(e)}")
            return False
            
    def test_create_room_page(self):
        try:
            response = requests.get(f"{self.client_url}/create-room", timeout=10)
            if response.status_code == 200:
                content = response.text
                if "create" in content.lower() or "room" in content.lower():
                    self.log_test("Create Room Page", True, "Create room page loads")
                    return True
                else:
                    self.log_test("Create Room Page", False, "Create room page missing content")
                    return False
            else:
                self.log_test("Create Room Page", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Create Room Page", False, f"Error: {str(e)}")
            return False
            
    def test_join_room_page(self):
        try:
            response = requests.get(f"{self.client_url}/join-room", timeout=10)
            if response.status_code == 200:
                content = response.text
                if "join" in content.lower() or "room" in content.lower():
                    self.log_test("Join Room Page", True, "Join room page loads")
                    return True
                else:
                    self.log_test("Join Room Page", False, "Join room page missing content")
                    return False
            else:
                self.log_test("Join Room Page", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Join Room Page", False, f"Error: {str(e)}")
            return False
            
    def test_approve_room_page(self):
        try:
            response = requests.get(f"{self.client_url}/approve-room", timeout=10)
            if response.status_code == 200:
                content = response.text
                if "approve" in content.lower() or "player" in content.lower():
                    self.log_test("Approve Room Page", True, "Approve room page loads")
                    return True
                else:
                    self.log_test("Approve Room Page", False, "Approve room page missing content")
                    return False
            else:
                self.log_test("Approve Room Page", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Approve Room Page", False, f"Error: {str(e)}")
            return False
            
    def test_static_assets(self):
        try:
            assets_to_test = [
                "/favicon.ico",
                "/manifest.json",
                "/icons/icon-192x192.png",
                "/images/logo/logo.png"
            ]
            
            assets_loaded = 0
            for asset in assets_to_test:
                try:
                    response = requests.get(f"{self.client_url}{asset}", timeout=5)
                    if response.status_code == 200:
                        assets_loaded += 1
                except:
                    pass
                    
            if assets_loaded >= len(assets_to_test) // 2:
                self.log_test("Static Assets", True, f"{assets_loaded}/{len(assets_to_test)} assets loaded")
                return True
            else:
                self.log_test("Static Assets", False, f"Only {assets_loaded}/{len(assets_to_test)} assets loaded")
                return False
                
        except Exception as e:
            self.log_test("Static Assets", False, f"Error: {str(e)}")
            return False
            
    def test_pwa_features(self):
        try:
            response = requests.get(f"{self.client_url}/manifest.json", timeout=5)
            if response.status_code == 200:
                manifest = response.json()
                if "name" in manifest and "short_name" in manifest:
                    self.log_test("PWA Features", True, "PWA manifest is valid")
                    return True
                else:
                    self.log_test("PWA Features", False, "PWA manifest missing required fields")
                    return False
            else:
                self.log_test("PWA Features", False, f"Manifest status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("PWA Features", False, f"Error: {str(e)}")
            return False
            
    def test_service_worker(self):
        try:
            response = requests.get(f"{self.client_url}/sw.js", timeout=5)
            if response.status_code == 200:
                content = response.text
                if "serviceWorker" in content or "cache" in content:
                    self.log_test("Service Worker", True, "Service worker file exists")
                    return True
                else:
                    self.log_test("Service Worker", False, "Service worker file missing content")
                    return False
            else:
                self.log_test("Service Worker", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Service Worker", False, f"Error: {str(e)}")
            return False
            
    def run_client_test_suite(self):
        print("🎮 Starting Ma Sói Client Test Suite")
        print("=" * 50)
        
        tests = [
            ("Client Server Running", self.test_client_server_running),
            ("Home Page", self.test_home_page),
            ("Create Room Page", self.test_create_room_page),
            ("Join Room Page", self.test_join_room_page),
            ("Approve Room Page", self.test_approve_room_page),
            ("Static Assets", self.test_static_assets),
            ("PWA Features", self.test_pwa_features),
            ("Service Worker", self.test_service_worker),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                self.log_test(test_name, False, f"Exception: {str(e)}")
                
        print("\n" + "=" * 50)
        print(f"📊 Client Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All client tests passed!")
        else:
            print("⚠️  Some client tests failed. Check the logs above for details.")
            
        return passed == total

def main():
    tester = ClientTester()
    success = tester.run_client_test_suite()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 