import os
import re

replacement = """<div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading...</div>
          </div>"""

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            
            # Simple heuristic to replace common bad loading states
            # Often written as: return <div>Loading...</div> or <div style={...}>Loading...</div>
            new_content = re.sub(r'>Loading\.\.\.<', f'>{replacement}<', content)
            
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Replaced loading state in {path}")

