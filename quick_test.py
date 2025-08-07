#!/usr/bin/env python3

import os
import json
import subprocess
from typing import List, Dict

class QuickTester:
    def __init__(self):
        self.results = []
        
    def log_test(self, test_name: str, success: bool, message: str = ""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.results.append({"test": test_name, "success": success, "message": message})
        
    def test_project_structure(self):
        required_files = [
            "package.json",
            "next.config.ts",
            "tsconfig.json",
            "src/app/page.tsx",
            "src/lib/socket.ts",
            "public/manifest.json"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
                
        if missing_files:
            self.log_test("Project Structure", False, f"Missing: {missing_files[:3]}...")
            return False
        else:
            self.log_test("Project Structure", True, f"All {len(required_files)} files present")
            return True
            
    def test_package_json(self):
        try:
            with open("package.json", "r") as f:
                data = json.load(f)
                
            required_fields = ["name", "version", "scripts", "dependencies"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Package.json", False, f"Missing fields: {missing_fields}")
                return False
            else:
                self.log_test("Package.json", True, f"Version: {data.get('version', 'unknown')}")
                return True
        except Exception as e:
            self.log_test("Package.json", False, f"Error: {str(e)}")
            return False
            
    def test_game_components(self):
        required_components = [
            "src/components/PlayerGrid.tsx",
            "src/components/GameEnd.tsx",
            "src/components/phase/DayPhase.tsx",
            "src/components/phase/NightPhase.tsx",
            "src/components/actions/WerewolfAction.tsx",
            "src/components/actions/SeerAction.tsx"
        ]
        
        missing_components = []
        for component in required_components:
            if not os.path.exists(component):
                missing_components.append(component)
                
        if missing_components:
            self.log_test("Game Components", False, f"Missing: {missing_components[:3]}...")
            return False
        else:
            self.log_test("Game Components", True, f"All {len(required_components)} components present")
            return True
            
    def test_game_pages(self):
        required_pages = [
            "src/app/page.tsx",
            "src/app/create-room/page.tsx",
            "src/app/join-room/page.tsx",
            "src/app/approve-room/page.tsx",
            "src/app/gm-room/[roomCode]/page.tsx",
            "src/app/lobby/[roomCode]/page.tsx"
        ]
        
        missing_pages = []
        for page in required_pages:
            if not os.path.exists(page):
                missing_pages.append(page)
                
        if missing_pages:
            self.log_test("Game Pages", False, f"Missing: {missing_pages[:3]}...")
            return False
        else:
            self.log_test("Game Pages", True, f"All {len(required_pages)} pages present")
            return True
            
    def test_game_assets(self):
        required_assets = [
            "public/images/logo/logo.png",
            "public/images/phase/day.gif",
            "public/images/phase/night.gif",
            "public/images/role/werewolf.png",
            "public/images/role/villager.png",
            "public/icons/icon-192x192.png"
        ]
        
        missing_assets = []
        for asset in required_assets:
            if not os.path.exists(asset):
                missing_assets.append(asset)
                
        if missing_assets:
            self.log_test("Game Assets", False, f"Missing: {missing_assets[:3]}...")
            return False
        else:
            self.log_test("Game Assets", True, f"All {len(required_assets)} assets present")
            return True
            
    def test_types_and_constants(self):
        required_files = [
            "src/types/player.ts",
            "src/types/role.ts",
            "src/constants/role.ts",
            "src/constants/index.ts"
        ]
        
        missing_files = []
        for file_path in required_files:
            if not os.path.exists(file_path):
                missing_files.append(file_path)
                
        if missing_files:
            self.log_test("Types & Constants", False, f"Missing: {missing_files}")
            return False
        else:
            self.log_test("Types & Constants", True, f"All {len(required_files)} files present")
            return True
            
    def test_node_modules(self):
        if os.path.exists("node_modules"):
            self.log_test("Node Modules", True, "Dependencies installed")
            return True
        else:
            self.log_test("Node Modules", False, "Run 'npm install' first")
            return False
            
    def test_build_script(self):
        try:
            result = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, timeout=60)
            if result.returncode == 0:
                self.log_test("Build Script", True, "Build completed successfully")
                return True
            else:
                self.log_test("Build Script", False, f"Build failed: {result.stderr[:100]}...")
                return False
        except subprocess.TimeoutExpired:
            self.log_test("Build Script", False, "Build timed out")
            return False
        except Exception as e:
            self.log_test("Build Script", False, f"Error: {str(e)}")
            return False
            
    def run_quick_tests(self):
        print("🎮 Ma Sói Game - Quick Test Suite")
        print("=" * 50)
        
        tests = [
            ("Project Structure", self.test_project_structure),
            ("Package.json", self.test_package_json),
            ("Game Components", self.test_game_components),
            ("Game Pages", self.test_game_pages),
            ("Game Assets", self.test_game_assets),
            ("Types & Constants", self.test_types_and_constants),
            ("Node Modules", self.test_node_modules),
            ("Build Script", self.test_build_script),
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
        print(f"📊 Quick Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All quick tests passed! Game structure is correct.")
            print("💡 Run 'python3 run_tests.py' for comprehensive testing.")
        else:
            print("⚠️  Some tests failed. Fix issues before running full tests.")
            
        return passed == total

def main():
    tester = QuickTester()
    success = tester.run_quick_tests()
    return 0 if success else 1

if __name__ == "__main__":
    exit(main()) 