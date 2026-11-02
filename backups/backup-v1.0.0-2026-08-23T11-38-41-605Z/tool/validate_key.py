"""
ComplyTrack Key Validator
Standalone script to validate license keys.
Usage: python validate_key.py <KEY>
"""

import sys
from keygen import decode_key


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_key.py <LICENSE_KEY>")
        print("Example: python validate_key.py 1M-A3F2-K9B1-N7X4")
        sys.exit(1)

    key = sys.argv[1]
    result = decode_key(key)

    if result is None:
        print(f"INVALID: '{key}' is not a valid ComplyTrack license key.")
        sys.exit(1)

    print(f"Key:        {result['key']}")
    print(f"Tier:       {result['tier']}")
    print(f"Days:       {result['days']}")
    print(f"Checksum:   {'PASS' if result['valid_checksum'] else 'FAIL'}")

    if not result["valid_checksum"]:
        print("WARNING: Checksum verification failed. Key may be tampered.")
        sys.exit(1)

    print("VALID license key.")


if __name__ == "__main__":
    main()
