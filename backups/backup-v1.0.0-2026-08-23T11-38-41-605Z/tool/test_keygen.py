"""Quick test to verify key generation + validation logic."""

from keygen import generate_key, decode_key, TIERS

def test():
    print("=" * 50)
    print("  ComplyTrack Key Generator - Test")
    print("=" * 50)

    for tier in TIERS:
        key = generate_key(tier)
        info = decode_key(key)
        status = "VALID" if info["valid_checksum"] else "INVALID"
        print(f"\n  Tier:   {tier}")
        print(f"  Key:    {key}")
        print(f"  Decoded: {info}")
        print(f"  Status: {status}")

    # Test invalid key
    bad = decode_key("XX-XX-XX-XX-XXXX")
    print(f"\n  Invalid key test: {bad}")

    print("\n" + "=" * 50)

if __name__ == "__main__":
    test()
