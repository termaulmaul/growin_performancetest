# Changelog V4 - Absolute and Percentage Resource Views

## Date: 2025-11-08 (Update 3)

## Summary

Added support for viewing CPU and memory metrics in both absolute values (CPU in millicores, Memory in MB) and percentages (relative to resource limits). Users can toggle between views using a new checkbox.

## Changes Made

### New Feature: Dual View for CPU and Memory

**Problem**: Users wanted to see both absolute resource usage (like Grafana shows in milliseconds/MB) and percentage usage (when limits are configured).

**Solution**:
- Added queries to fetch both absolute values and resource limits
- Calculate percentages based on limits
- Added toggle UI to switch between views
- Display "N/A" for percentage view when no limits are set

### Absolute View (Default)
Shows actual resource consumption:
- **CPU in millicores (m)**: Direct measurement of CPU usage (e.g., 8.10m = 0.0081 CPU cores)
- **Memory in MB**: Actual memory consumption in megabytes

### Percentage View
Shows resource usage relative to configured limits:
- **CPU %**: (CPU usage / CPU limit) × 100
- **Memory %**: (Memory usage / Memory limit) × 100
- Shows "N/A" if pod has no resource limits configured

## Technical Implementation

### Backend Changes (app.py)

#### 1. Updated Metrics Queries

Added new queries for CPU and memory limits:

```python
# CPU in cores (for absolute millicores calculation)
cpu_query = f'rate(container_cpu_usage_seconds_total{{namespace="growin",container=~"{container_filter}"}}[5m])'

# CPU limits
cpu_limit_query = f'container_spec_cpu_quota{{...}} / container_spec_cpu_period{{...}}'

# Memory in bytes (for MB and percentage calculation)
memory_query = f'container_memory_working_set_bytes{{namespace="growin",container=~"{container_filter}"}}'

# Memory limits
memory_limit_query = f'container_spec_memory_limit_bytes{{namespace="growin",container=~"{container_filter}"}}'
```

#### 2. Enhanced Data Processing

Now calculates and stores multiple metrics per pod:

```python
# Absolute values
'avg_cpu_millicores': round(metric['avg'] * 1000, 2),  # Convert cores to millicores
'avg_memory_mb': round(metric['avg'] / (1024**2), 2),  # Convert bytes to MB

# Percentage values (calculated from limits)
if cpu_limit and cpu_limit > 0:
    avg_cpu_percent = round((avg_cpu_cores / cpu_limit) * 100, 2)
else:
    avg_cpu_percent = None  # No limit set

if memory_limit and memory_limit > 0:
    avg_memory_percent = round((avg_memory_bytes / memory_limit) * 100, 2)
else:
    avg_memory_percent = None  # No limit set
```

#### 3. Updated Response Format

API now returns comprehensive metrics:

```json
{
  "pod": "growin-autoorderservice-pt-55547bbfb-hwzvd",
  "node": "tremapplwrk016",

  // Absolute values
  "avg_cpu_millicores": 4.32,
  "min_cpu_millicores": 4.12,
  "max_cpu_millicores": 4.69,
  "avg_memory_mb": 151.16,
  "min_memory_mb": 141.68,
  "max_memory_mb": 157.58,

  // Percentage values (null if no limit)
  "avg_cpu_percent": 0.43,
  "min_cpu_percent": 0.41,
  "max_cpu_percent": 0.47,
  "avg_memory_percent": 14.76,
  "min_memory_percent": 13.84,
  "max_memory_percent": 15.39,

  // Limits
  "cpu_limit_cores": 1.0,
  "memory_limit_mb": 1024.0
}
```

#### 4. Updated Pod Grouping

Grouping logic now handles both absolute and percentage values:
- Aggregates millicores and MB values across pods
- Calculates mean/min/max for percentage values (only for pods with limits)
- Returns null for percentages if no pods in group have limits

### Frontend Changes

#### 1. Added Toggle Control (index.html)

```html
<div class="form-group">
    <label>
        <input type="checkbox" id="showPercentage">
        <span>Show Percentage</span>
    </label>
    <div class="helper-text">Display CPU & Memory as % (requires limits)</div>
</div>
```

#### 2. Updated Table Headers

Headers now support dual data columns:
```html
<th data-column="avg_cpu_millicores"
    data-column-percent="avg_cpu_percent"
    id="avgCpuHeader">Avg CPU (m)</th>
```

- `data-column`: Absolute value field (default)
- `data-column-percent`: Percentage field (when toggle enabled)

#### 3. Dynamic Header Updates (app.js)

```javascript
function updateTableHeaders() {
    const showPercentage = document.getElementById('showPercentage').checked;
    const headers = document.querySelectorAll('#metricsTable th[data-column-percent]');

    headers.forEach(header => {
        if (showPercentage) {
            header.setAttribute('data-column', percentColumn);
            header.textContent = 'Avg CPU (%)';  // Example
        } else {
            header.setAttribute('data-column', absoluteColumn);
            header.textContent = 'Avg CPU (m)';  // Example
        }
    });
}
```

#### 4. Updated Display Logic

```javascript
function displayMetrics(data, storeData = true) {
    const showPercentage = document.getElementById('showPercentage').checked;

    data.forEach(row => {
        if (showPercentage) {
            // Show percentage or 'N/A' if no limit
            avgCpu = row.avg_cpu_percent !== null
                ? row.avg_cpu_percent.toFixed(2)
                : 'N/A';
        } else {
            // Show absolute values
            avgCpu = row.avg_cpu_millicores.toFixed(2);
        }

        // Render cells...
    });
}
```

## Usage Examples

### Example 1: Pod with Resource Limits

**Absolute View:**
- Avg CPU: 8.10 m (millicores)
- Avg Memory: 151.16 MB

**Percentage View:**
- Avg CPU: 0.81% (of 1.0 core limit)
- Avg Memory: 14.76% (of 1024 MB limit)

### Example 2: Pod without Resource Limits

**Absolute View:**
- Avg CPU: 12.50 m
- Avg Memory: 256.00 MB

**Percentage View:**
- Avg CPU: N/A (no CPU limit set)
- Avg Memory: N/A (no memory limit set)

### Example 3: Grouped Pods

When grouping is enabled and percentage view is active:
- Shows average percentage across all pods in the group
- Only includes pods that have limits configured
- Shows "N/A" if no pods in the group have limits

## Understanding the Metrics

### CPU Millicores
- 1 core = 1000 millicores
- 100m = 0.1 cores (10% of one CPU)
- 500m = 0.5 cores (50% of one CPU)
- 1000m = 1.0 cores (one full CPU)

### CPU Percentage
- Calculated as: (CPU usage in cores / CPU limit in cores) × 100
- Example: Using 0.0081 cores with 1 core limit = 0.81%

### Memory MB vs Percentage
- Absolute: Shows actual memory consumption
- Percentage: Shows usage relative to limit
- Example: Using 151.16 MB with 1024 MB limit = 14.76%

## Features

1. **Seamless Toggle**: Switch between views without re-fetching data
2. **Smart Defaults**: Shows absolute values by default (works for all pods)
3. **Graceful Fallback**: Shows "N/A" when limits aren't configured
4. **Sorting Support**: Can sort by either absolute or percentage values
5. **Pod Grouping**: Works with grouped pod view
6. **Real-time Switch**: Toggle updates table instantly

## Testing Results

### Test 1: Fetch Metrics with Limits
```bash
curl -X POST http://localhost:5000/api/metrics \
  -d '{"from_date":"...","containers":["growin-autoorderservice"]}'
```

✅ Returns both absolute and percentage values
✅ Percentages calculated correctly
✅ Limits included in response

### Test 2: Toggle Between Views
✅ Checkbox switches table headers
✅ Data displays correctly in both views
✅ "N/A" shown when no limits configured
✅ Sorting works in both views

### Test 3: Pod Grouping with Percentage View
✅ Grouped percentages calculated correctly
✅ Handles mix of pods with/without limits
✅ Shows "N/A" appropriately

## Modified Files

**backend/app.py**:
- Lines 489-566: Added CPU/memory limit queries and percentage calculations
- Lines 572-639: Updated data combination logic for dual metrics
- Lines 641-715: Updated pod grouping to handle both absolute and percentage values

**frontend/index.html**:
- Lines 286-292: Added "Show Percentage" checkbox
- Lines 310-315: Updated table headers with dual column support

**frontend/app.js**:
- Lines 24-30: Added toggle event listener
- Lines 43-71: Added `updateTableHeaders()` function
- Lines 208-267: Updated `displayMetrics()` to show appropriate values based on toggle

## Benefits

1. **Flexibility**: View data in the most meaningful format for your needs
2. **Better Resource Planning**: Percentages help understand utilization vs limits
3. **Debugging**: Absolute values show actual consumption
4. **Compatibility**: Works with existing dashboards and workflows
5. **No Breaking Changes**: All features are backward compatible

## Known Limitations

1. Percentage view requires resource limits to be configured in Kubernetes
2. If some pods in a group have limits and some don't, grouped percentage shows average of only those with limits
3. CPU shown in millicores (not milliseconds as in some Grafana dashboards)

## Future Enhancements

Consider adding:
- Toggle for CPU cores vs millicores
- Display both absolute and percentage side-by-side
- Resource request metrics (in addition to limits)
- Visual indicators for pods approaching limits
- Configurable "N/A" behavior (show 0 instead)
