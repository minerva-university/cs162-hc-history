#!/bin/bash
cd "$(dirname "$0")/.."

clear
echo "====================================="
echo "  🚀 HC/LO Feedback Platform Launcher"
echo "====================================="
echo ""
echo "What would you like to do?"
echo ""
echo "1. Setup the platform"
echo "   - Estimated time: ~5 minutes"
echo "   - Includes data fetching and optional AI summarization (adds ~5 mins)"
echo ""
echo "2. Run the platform"
echo "   - Estimated time: Instant"
echo "   - Opens the site in your browser"
echo ""
read -p "Enter 1 or 2: " choice
echo ""

if [ "$choice" == "1" ]; then
    python3 setup.py
elif [ "$choice" == "2" ]; then
    python3 run.py &
    echo ""
    echo "Opening the platform in your browser..."
    sleep 2
    open http://localhost:3000
else
    echo "❌ Invalid option. Please run the launcher again and enter 1 or 2."
fi
