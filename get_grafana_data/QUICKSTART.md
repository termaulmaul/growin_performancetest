# Quick Start Guide

Follow these simple steps to run the Grafana Metrics Dashboard:

## Option 1: Using Shell Scripts (Recommended)

### Terminal 1 - Start Backend

```bash
./start_backend.sh
```

### Terminal 2 - Start Frontend

```bash
./start_frontend.sh
```

Then open your browser and navigate to: **http://localhost:8000**

## Option 2: Manual Setup

### Terminal 1 - Backend

```bash
pip install -r requirements.txt
cd backend
python app.py
```

### Terminal 2 - Frontend

```bash
cd frontend
python -m http.server 8000
```

Then open your browser and navigate to: **http://localhost:8000**

## Using the Application

1. The application will load with default dates (last 3 hours)
2. Adjust the **From Date & Time** and **To Date & Time** as needed
3. Click the **Fetch Metrics** button
4. View the results in the table below

## Example Time Ranges

- **Last hour**: Set From to 1 hour ago, To to now
- **Specific incident**: Set both dates to the exact time range
- **Daily report**: Set From to 00:00 today, To to 23:59 today

## Expected Output

The table will show:
- Pod/Worker names from your Grafana dashboards
- CPU metrics (in percentage): Average, Min, Max
- Memory metrics (in MB): Average, Min, Max

## Need Help?

Refer to the main [README.md](README.md) for detailed documentation and troubleshooting.
