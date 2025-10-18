#!/bin/bash

# Script to separate Angular component templates and styles into separate files

FRONTEND_DIR="/Users/mujthabamk/Desktop/real-world-projects/osa/OSA/osa-frontend"
cd "$FRONTEND_DIR" || exit 1

echo "🔍 Finding all component files..."
COMPONENTS=$(find . -name "*.component.ts" -type f)
SKIPPED=0
PROCESSED=0

for COMPONENT_FILE in $COMPONENTS; do
    COMPONENT_DIR=$(dirname "$COMPONENT_FILE")
    COMPONENT_NAME=$(basename "$COMPONENT_FILE" .ts | sed 's/\.component$//')
    
    # Skip app.component and course-details (already done)
    if [[ "$COMPONENT_FILE" == *"app.component"* ]] || [[ "$COMPONENT_FILE" == *"course-details"* ]]; then
        echo "⊘ Skipped: $COMPONENT_FILE (already processed)"
        ((SKIPPED++))
        continue
    fi
    
    # Check if already using external files
    if grep -q "templateUrl\|styleUrl" "$COMPONENT_FILE"; then
        echo "⊘ Skipped: $COMPONENT_FILE (already using external files)"
        ((SKIPPED++))
        continue
    fi
    
    echo "📦 Processing: $COMPONENT_FILE"
    ((PROCESSED++))
done

echo ""
echo "📊 Summary:"
echo "  ✓ Would process: $PROCESSED components"
echo "  ⊘ Already done/skipped: $SKIPPED components"
