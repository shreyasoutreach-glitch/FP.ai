#!/usr/bin/env python3
"""
FP.ai Quick Setup Script
Run this once to set up the environment.
"""
import os
import sys
import subprocess
import shutil


def run(cmd, cwd=None):
    print(f"  $ {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"  ⚠ Command exited with code {result.returncode}")
    return result.returncode == 0


def main():
    print("\n╔══════════════════════════════════╗")
    print("║   FP.ai — Fine Print Engine       ║")
    print("║   Setup Script                    ║")
    print("╚══════════════════════════════════╝\n")

    base = os.path.dirname(os.path.abspath(__file__))
    backend = os.path.join(base, "backend")
    frontend = os.path.join(base, "frontend")

    # Backend setup
    print("📦 Setting up backend…")
    env_example = os.path.join(backend, ".env.example")
    env_target = os.path.join(backend, ".env")
    if not os.path.exists(env_target):
        shutil.copy(env_example, env_target)
        print("  ✓ Created backend/.env from .env.example")
        print("  ⚠  Edit backend/.env and add your GEMINI_API_KEY\n")
    else:
        print("  ✓ backend/.env already exists")

    # Check Python
    py = sys.executable
    print(f"\n  Python: {py}")
    run(f'"{py}" -m pip install -r requirements.txt', cwd=backend)

    # Frontend setup
    print("\n📦 Setting up frontend…")
    npm = shutil.which("npm") or shutil.which("pnpm")
    if npm:
        run(f'"{npm}" install', cwd=frontend)
    else:
        print("  ⚠ npm/pnpm not found. Install Node.js 20+ and run: cd frontend && npm install")

    # Create data dirs
    os.makedirs(os.path.join(base, "data", "training"), exist_ok=True)
    os.makedirs(os.path.join(backend, "uploads"), exist_ok=True)
    os.makedirs(os.path.join(backend, "ml_models"), exist_ok=True)

    print("\n✅ Setup complete!\n")
    print("To start the app:")
    print("  Terminal 1 (backend):  cd backend && python main.py")
    print("  Terminal 2 (frontend): cd frontend && npm run dev")
    print("\n  Then open: http://localhost:5173")
    print("\n  API docs:  http://localhost:8000/api/docs\n")


if __name__ == "__main__":
    main()
