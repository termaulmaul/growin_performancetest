# Changelog - Grafana Metrics Dashboard

## Updates Summary

### New Features Added

#### 1. Container Selection
- **Frontend**: Added multi-select dropdown for container selection
- **Backend**: New endpoint `/api/containers` to fetch available containers dynamically from Grafana
- **Behavior**:
  - If no containers selected, uses default containers (growin-marketdataservice, growin-autoorderservice, growin-orderservice, growin-udfservice)
  - If containers selected, only fetches metrics for those specific containers
  - Currently shows 38 available containers in the growin namespace

#### 2. Worker/Node Information
- **Added Node/Worker column** to the table showing which Kubernetes node each pod is running on
- Node information is extracted from Prometheus metrics (e.g., tremapplwrk014, tremapplwrk015)
- This was requested from the second Grafana dashboard URL provided

#### 3. Sortable Table
- **All columns are now sortable** by clicking on column headers
- Sorting indicators:
  - ⇅ = Sortable (not sorted yet)
  - ↑ = Sorted ascending
  - ↓ = Sorted descending
- Supports both string sorting (Pod names, Worker names) and numeric sorting (CPU, Memory values)
- Click same column again to toggle sort direction

### API Changes

#### New Endpoint: GET /api/containers
```
GET /api/containers?namespace=growin

Response:
{
  "containers": [
    "growin-marketdataservice",
    "growin-orderservice",
    ...
  ]
}
```

#### Updated Endpoint: POST /api/metrics
```
POST /api/metrics

Request (new field added):
{
  "from_date": "2025-11-08T04:00:00.000Z",
  "to_date": "2025-11-08T07:00:00.000Z",
  "containers": ["growin-marketdataservice", "growin-orderservice"]  // NEW - optional
}

Response (new field added):
{
  "data": [
    {
      "pod": "growin-marketdataservice-pt-9d448d5b-bd8lz",
      "node": "tremapplwrk015",  // NEW - worker/node information
      "avg_cpu": 1.41,
      "min_cpu": 1.31,
      "max_cpu": 1.47,
      "avg_memory": 419.9,
      "min_memory": 419.71,
      "max_memory": 421.71
    }
  ]
}
```

### UI Changes

#### Table Structure
**Before:**
| Workers / Pods | Avg CPU (%) | Min CPU (%) | Max CPU (%) | Avg Memory (MB) | Min Memory (MB) | Max Memory (MB) |

**After:**
| Worker / Node | Pod Name | Avg CPU (%) | Min CPU (%) | Max CPU (%) | Avg Memory (MB) | Min Memory (MB) | Max Memory (MB) |

#### New Controls
- **Container Multi-Select**: Dropdown showing all available containers in the growin namespace
- Supports Ctrl+Click (Windows/Linux) or Cmd+Click (Mac) for multiple selections

### Technical Implementation

#### Backend (app.py)
- Added `get_available_containers()` method to GrafanaClient class
- Updated `process_metrics_data()` to extract node information
- Modified `/api/metrics` endpoint to accept and process container filter
- Added detailed logging for debugging

#### Frontend (index.html & app.js)
- Added container multi-select dropdown with dynamic population
- Updated table headers with sortable classes
- Added sort indicators and hover effects
- Included Worker/Node column in table

#### JavaScript (app.js)
- New `fetchContainers()` function to load containers on page load
- New `initializeSorting()` function to set up click handlers
- New `sortAndDisplayData()` function for client-side sorting
- Updated `displayMetrics()` to support sorting and display node information
- Updated `fetchMetrics()` to send selected containers to backend

### Example Usage

1. **Default behavior** (no containers selected):
   - Fetches metrics for default containers only
   - Shows all pods from those containers

2. **With specific containers**:
   - Select one or more containers from dropdown
   - Click "Fetch Metrics"
   - Only shows metrics for selected containers

3. **Sorting**:
   - Click any column header to sort by that column
   - Click again to reverse sort order
   - Visual indicator shows current sort column and direction

### Test Results

✅ Container endpoint returns 38 containers
✅ Metrics endpoint accepts container filter
✅ Worker/node information displayed correctly
✅ Sorting works for all columns
✅ Table updates dynamically based on selection
✅ Default behavior maintained when no containers selected

### Files Modified

1. `backend/app.py` - Added container endpoint, updated metrics processing
2. `frontend/index.html` - Added container select, updated table structure, added sort styles
3. `frontend/app.js` - Added container fetching, sorting functionality, updated display logic

## Date
2025-11-08
