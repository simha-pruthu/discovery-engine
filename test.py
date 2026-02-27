from discovery import discover_product
from synthesizer import run_pipeline

# Product A
p1 = discover_product("Notion")
run_pipeline(p1.name, [])

# Product B
p2 = discover_product("Obsidian")
run_pipeline(p2.name, [])

print("Both pipelines completed.")