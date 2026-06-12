# Grafana Metrics Dashboard

A web application that gathers CPU and Memory metrics from Grafana dashboards and displays them in a table format.

## Features

- Authenticates with Grafana using provided credentials
- Fetches CPU and Memory metrics from specified Grafana dashboards
- Displays metrics with average, minimum, and maximum values
- Date range picker for custom time period selection
- Clean, responsive UI

## Project Structure

```
get_grafana_data/
├── backend/
│   └── app.py              # Flask backend server
├── frontend/
│   ├── index.html          # Frontend UI
│   └── app.js              # Frontend JavaScript
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

## Running the Application

### Step 1: Start the Backend Server

```bash
cd backend
python app.py
```
The backend server will start on `http://localhost:5000`

### Step 2: Open the Frontend

Open the `frontend/index.html` file in your web browser, or serve it using a simple HTTP server:

```bash
cd frontend
python -m http.server 8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage

1. Select the **From Date & Time** (start of the time range)
2. Select the **To Date & Time** (end of the time range)
3. Click **Fetch Metrics** button
4. The application will:
   - Authenticate with Grafana
   - Fetch CPU and Memory metrics for the specified time range
   - Display the results in a table

## Table Format

The table displays the following columns:

| Workers / Pods | Avg CPU (%) | Min CPU (%) | Max CPU (%) | Avg Memory (MB) | Min Memory (MB) | Max Memory (MB) |
|----------------|-------------|-------------|-------------|-----------------|-----------------|-----------------|
| pod-name       | 25.50       | 10.20       | 45.80       | 512.30          | 400.00          | 650.00          |

## API Endpoints

### POST /api/metrics

Fetches metrics from Grafana for the specified time range.

**Request Body:**
```json
{
  "from_date": "2025-10-28T07:57:12.045Z",
  "to_date": "2025-10-28T08:21:25.602Z"
}
```

**Response:**
```json
{
  "data": [
    {
      "pod": "growin-marketdataservice-xyz",
      "avg_cpu": 25.50,
      "min_cpu": 10.20,
      "max_cpu": 45.80,
      "avg_memory": 512.30,
      "min_memory": 400.00,
      "max_memory": 650.00
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Configuration

### Grafana Configuration

The application is configured to connect to:
- **Grafana URL**: `https://monit-pt.corp.mandirisekuritas.co.id`
- **Username**: `viewer`
- **Password**: `viewer`
- **Namespace**: `growin`
- **Containers**:
  - growin-marketdataservice
  - growin-autoorderservice
  - growin-orderservice
  - growin-udfservice

To modify these settings, edit the constants in `backend/app.py`:

```python
GRAFANA_BASE_URL = "https://monit-pt.corp.mandirisekuritas.co.id"
LOGIN_PAYLOAD = {"user": "viewer", "password": "viewer"}
```

## Troubleshooting

### SSL Certificate Errors

The application disables SSL verification for self-signed certificates. If you encounter SSL errors, ensure the `verify=False` parameter is set in the requests.

### CORS Issues

The backend includes CORS support. If you still face CORS issues, ensure:
1. The backend server is running
2. The frontend is accessing the correct backend URL
3. Update `API_BASE_URL` in `frontend/app.js` if needed

### No Data Returned

If no data is returned:
1. Verify Grafana credentials are correct
2. Check that the pods are running in the specified namespace
3. Ensure the time range contains data
4. Check the backend console for error messages

### Authentication Failed

If authentication fails:
1. Verify the Grafana login credentials
2. Check network connectivity to Grafana server
3. Ensure the Grafana instance is accessible

## Notes

- The application queries Prometheus datasource through Grafana
- CPU values are displayed as percentages
- Memory values are displayed in megabytes (MB)
- The default time range is the last 3 hours
- SSL warnings are disabled for development purposes

## License

This project is for internal use only.
