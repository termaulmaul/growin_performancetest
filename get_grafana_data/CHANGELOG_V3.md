# Changelog V3 - Surrounding Infrastructure Nodes & Pod Grouping

## Date: 2025-11-08 (Update 2)

## Summary

This update fixes the node metrics table to show surrounding infrastructure nodes (databases, Redis, Redpanda, etc.) instead of Kubernetes worker nodes, and adds pod grouping functionality to consolidate pods by deployment name.

## Changes Made

### 1. Fixed Surrounding Infrastructure Node Filtering

**Problem**: The node metrics table was showing Kubernetes worker nodes (TREMAPPLWRK014, TREMAPPLWRK015, TREMAPPLWRK016) instead of the surrounding infrastructure nodes like databases, Redis, Redpanda, etc.

**Solution**:
- Changed datasource from "Prometheus SF Kubernetes" (ID: 2) to "Prometheus Surrounding" (ID: 1)
- Updated filtering logic to first fetch all node hostnames, identify worker nodes (containing "WRK"), then exclude them from results
- Now correctly filters based on hostname, not IP address

**Results**:
Now showing 19 surrounding infrastructure nodes:
- **Databases**: TREMAPPLEDB028, TREMAPPLEDB027
- **Cache**: TREMAPPLICH021
- **Redpanda**: TREMAPPLRPD017, TREMAPPLRPD018, TREMAPPLRPD019
- **Orchestration**: TREMAPPLOCH020
- **Oracle**: TREMAPPLORA022, TREMAPPLORA023
- **Redis**: TREMAPPLRDS029, TREMAPPLRDS030, TREMAPPLRDS031
- **Load Balancer/Cache**: TREMAPPLELC034, TREMAPPLELC035, TREMAPPLELC036
- **CI/CD**: TREMAPPLCIC033
- **Monitoring**: TREMAPPLMON032
- **SIX Servers**: TREMAPPLSIX047, TREMAPPLSIX048

### 2. Added Pod Grouping Functionality

**Feature**: Ability to consolidate pods by deployment name with aggregated statistics.

**Example**:
```
Without grouping (5 separate rows):
- growin-autoorderservice-pt-55547bbfb-jcwp2
- growin-autoorderservice-pt-55547bbfb-8tk7w
- growin-autoorderservice-pt-55547bbfb-zrcr4
- growin-autoorderservice-pt-55547bbfb-85q6b
- growin-autoorderservice-pt-55547bbfb-h4n9m

With grouping (1 consolidated row):
- growin-autoorderservice-pt
  - pod_count: 5
  - nodes: tremapplwrk014, tremapplwrk015, tremapplwrk016
  - Aggregated CPU/Memory stats across all 5 pods
```

**Implementation Details**:

#### Backend (app.py)

1. Added `group_pod_name()` function:
```python
def group_pod_name(pod_name):
    """Extract base deployment name from pod name
    Examples:
        growin-autoorderservice-pt-55547bbfb-85q6b -> growin-autoorderservice-pt
    """
    parts = pod_name.rsplit('-', 2)
    if len(parts) >= 3:
        return parts[0]
    return pod_name
```

2. Updated `/api/metrics` endpoint:
   - Accepts `group_pods` boolean parameter
   - When enabled, groups pods by deployment name
   - Aggregates statistics:
     - `avg_*`: Mean across all pods in group
     - `min_*`: Minimum across all pods
     - `max_*`: Maximum across all pods
   - Adds `pod_count` field showing number of pods consolidated
   - Combines nodes into comma-separated list

3. Updated node filtering logic in `/api/node-metrics`:
   - First fetches `node_uname_info` to get hostname mapping
   - Identifies worker nodes by checking if "WRK" is in hostname
   - Filters out worker instances when processing CPU, memory, disk metrics
   - Changed to use datasource ID 1 (Prometheus Surrounding)

#### Frontend (index.html)

1. Added "Group Pods" checkbox:
```html
<label style="display: flex; align-items: center;">
    <input type="checkbox" id="groupPods">
    <span>Group Pods</span>
</label>
<div class="helper-text">Consolidate pods by deployment name</div>
```

2. Added conditional "Pod Count" column header:
```html
<th id="podCountHeader" style="display: none;">Pod Count</th>
```
- Only shown when grouping is enabled and data contains pod_count

#### Frontend (app.js)

1. Updated `fetchMetrics()`:
   - Reads checkbox state: `document.getElementById('groupPods').checked`
   - Sends `group_pods` parameter to backend

2. Updated `displayMetrics()`:
   - Conditionally shows/hides pod count column
   - Renders pod count cell when grouping is enabled
   - Shows grouped deployment names instead of full pod names

## Technical Changes

### Modified Files

**backend/app.py**:
- Line 335-336: Changed datasource from ID 2 to ID 1 for node metrics
- Line 340-356: Added hostname mapping and worker node identification logic
- Line 379, 395, 411: Added worker node filtering in CPU, memory, disk processing
- Added `group_pod_name()` function for extracting deployment names
- Updated `/api/metrics` to handle `group_pods` parameter with aggregation logic

**frontend/index.html**:
- Added "Group Pods" checkbox with helper text
- Added conditional "Pod Count" column header

**frontend/app.js**:
- Updated `fetchMetrics()` to send `group_pods` parameter
- Updated `displayMetrics()` to handle pod count display

## Testing Results

### Node Metrics Test
```bash
curl -X POST http://localhost:5000/api/node-metrics \
  -H "Content-Type: application/json" \
  -d '{"from_date":"2025-11-08T04:00:00.000Z","to_date":"2025-11-08T07:00:00.000Z"}'
```

**Result**: ✅ Returns 19 surrounding infrastructure nodes
- No TREMAPPLWRK* worker nodes included
- Shows TREMAPPLEDB, TREMAPPLICH, TREMAPPLRPD, etc.
- Disk metrics now working (showing ~12-83%)

### Pod Grouping Test

**With grouping enabled**:
```bash
curl -X POST http://localhost:5000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"from_date":"...","containers":["growin-autoorderservice"],"group_pods":true}'
```

**Result**: ✅ Returns 1 grouped row
```json
{
  "pod": "growin-autoorderservice-pt",
  "pod_count": 5,
  "node": "tremapplwrk014, tremapplwrk015, tremapplwrk016",
  "avg_cpu": 0.94,
  "min_cpu": 0.41,
  "max_cpu": 1.92,
  "avg_memory": 222.75,
  "min_memory": 141.68,
  "max_memory": 502.17
}
```

**Without grouping**:
```bash
curl -X POST http://localhost:5000/api/metrics \
  -d '{"from_date":"...","containers":["growin-autoorderservice"],"group_pods":false}'
```

**Result**: ✅ Returns 5 individual rows
- growin-autoorderservice-pt-55547bbfb-jcwp2
- growin-autoorderservice-pt-55547bbfb-8tk7w
- growin-autoorderservice-pt-55547bbfb-zrcr4
- (and 2 more...)

## Usage

### Viewing Surrounding Infrastructure Nodes
1. Select date range and click "Fetch Metrics"
2. Scroll down to "Surrounding Resource Utilization (Nodes/Hosts)" section
3. Table shows databases, Redis, Redpanda, cache servers, etc.
4. **No worker nodes** (TREMAPPLWRK*) are shown

### Using Pod Grouping
1. Check the "Group Pods" checkbox
2. Select containers and date range
3. Click "Fetch Metrics"
4. Pods are consolidated by deployment name
5. "Pod Count" column shows number of pods in each group
6. Node column shows all nodes where grouped pods are running
7. Statistics are aggregated across all pods in the group

## Key Improvements

1. **Correct Node Filtering**: Now using the right datasource and filtering logic to show only surrounding infrastructure
2. **Pod Grouping**: Reduces clutter when multiple replicas of the same service are running
3. **Better Aggregation**: Accurately calculates mean, min, max across grouped pods
4. **User Control**: Toggle grouping on/off as needed
5. **Visual Feedback**: Pod count column clearly shows consolidation

## Breaking Changes

None - all features are backward compatible. Grouping is off by default.

## Known Issues

None identified. Both features tested and working correctly.
