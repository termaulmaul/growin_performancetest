# Changelog V2 - Enhanced Multi-Container Selection & Node Metrics

## Date: 2025-11-08

## New Features

### 1. Enhanced Container Multi-Selection
- **Improved UI** with better visual feedback for selected containers
- **Selected containers highlighted** with purple gradient background
- **Helper text** added below dropdown: "Leave empty to use default containers"
- **Better label**: Changed to "Containers (Ctrl/Cmd+Click for multiple)"
- **Increased dropdown height** to 120px for better visibility

### 2. Surrounding Resource Utilization Table (Node/Host Metrics)
Added a completely new table below the pod metrics table showing node-level metrics:

**Table Columns:**
- IP Address / Instance (e.g., 10.184.120.16:9100)
- Hostname (e.g., TREMAPPLWRK014, TREMAPPLWRK015, TREMAPPLWRK016)
- Avg CPU (%)
- Max CPU (%)
- Avg Memory (%)
- Max Memory (%)
- Avg Disk (%)
- Max Disk (%)

**Features:**
- Automatically fetched when pod metrics are loaded
- Sortable by any column (click header to sort)
- Shows physical host resource utilization
- Data from node_exporter metrics

## Technical Implementation

### Backend Changes

#### New Endpoint: POST /api/node-metrics
```python
POST /api/node-metrics
Request:
{
  "from_date": "2025-11-08T04:00:00.000Z",
  "to_date": "2025-11-08T07:00:00.000Z"
}

Response:
{
  "data": [
    {
      "instance": "10.184.120.16:9100",
      "hostname": "TREMAPPLWRK016",
      "avg_cpu": 0.68,
      "max_cpu": 1.24,
      "avg_memory": 6.53,
      "max_memory": 6.62,
      "avg_disk": 0,
      "max_disk": 0
    }
  ]
}
```

#### Updated process_metrics_data Function
- Added `metric_type` parameter to handle both pod and node metrics
- For `metric_type='node'`: Extracts 'instance' field
- For `metric_type='pod'`: Extracts 'pod' field
- Properly handles hostname extraction from node_uname_info

#### Prometheus Queries Used
```promql
# CPU Usage
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory Usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk Usage
(1 - (node_filesystem_avail_bytes{fstype!="tmpfs",mountpoint="/"} /
      node_filesystem_size_bytes{fstype!="tmpfs",mountpoint="/"})) * 100

# Hostname Mapping
node_uname_info
```

### Frontend Changes

#### New HTML Elements
- Section title: "Surrounding Resource Utilization (Nodes/Hosts)"
- New table: `nodeMetricsTable` with 8 columns
- New table body: `nodeMetricsBody`
- Sortable headers for all columns

#### New JavaScript Functions
- `displayNodeMetrics(data, storeData)` - Renders node metrics table
- `initializeNodeSorting()` - Sets up click handlers for sorting
- `sortAndDisplayNodeData(column, type, direction)` - Sorts node data
- `fetchNodeMetrics(fromDateISO, toDateISO)` - Fetches node metrics from API

#### Updated Functions
- `fetchMetrics()` - Now also calls `fetchNodeMetrics()` in parallel
- Added global variables: `currentNodeData` and `currentNodeSort`

### CSS Enhancements
- `.form-group select[multiple] option:checked` - Purple gradient for selected options
- `.helper-text` - Styled helper text below container dropdown
- `.section-title` - Blue underline for section headers
- Improved multi-select styling with better padding and spacing

## Test Results

### Container Selection
✅ Multi-select works with Ctrl/Cmd+Click
✅ Selected items highlighted with purple background
✅ Can select/deselect multiple containers
✅ Empty selection uses default containers

### Pod Metrics Table
✅ Shows Worker/Node column
✅ Shows Pod Name
✅ CPU and Memory metrics with Avg/Min/Max
✅ Sortable by all columns
✅ Filtering by selected containers works

### Node Metrics Table
✅ Shows 3 nodes: TREMAPPLWRK014, TREMAPPLWRK015, TREMAPPLWRK016
✅ IP addresses displayed: 10.184.120.14:9100, etc.
✅ CPU and Memory percentages shown
✅ Sortable by all columns
✅ Automatically fetched with pod metrics

## Example Data

### Pod Metrics Response
```json
{
  "pod": "growin-marketdataservice-pt-9d448d5b-bd8lz",
  "node": "tremapplwrk015",
  "avg_cpu": 1.41,
  "min_cpu": 1.31,
  "max_cpu": 1.47,
  "avg_memory": 419.9,
  "min_memory": 419.71,
  "max_memory": 421.71
}
```

### Node Metrics Response
```json
{
  "instance": "10.184.120.15:9100",
  "hostname": "TREMAPPLWRK015",
  "avg_cpu": 2.97,
  "max_cpu": 14.81,
  "avg_memory": 17.98,
  "max_memory": 18.05,
  "avg_disk": 0,
  "max_disk": 0
}
```

## Known Issues

1. **Disk metrics returning 0**: The disk query may need adjustment for the specific filesystem configuration
   - Current query looks for `mountpoint="/"` with `fstype!="tmpfs"`
   - May need to adjust for your environment's mount points

## Files Modified

### Backend
- `backend/app.py`:
  - Added `/api/node-metrics` endpoint
  - Updated `process_metrics_data()` to handle node metrics
  - Added node CPU, memory, disk queries

### Frontend
- `frontend/index.html`:
  - Enhanced container select styling
  - Added node metrics table section
  - Added helper text and section titles

- `frontend/app.js`:
  - Added node metrics fetching and display functions
  - Added sorting for node table
  - Integrated node metrics fetch with pod metrics

## Usage

1. **Select Containers** (optional):
   - Use Ctrl+Click (Windows/Linux) or Cmd+Click (Mac)
   - Selected items show purple background
   - Leave empty for default containers

2. **Choose Date Range**:
   - From Date & Time
   - To Date & Time

3. **Click "Fetch Metrics"**:
   - Pod metrics table appears at top
   - Node metrics table appears below
   - Both tables are sortable

4. **Sort Tables**:
   - Click any column header to sort
   - Click again to reverse sort order
   - Sort indicators: ⇅ ↑ ↓

## Performance Notes

- Pod and node metrics are fetched in parallel for better performance
- Node metrics failures don't block pod metrics display
- Sorting happens client-side for instant response

## Future Enhancements

Consider adding:
- Network I/O metrics for nodes
- More detailed disk metrics (per mount point)
- Historical graphs/sparklines
- Export to CSV functionality
- Real-time auto-refresh option
