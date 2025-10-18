#!/usr/bin/env python3
"""
Separate Angular component templates and styles from TypeScript files.
This script reads component files and extracts template and styles to separate files.
"""

import os
import re
import sys
from pathlib import Path

# Get all .component.ts files
frontend_path = Path("/Users/mujthabamk/Desktop/real-world-projects/osa/OSA/osa-frontend")
components = list(frontend_path.rglob("*.component.ts"))

print(f"Found {len(components)} component files")

for component_file in components:
    # Skip if separate files already exist
    html_file = component_file.with_suffix('.html').with_stem(component_file.stem.replace('.component', '.component'))
    html_file = component_file.parent / f"{component_file.stem.split('.')[0]}.component.html"
    css_file = component_file.parent / f"{component_file.stem.split('.')[0]}.component.css"
    
    # Skip app.component and course-details which we already did
    if "app.component" in str(component_file) or "course-details" in str(component_file):
        print(f"✓ Skipping {component_file.name} (already processed)")
        continue
    
    # Read the original file
    content = component_file.read_text(encoding='utf-8')
    
    # Check if it already uses external files
    if 'templateUrl' in content or 'styleUrl' in content:
        print(f"✓ Skipping {component_file.name} (already using external files)")
        continue
    
    # Extract template
    template_match = re.search(r"template:\s*`([^`]*)`", content, re.DOTALL)
    if not template_match:
        # Try single-quoted template
        template_match = re.search(r"template:\s*'([^']*)'", content, re.DOTALL)
    
    # Extract styles
    styles_match = re.search(r"styles:\s*\[\s*`([^`]*)`\s*\]", content, re.DOTALL)
    if not styles_match:
        # Try with multiple styles
        styles_match = re.search(r"styles:\s*\[(.*?)\]", content, re.DOTALL)
    
    if template_match or styles_match:
        print(f"\nProcessing: {component_file.name}")
        
        # Write HTML file if template exists
        if template_match:
            template_content = template_match.group(1)
            html_file.write_text(template_content, encoding='utf-8')
            print(f"  ✓ Created {html_file.name}")
        
        # Write CSS file if styles exist
        if styles_match:
            styles_content = styles_match.group(1)
            # Clean up the styles content
            styles_content = re.sub(r"^\s*`\s*", "", styles_content)
            styles_content = re.sub(r"\s*`\s*,?\s*$", "", styles_content)
            css_file.write_text(styles_content, encoding='utf-8')
            print(f"  ✓ Created {css_file.name}")
        
        # Update the TS file
        new_content = content
        if template_match:
            template_start = content.find(template_match.group(0))
            template_end = template_start + len(template_match.group(0))
            new_content = new_content[:template_start] + f"templateUrl: '{html_file.name}'," + new_content[template_end:]
        
        if styles_match:
            styles_start = new_content.find(styles_match.group(0))
            styles_end = styles_start + len(styles_match.group(0))
            new_content = new_content[:styles_start] + f"styleUrl: '{css_file.name}'," + new_content[styles_end:]
        
        # component_file.write_text(new_content, encoding='utf-8')
        # print(f"  ✓ Updated {component_file.name}")
    else:
        print(f"⊘ No template or styles found in {component_file.name}")

print("\n✓ Script completed!")
