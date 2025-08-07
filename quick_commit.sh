#!/bin/bash

# Quick commit script for large repository
echo "Removing lock files..."
rm -f .git/index.lock .git/refs/heads/*.lock .git/HEAD.lock

echo "Adding files..."
git add packages/ketcher-react/src/script/ui/views/AIAssistant/AIAssistantPanel.tsx

echo "Committing..."
git commit -m "Revert AI Assistant Panel to stable state

Reverted complex structure isolation attempts that caused display issues.
Restored simple StructurePreviewComponent implementation.
Known issue: clicking 'Add to Canvas' still affects all structure displays.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

echo "Pushing..."
git push origin main

echo "Done!"