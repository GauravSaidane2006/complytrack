#!/usr/bin/env python3
"""
ComplyTrack API Key Generator
Generates API keys for customer server authentication with the main update server.
Keys are stored in keys_log.txt (append) and keys_log.json (full state).
"""

import os
import sys
import json
import hashlib
import secrets
import string
from datetime import datetime
from pathlib import Path

VERSION = "1.0.0"

# Resolve tool dir: if running as PyInstaller exe, use exe's directory
if getattr(sys, 'frozen', False):
    TOOL_DIR = Path(sys.executable).parent
else:
    TOOL_DIR = Path(__file__).parent

KEYS_LOG_TXT = TOOL_DIR / "api_keys_log.txt"
KEYS_LOG_JSON = TOOL_DIR / "api_keys_log.json"
PREFIX = "ct"

def generate_api_key(length=32):
    """Generate a secure API key with checksum."""
    alphabet = string.ascii_lowercase + string.digits
    body = ''.join(secrets.choice(alphabet) for _ in range(length))
    checksum = hashlib.sha256(body.encode()).hexdigest()[:4]
    return f"{PREFIX}_{body}{checksum}"

def load_previous_keys():
    """Load previously generated keys from JSON log."""
    if KEYS_LOG_JSON.exists():
        try:
            with open(KEYS_LOG_JSON, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {"keys": [], "stats": {"total_generated": 0}}
    return {"keys": [], "stats": {"total_generated": 0}}

def save_keys(state):
    """Save keys to both JSON and TXT logs."""
    with open(KEYS_LOG_JSON, 'w') as f:
        json.dump(state, f, indent=2)

    with open(KEYS_LOG_TXT, 'a') as f:
        for key_entry in state["keys"][-1:]:  # Only append newest
            f.write(f"{key_entry['key']} | {key_entry['customer']} | {key_entry['created']}\n")

def generate_keys(count=1, customer_name="Unassigned"):
    """Generate one or more API keys."""
    state = load_previous_keys()
    generated = []

    for _ in range(count):
        key = generate_api_key()
        entry = {
            "key": key,
            "customer": customer_name,
            "created": datetime.now().isoformat(),
            "active": True
        }
        state["keys"].append(entry)
        state["stats"]["total_generated"] += 1
        generated.append(entry)

    save_keys(state)
    return generated

def list_keys(show_all=False):
    """List all generated keys."""
    state = load_previous_keys()
    keys = state["keys"] if show_all else [k for k in state["keys"] if k.get("active", True)]
    return keys, state["stats"]

def revoke_key(key):
    """Mark a key as revoked."""
    state = load_previous_keys()
    for entry in state["keys"]:
        if entry["key"] == key:
            entry["active"] = False
            entry["revoked"] = datetime.now().isoformat()
            save_keys(state)
            return True
    return False

def print_table(keys):
    """Print keys in a formatted table."""
    if not keys:
        print("  No keys found.")
        return

    print(f"  {'#':<4} {'API Key':<42} {'Customer':<25} {'Created':<20} {'Status'}")
    print(f"  {'-'*4} {'-'*42} {'-'*25} {'-'*20} {'-'*10}")
    for i, entry in enumerate(keys, 1):
        status = "Active" if entry.get("active", True) else "Revoked"
        created = entry["created"][:19].replace("T", " ")
        print(f"  {i:<4} {entry['key']:<42} {entry['customer']:<25} {created:<20} {status}")

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description=f"ComplyTrack API Key Generator v{VERSION}",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python apikeygen.py                           Generate 1 key
  python apikeygen.py -n 5                      Generate 5 keys
  python apikeygen.py -n 3 -c "Acme Corp"      Generate 3 keys for Acme Corp
  python apikeygen.py --list                    List active keys
  python apikeygen.py --list --all              List all keys including revoked
  python apikeygen.py --revoke <key>            Revoke a key
        """
    )
    parser.add_argument("-n", "--count", type=int, default=1, help="Number of keys to generate (default: 1)")
    parser.add_argument("-c", "--customer", default="Unassigned", help="Customer name (default: Unassigned)")
    parser.add_argument("-l", "--list", action="store_true", help="List generated keys")
    parser.add_argument("-a", "--all", action="store_true", help="Show all keys including revoked")
    parser.add_argument("-r", "--revoke", type=str, help="Revoke an API key")
    parser.add_argument("--version", action="version", version=f"ComplyTrack API KeyGen v{VERSION}")

    args = parser.parse_args()

    print(f"\n  ComplyTrack API Key Generator v{VERSION}")
    print(f"  {'='*45}\n")

    if args.revoke:
        if revoke_key(args.revoke):
            print(f"  [OK] Key revoked: {args.revoke}\n")
        else:
            print(f"  [ERROR] Key not found: {args.revoke}\n")
        return

    if args.list:
        keys, stats = list_keys(show_all=args.all)
        print(f"  Total generated: {stats['total_generated']}")
        print(f"  Showing: {'All' if args.all else 'Active only'}\n")
        print_table(keys)
        print()
        return

    # Generate keys
    generated = generate_keys(count=args.count, customer_name=args.customer)

    print(f"  Generated {len(generated)} API key(s):\n")
    print_table(generated)

    print(f"\n  Keys saved to:")
    print(f"    {KEYS_LOG_TXT}")
    print(f"    {KEYS_LOG_JSON}\n")

if __name__ == "__main__":
    main()
