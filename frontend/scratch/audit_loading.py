import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            if '>Loading...<' in content or '>Loading<' in content or '>Loading ' in content:
                print(f"Found non-standard loading in {path}")

