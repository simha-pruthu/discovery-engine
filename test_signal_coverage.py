from config import KNOWN_APPS
from synthesizer import collect_signals

def test_failures_only():
    failing = []

    for name in KNOWN_APPS.keys():
        try:
            signals = collect_signals(name, [])
            count = len(signals)

            if count == 0:
                failing.append(name)

        except Exception:
            failing.append(name)

    print("\n❌ Apps with ZERO signals:\n")

    for name in failing:
        print(f"- {name}")

    print("\nTotal failing:", len(failing))
    print("Total apps:", len(KNOWN_APPS))


if __name__ == "__main__":
    test_failures_only()