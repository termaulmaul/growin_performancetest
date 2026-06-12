#!/bin/bash
zzzz
echo "Starting Grafana Metrics Dashboard Frontend..."
echo "=============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3."
    exit 1
fi

# Start simple HTTP server
echo "Starting frontend server on http://localhost:8000"
echo "Open your browser and navigate to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""
cd frontend
python3 -m http.server 8000