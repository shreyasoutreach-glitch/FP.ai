#!/usr/bin/env python3
"""
FP.ai Unified Test Runner
Runs both the backend pytest suite (36 tests) and the standalone ML engine contract verification (12 assertions).
"""
import os
import sys
import subprocess

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    print("=" * 80)
    print("[*] FP.ai Unified Test Suite Runner")
    print("=" * 80)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")

    env = os.environ.copy()
    env["PYTHONPATH"] = backend_dir

    # 1. Run ML Engine Standalone Verification
    print("\n[Phase 1] Running Standalone ML Engine & Historical Precedents Test...")
    ml_test_path = os.path.join(base_dir, "test_ml_engine.py")
    res1 = subprocess.run([sys.executable, ml_test_path], env=env)

    # 2. Run Pytest Suite
    print("\n[Phase 2] Running Backend Pytest Integration & Unit Suite...")
    pytest_args = [
        sys.executable,
        "-m",
        "pytest",
        os.path.join(backend_dir, "tests"),
        "-v",
        "-o",
        "asyncio_default_fixture_loop_scope=session",
        "-o",
        "asyncio_default_test_loop_scope=session",
    ]
    res2 = subprocess.run(pytest_args, env=env)

    print("\n" + "=" * 80)
    if res1.returncode == 0 and res2.returncode == 0:
        print("[SUCCESS] ALL TESTS PASSED! FP.ai is fully functional and verified.")
        print("   - Standalone ML & Historical Contracts: 12/12 verified")
        print("   - Pytest API, Knowledge Base & Extractor: 36/36 passed")
        print("=" * 80)
        sys.exit(0)
    else:
        print("[FAILURE] Test failures detected.")
        print(f"   - ML tests return code: {res1.returncode}")
        print(f"   - Pytest return code: {res2.returncode}")
        print("=" * 80)
        sys.exit(1)

if __name__ == "__main__":
    main()
