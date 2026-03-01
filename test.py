from dotenv import load_dotenv
import os
import json

from discovery import discover_product
from synthesizer import run_pipeline

# Load environment variables
load_dotenv()

print("API KEY LOADED:", bool(os.getenv("ANTHROPIC_API_KEY")))

# Product A
p1 = discover_product("Notion")
result1 = run_pipeline(p1.name, [])

print("\nNOTION OUTPUT:")
print(json.dumps(result1, indent=2))

# Product B
p2 = discover_product("Obsidian")
result2 = run_pipeline(p2.name, [])

print("\nOBSIDIAN OUTPUT:")
print(json.dumps(result2, indent=2))

print("\nBoth pipelines completed.")