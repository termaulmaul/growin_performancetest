#!/bin/bash

echo "Starting Grafana Metrics Dashboard Backend..."
echo "=============================================="
echo ""

# Change to the directory where the script is located
cd "$(dirname "$0")" || exit 1

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the backend server
echo ""
echo "Starting backend server (port will be auto-assigned)"
echo "Press Ctrl+C to stop the server"
echo ""
cd backend
python app.py