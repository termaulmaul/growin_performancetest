// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// Global data storage for sorting
let currentData = [];
let currentSort = { column: null, direction: 'asc' };
let currentNodeData = [];
let currentNodeSort = { column: null, direction: 'asc' };
let currentRequestData = [];
let currentRequestSort = { column: null, direction: 'asc' };

// Initialize default dates (last 3 hours) and fetch containers
window.addEventListener('DOMContentLoaded', () => {
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    document.getElementById('fromDate').value = formatDateTimeLocal(threeHoursAgo);
    document.getElementById('toDate').value = formatDateTimeLocal(now);

    // Fetch available containers
    fetchContainers();

    // Add click handlers for sortable columns
    initializeSorting();

    // Add toggle handler for percentage view
    document.getElementById('showPercentage').addEventListener('change', () => {
        updateTableHeaders();
        if (currentData.length > 0) {
            displayMetrics(currentData, false);
        }
    });
});

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function updateTableHeaders() {
    const showPercentage = document.getElementById('showPercentage').checked;
    const headers = document.querySelectorAll('#metricsTable th[data-column-percent]');

    headers.forEach(header => {
        const absoluteColumn = header.getAttribute('data-column');
        const percentColumn = header.getAttribute('data-column-percent');

        if (showPercentage) {
            header.setAttribute('data-column', percentColumn);
            // Update header text
            if (header.id === 'avgCpuHeader') header.textContent = 'Avg CPU (%)';
            else if (header.id === 'minCpuHeader') header.textContent = 'Min CPU (%)';
            else if (header.id === 'maxCpuHeader') header.textContent = 'Max CPU (%)';
            else if (header.id === 'avgMemoryHeader') header.textContent = 'Avg Memory (%)';
            else if (header.id === 'minMemoryHeader') header.textContent = 'Min Memory (%)';
            else if (header.id === 'maxMemoryHeader') header.textContent = 'Max Memory (%)';
        } else {
            header.setAttribute('data-column', absoluteColumn);
            // Update header text
            if (header.id === 'avgCpuHeader') header.textContent = 'Avg CPU (m)';
            else if (header.id === 'minCpuHeader') header.textContent = 'Min CPU (m)';
            else if (header.id === 'maxCpuHeader') header.textContent = 'Max CPU (m)';
            else if (header.id === 'avgMemoryHeader') header.textContent = 'Avg Memory (MB)';
            else if (header.id === 'minMemoryHeader') header.textContent = 'Min Memory (MB)';
            else if (header.id === 'maxMemoryHeader') header.textContent = 'Max Memory (MB)';
        }
    });
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.classList.add('active');

    setTimeout(() => {
        errorMsg.classList.remove('active');
    }, 5000);
}

function hideError() {
    document.getElementById('errorMsg').classList.remove('active');
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
    document.getElementById('fetchBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading').classList.remove('active');
    document.getElementById('fetchBtn').disabled = false;
}

async function fetchContainers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/containers?namespace=growin`);

        if (!response.ok) {
            console.error('Failed to fetch containers');
            return;
        }

        const result = await response.json();
        const select = document.getElementById('containers');

        // Clear loading message
        select.innerHTML = '';

        // Add containers as options
        result.containers.forEach(container => {
            const option = document.createElement('option');
            option.value = container;
            option.textContent = container;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error fetching containers:', error);
        const select = document.getElementById('containers');
        select.innerHTML = '<option value="">Failed to load containers</option>';
    }
}

function initializeSorting() {
    const headers = document.querySelectorAll('th.sortable');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            const type = header.dataset.type;

            // Toggle sort direction
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                // Default to descending for numeric columns (show highest values first)
                currentSort.direction = type === 'number' ? 'desc' : 'asc';
            }

            // Update header classes
            headers.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            header.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');

            // Sort and display data
            sortAndDisplayData(column, type, currentSort.direction);
        });
    });
}

function sortAndDisplayData(column, type, direction) {
    const sortedData = [...currentData].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle different data types
        if (type === 'number') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }

        if (direction === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });

    displayMetrics(sortedData, false);
}

function displayMetrics(data, storeData = true) {
    const tbody = document.getElementById('metricsBody');
    const table = document.getElementById('metricsTable');
    const noData = document.getElementById('noData');
    const podCountHeader = document.getElementById('podCountHeader');
    const groupPods = document.getElementById('groupPods').checked;

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        table.style.display = 'none';
        noData.style.display = 'block';
        noData.textContent = 'No metrics data found for the selected time range.';
        document.getElementById('exportButtonsContainer').style.display = 'none';
        return;
    }

    // Store data for sorting if this is a new dataset
    if (storeData) {
        currentData = data;
    }

    // Show/hide pod count column based on grouping
    if (groupPods && data.length > 0 && data[0].pod_count !== undefined) {
        podCountHeader.style.display = '';
    } else {
        podCountHeader.style.display = 'none';
    }

    noData.style.display = 'none';
    table.style.display = 'table';
    updateExportAllButton();

    const showPercentage = document.getElementById('showPercentage').checked;

    data.forEach(row => {
        const tr = document.createElement('tr');

        const podCountCell = (groupPods && row.pod_count !== undefined)
            ? `<td class="metric-value">${row.pod_count}</td>`
            : '';

        // Choose which fields to display based on percentage toggle
        let avgCpu, minCpu, maxCpu, avgMemory, minMemory, maxMemory;
        let avgCpuClass = 'metric-value cpu-value';
        let minCpuClass = 'metric-value cpu-value';
        let maxCpuClass = 'metric-value cpu-value';
        let avgMemoryClass = 'metric-value memory-value';
        let minMemoryClass = 'metric-value memory-value';
        let maxMemoryClass = 'metric-value memory-value';

        if (showPercentage) {
            // Show percentages (or N/A if not available)
            avgCpu = row.avg_cpu_percent !== null && row.avg_cpu_percent !== undefined
                ? row.avg_cpu_percent.toFixed(2)
                : 'N/A';
            minCpu = row.min_cpu_percent !== null && row.min_cpu_percent !== undefined
                ? row.min_cpu_percent.toFixed(2)
                : 'N/A';
            maxCpu = row.max_cpu_percent !== null && row.max_cpu_percent !== undefined
                ? row.max_cpu_percent.toFixed(2)
                : 'N/A';
            avgMemory = row.avg_memory_percent !== null && row.avg_memory_percent !== undefined
                ? row.avg_memory_percent.toFixed(2)
                : 'N/A';
            minMemory = row.min_memory_percent !== null && row.min_memory_percent !== undefined
                ? row.min_memory_percent.toFixed(2)
                : 'N/A';
            maxMemory = row.max_memory_percent !== null && row.max_memory_percent !== undefined
                ? row.max_memory_percent.toFixed(2)
                : 'N/A';

            // Apply highlighting for high values (only when showing percentages)
            if (row.avg_cpu_percent > 50) avgCpuClass += ' high-cpu';
            if (row.min_cpu_percent > 50) minCpuClass += ' high-cpu';
            if (row.max_cpu_percent > 50) maxCpuClass += ' high-cpu';
            if (row.avg_memory_percent > 60) avgMemoryClass += ' high-memory';
            if (row.min_memory_percent > 60) minMemoryClass += ' high-memory';
            if (row.max_memory_percent > 60) maxMemoryClass += ' high-memory';
        } else {
            // Show absolute values
            avgCpu = row.avg_cpu_millicores !== undefined ? row.avg_cpu_millicores.toFixed(2) : '0.00';
            minCpu = row.min_cpu_millicores !== undefined ? row.min_cpu_millicores.toFixed(2) : '0.00';
            maxCpu = row.max_cpu_millicores !== undefined ? row.max_cpu_millicores.toFixed(2) : '0.00';
            avgMemory = row.avg_memory_mb !== undefined ? row.avg_memory_mb.toFixed(2) : '0.00';
            minMemory = row.min_memory_mb !== undefined ? row.min_memory_mb.toFixed(2) : '0.00';
            maxMemory = row.max_memory_mb !== undefined ? row.max_memory_mb.toFixed(2) : '0.00';
        }

        tr.innerHTML = `
            <td class="pod-name">${row.node || 'Unknown'}</td>
            <td class="pod-name">${row.pod}</td>
            ${podCountCell}
            <td class="${avgCpuClass}">${avgCpu}</td>
            <td class="${minCpuClass}">${minCpu}</td>
            <td class="${maxCpuClass}">${maxCpu}</td>
            <td class="${avgMemoryClass}">${avgMemory}</td>
            <td class="${minMemoryClass}">${minMemory}</td>
            <td class="${maxMemoryClass}">${maxMemory}</td>
        `;

        tbody.appendChild(tr);
    });
}

function displayNodeMetrics(data, storeData = true) {
    const tbody = document.getElementById('nodeMetricsBody');
    const table = document.getElementById('nodeMetricsTable');
    const noData = document.getElementById('noNodeData');
    const title = document.getElementById('nodeTableTitle');

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        table.style.display = 'none';
        noData.style.display = 'block';
        title.style.display = 'none';
        noData.textContent = 'No node metrics data found for the selected time range.';
        document.getElementById('exportNodeButtonsContainer').style.display = 'none';
        return;
    }

    // Store data for sorting if this is a new dataset
    if (storeData) {
        currentNodeData = data;
    }

    noData.style.display = 'none';
    title.style.display = 'block';
    table.style.display = 'table';
    updateExportAllButton();

    data.forEach(row => {
        const tr = document.createElement('tr');

        // Apply highlighting classes based on thresholds
        const avgCpuClass = row.avg_cpu > 50 ? 'metric-value cpu-value high-cpu' : 'metric-value cpu-value';
        const maxCpuClass = row.max_cpu > 50 ? 'metric-value cpu-value high-cpu' : 'metric-value cpu-value';
        const avgMemoryClass = row.avg_memory > 60 ? 'metric-value memory-value high-memory' : 'metric-value memory-value';
        const maxMemoryClass = row.max_memory > 60 ? 'metric-value memory-value high-memory' : 'metric-value memory-value';

        tr.innerHTML = `
            <td class="pod-name">${row.instance}</td>
            <td class="pod-name">${row.hostname}</td>
            <td class="${avgCpuClass}">${row.avg_cpu.toFixed(2)}</td>
            <td class="${maxCpuClass}">${row.max_cpu.toFixed(2)}</td>
            <td class="${avgMemoryClass}">${row.avg_memory.toFixed(2)}</td>
            <td class="${maxMemoryClass}">${row.max_memory.toFixed(2)}</td>
            <td class="metric-value cpu-value">${row.avg_disk.toFixed(2)}</td>
            <td class="metric-value cpu-value">${row.max_disk.toFixed(2)}</td>
        `;

        tbody.appendChild(tr);
    });

    // Re-initialize sorting for node table
    initializeNodeSorting();
}

function initializeNodeSorting() {
    const headers = document.querySelectorAll('#nodeMetricsTable th.sortable');

    headers.forEach(header => {
        // Remove old listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        newHeader.addEventListener('click', () => {
            const column = newHeader.dataset.column;
            const type = newHeader.dataset.type;

            // Toggle sort direction
            if (currentNodeSort.column === column) {
                currentNodeSort.direction = currentNodeSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentNodeSort.column = column;
                // Default to descending for numeric columns (show highest values first)
                currentNodeSort.direction = type === 'number' ? 'desc' : 'asc';
            }

            // Update header classes - query for current headers, not old ones
            const currentHeaders = document.querySelectorAll('#nodeMetricsTable th.sortable');
            currentHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            newHeader.classList.add(currentNodeSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');

            // Sort and display data
            sortAndDisplayNodeData(column, type, currentNodeSort.direction);
        });
    });
}

function sortAndDisplayNodeData(column, type, direction) {
    const sortedData = [...currentNodeData].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle different data types
        if (type === 'number') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }

        if (direction === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });

    displayNodeMetrics(sortedData, false);
}

async function fetchNodeMetrics(fromDateISO, toDateISO) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/node-metrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_date: fromDateISO,
                to_date: toDateISO
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch node metrics');
        }

        const result = await response.json();

        // Reset sort state when fetching new data
        currentNodeSort = { column: null, direction: 'asc' };
        document.querySelectorAll('#nodeMetricsTable th.sortable').forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
        });

        displayNodeMetrics(result.data);

    } catch (error) {
        console.error('Error fetching node metrics:', error);
        // Don't show error for node metrics, just hide the table
        document.getElementById('nodeMetricsTable').style.display = 'none';
        document.getElementById('noNodeData').style.display = 'block';
        document.getElementById('nodeTableTitle').style.display = 'none';
    }
}

async function fetchMetrics() {
    hideError();

    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        showError('Please select both from and to dates');
        return;
    }

    // Validate date range
    const fromDateTime = new Date(fromDate);
    const toDateTime = new Date(toDate);

    if (fromDateTime >= toDateTime) {
        showError('From date must be before To date');
        return;
    }

    // Get selected containers
    const containersSelect = document.getElementById('containers');
    const selectedContainers = Array.from(containersSelect.selectedOptions).map(option => option.value);

    // Get grouping preference
    const groupPods = document.getElementById('groupPods').checked;

    showLoading();

    try {
        // Convert to ISO format
        const fromDateISO = new Date(fromDate).toISOString();
        const toDateISO = new Date(toDate).toISOString();

        const response = await fetch(`${API_BASE_URL}/api/metrics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_date: fromDateISO,
                to_date: toDateISO,
                containers: selectedContainers,
                group_pods: groupPods
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch metrics');
        }

        const result = await response.json();

        // Reset sort state when fetching new data
        currentSort = { column: null, direction: 'asc' };
        document.querySelectorAll('th.sortable').forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
        });

        displayMetrics(result.data);

        // Also fetch node metrics in parallel
        fetchNodeMetrics(fromDateISO, toDateISO);

    } catch (error) {
        console.error('Error fetching metrics:', error);
        showError(`Error: ${error.message}`);

        // Show no data message
        document.getElementById('metricsTable').style.display = 'none';
        document.getElementById('noData').style.display = 'block';
        document.getElementById('noData').textContent = 'Failed to fetch metrics. Please check your connection and try again.';
    } finally {
        hideLoading();
    }
}

// Allow Enter key to trigger fetch
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchMetrics();
    }
});

// Export Functions
function exportToExcel(tableType) {
    const showPercentage = document.getElementById('showPercentage').checked;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    let data, headers, filename;

    if (tableType === 'pods') {
        data = currentData;
        filename = `pod-metrics-${timestamp}.xlsx`;

        // Build headers based on current view
        const groupPods = document.getElementById('groupPods').checked;
        headers = ['Worker / Node', 'Pod / Deployment Name'];

        if (groupPods) {
            headers.push('Pod Count');
        }

        if (showPercentage) {
            headers.push('Avg CPU (%)', 'Min CPU (%)', 'Max CPU (%)', 'Avg Memory (%)', 'Min Memory (%)', 'Max Memory (%)');
        } else {
            headers.push('Avg CPU (m)', 'Min CPU (m)', 'Max CPU (m)', 'Avg Memory (MB)', 'Min Memory (MB)', 'Max Memory (MB)');
        }

    } else if (tableType === 'request') {
        data = currentRequestData;
        filename = `request-metrics-${timestamp}.xlsx`;
        headers = data.length > 0 ? Object.keys(data[0]) : [];
    } else {
        data = currentNodeData;
        filename = `node-metrics-${timestamp}.xlsx`;
        headers = ['IP Address / Instance', 'Hostname', 'Avg CPU (%)', 'Max CPU (%)', 'Avg Memory (%)', 'Max Memory (%)', 'Avg Disk (%)', 'Max Disk (%)'];
    }

    if (!data || data.length === 0) {
        showError('No data available to export');
        return;
    }

    // Prepare data for Excel
    const excelData = [];
    excelData.push(headers);

    data.forEach(row => {
        const rowData = [];

        if (tableType === 'pods') {
            const groupPods = document.getElementById('groupPods').checked;
            rowData.push(row.node || '');
            rowData.push(row.pod || '');

            if (groupPods) {
                rowData.push(row.pod_count || '');
            }

            if (showPercentage) {
                rowData.push(row.avg_cpu_percent !== null && row.avg_cpu_percent !== undefined ? row.avg_cpu_percent : 'N/A');
                rowData.push(row.min_cpu_percent !== null && row.min_cpu_percent !== undefined ? row.min_cpu_percent : 'N/A');
                rowData.push(row.max_cpu_percent !== null && row.max_cpu_percent !== undefined ? row.max_cpu_percent : 'N/A');
                rowData.push(row.avg_memory_percent !== null && row.avg_memory_percent !== undefined ? row.avg_memory_percent : 'N/A');
                rowData.push(row.min_memory_percent !== null && row.min_memory_percent !== undefined ? row.min_memory_percent : 'N/A');
                rowData.push(row.max_memory_percent !== null && row.max_memory_percent !== undefined ? row.max_memory_percent : 'N/A');
            } else {
                rowData.push(row.avg_cpu_millicores || 0);
                rowData.push(row.min_cpu_millicores || 0);
                rowData.push(row.max_cpu_millicores || 0);
                rowData.push(row.avg_memory_mb || 0);
                rowData.push(row.min_memory_mb || 0);
                rowData.push(row.max_memory_mb || 0);
            }
        } else if (tableType === 'request') {
            // For request metrics, dynamically add all columns
            headers.forEach(header => {
                rowData.push(row[header] !== undefined ? row[header] : '');
            });
        } else {
            rowData.push(row.instance || '');
            rowData.push(row.hostname || '');
            rowData.push(row.avg_cpu || 0);
            rowData.push(row.max_cpu || 0);
            rowData.push(row.avg_memory || 0);
            rowData.push(row.max_memory || 0);
            rowData.push(row.avg_disk || 0);
            rowData.push(row.max_disk || 0);
        }

        excelData.push(rowData);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Auto-size columns
    const colWidths = headers.map((_, i) => {
        const maxLength = Math.max(
            ...excelData.map(row => String(row[i] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
    });
    ws['!cols'] = colWidths;

    // Apply conditional formatting (cell styling)
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Determine column indices for CPU and Memory
    let cpuStartCol, memStartCol;
    if (tableType === 'pods') {
        const groupPods = document.getElementById('groupPods').checked;
        const baseOffset = groupPods ? 2 : 1; // subtract 1 since we're 0-indexed after node column
        cpuStartCol = baseOffset + 1; // Avg CPU, Min CPU, Max CPU
        memStartCol = baseOffset + 4; // Avg Mem, Min Mem, Max Mem
    } else {
        cpuStartCol = 2; // Avg CPU, Max CPU (columns 2 and 3)
        memStartCol = 4; // Avg Mem, Max Mem (columns 4 and 5)
    }

    // Apply styling to cells that exceed thresholds
    for (let R = range.s.r + 1; R <= range.e.r; ++R) { // Start from row 1 (skip header)
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellAddress];

            if (cell && typeof cell.v === 'number') {
                const cellValue = cell.v;
                let shouldHighlight = false;

                if (tableType === 'pods' && showPercentage) {
                    // For pods, only highlight when showing percentages
                    if (C >= cpuStartCol && C < cpuStartCol + 3 && cellValue > 50) {
                        shouldHighlight = true;
                    } else if (C >= memStartCol && C < memStartCol + 3 && cellValue > 60) {
                        shouldHighlight = true;
                    }
                } else if (tableType === 'nodes') {
                    // For nodes, always in percentage
                    if ((C === 2 || C === 3) && cellValue > 50) {
                        shouldHighlight = true;
                    } else if ((C === 4 || C === 5) && cellValue > 60) {
                        shouldHighlight = true;
                    }
                }

                if (shouldHighlight) {
                    cell.s = {
                        fill: { fgColor: { rgb: "FFCCCC" } },
                        font: { bold: true, color: { rgb: "CC0000" } }
                    };
                }
            }
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, tableType === 'pods' ? 'Pod Metrics' : 'Node Metrics');
    XLSX.writeFile(wb, filename);
}

function exportToPDF(tableType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const showPercentage = document.getElementById('showPercentage').checked;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

    let data, headers, filename, title;

    if (tableType === 'pods') {
        data = currentData;
        filename = `pod-metrics-${timestamp}.pdf`;
        title = 'Pod / Container Metrics';

        // Build headers based on current view
        const groupPods = document.getElementById('groupPods').checked;
        headers = ['Worker / Node', 'Pod Name'];

        if (groupPods) {
            headers.push('Pod Count');
        }

        if (showPercentage) {
            headers.push('Avg CPU (%)', 'Min CPU (%)', 'Max CPU (%)', 'Avg Mem (%)', 'Min Mem (%)', 'Max Mem (%)');
        } else {
            headers.push('Avg CPU (m)', 'Min CPU (m)', 'Max CPU (m)', 'Avg Mem (MB)', 'Min Mem (MB)', 'Max Mem (MB)');
        }

    } else if (tableType === 'request') {
        data = currentRequestData;
        filename = `request-metrics-${timestamp}.pdf`;
        title = 'Request Metrics';
        headers = data.length > 0 ? Object.keys(data[0]) : [];
    } else {
        data = currentNodeData;
        filename = `node-metrics-${timestamp}.pdf`;
        title = 'Node / Host Resource Utilization';
        headers = ['IP Address', 'Hostname', 'Avg CPU (%)', 'Max CPU (%)', 'Avg Mem (%)', 'Max Mem (%)', 'Avg Disk (%)', 'Max Disk (%)'];
    }

    if (!data || data.length === 0) {
        showError('No data available to export');
        return;
    }

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);

    // Add timestamp
    doc.setFontSize(10);
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    doc.text(`Date Range: ${fromDate} to ${toDate}`, 14, 22);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 27);

    // Prepare table data
    const tableData = [];

    data.forEach(row => {
        const rowData = [];

        if (tableType === 'pods') {
            const groupPods = document.getElementById('groupPods').checked;
            rowData.push(row.node || '');
            rowData.push(row.pod || '');

            if (groupPods) {
                rowData.push(row.pod_count || '');
            }

            if (showPercentage) {
                rowData.push(row.avg_cpu_percent !== null && row.avg_cpu_percent !== undefined ? row.avg_cpu_percent : 'N/A');
                rowData.push(row.min_cpu_percent !== null && row.min_cpu_percent !== undefined ? row.min_cpu_percent : 'N/A');
                rowData.push(row.max_cpu_percent !== null && row.max_cpu_percent !== undefined ? row.max_cpu_percent : 'N/A');
                rowData.push(row.avg_memory_percent !== null && row.avg_memory_percent !== undefined ? row.avg_memory_percent : 'N/A');
                rowData.push(row.min_memory_percent !== null && row.min_memory_percent !== undefined ? row.min_memory_percent : 'N/A');
                rowData.push(row.max_memory_percent !== null && row.max_memory_percent !== undefined ? row.max_memory_percent : 'N/A');
            } else {
                rowData.push(row.avg_cpu_millicores || 0);
                rowData.push(row.min_cpu_millicores || 0);
                rowData.push(row.max_cpu_millicores || 0);
                rowData.push(row.avg_memory_mb || 0);
                rowData.push(row.min_memory_mb || 0);
                rowData.push(row.max_memory_mb || 0);
            }
        } else if (tableType === 'request') {
            // For request metrics, dynamically add all columns
            headers.forEach(header => {
                rowData.push(row[header] !== undefined ? row[header] : '');
            });
        } else {
            rowData.push(row.instance || '');
            rowData.push(row.hostname || '');
            rowData.push(row.avg_cpu || 0);
            rowData.push(row.max_cpu || 0);
            rowData.push(row.avg_memory || 0);
            rowData.push(row.max_memory || 0);
            rowData.push(row.avg_disk || 0);
            rowData.push(row.max_disk || 0);
        }

        tableData.push(rowData);
    });

    // Determine column indices for CPU and Memory based on table type
    let cpuStartCol, memStartCol;
    if (tableType === 'pods') {
        const groupPods = document.getElementById('groupPods').checked;
        const baseOffset = groupPods ? 3 : 2; // node, pod, [pod_count]
        cpuStartCol = baseOffset; // Avg CPU, Min CPU, Max CPU
        memStartCol = baseOffset + 3; // Avg Mem, Min Mem, Max Mem
    } else if (tableType === 'nodes') {
        cpuStartCol = 2; // Avg CPU, Max CPU (columns 2 and 3)
        memStartCol = 4; // Avg Mem, Max Mem (columns 4 and 5)
    }

    // Generate table with conditional formatting
    doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 32,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [102, 126, 234], textColor: 255 },
        alternateRowStyles: { fillColor: [249, 249, 249] },
        margin: { top: 32 },
        didParseCell: function(data) {
            // Only apply highlighting to body cells (not headers)
            if (data.section === 'body') {
                const colIndex = data.column.index;
                const cellValue = parseFloat(data.cell.raw);

                // Apply highlighting based on thresholds
                if (tableType === 'pods' && showPercentage) {
                    // For pods, only highlight when showing percentages
                    if (colIndex >= cpuStartCol && colIndex < cpuStartCol + 3 && cellValue > 50) {
                        // CPU columns
                        data.cell.styles.fillColor = [255, 204, 204];
                        data.cell.styles.textColor = [204, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    } else if (colIndex >= memStartCol && colIndex < memStartCol + 3 && cellValue > 60) {
                        // Memory columns
                        data.cell.styles.fillColor = [255, 204, 204];
                        data.cell.styles.textColor = [204, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    }
                } else if (tableType === 'nodes') {
                    // For nodes, always in percentage
                    if ((colIndex === 2 || colIndex === 3) && cellValue > 50) {
                        // CPU columns (Avg CPU, Max CPU)
                        data.cell.styles.fillColor = [255, 204, 204];
                        data.cell.styles.textColor = [204, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    } else if ((colIndex === 4 || colIndex === 5) && cellValue > 60) {
                        // Memory columns (Avg Mem, Max Mem)
                        data.cell.styles.fillColor = [255, 204, 204];
                        data.cell.styles.textColor = [204, 0, 0];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            }
        }
    });

    doc.save(filename);
}

// Handle HTML File Upload
function handleFileUpload(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Show file info
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.textContent = `Loading: ${file.name}...`;
    fileInfo.style.display = 'block';

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const htmlContent = e.target.result;
            const parsedData = parseHTMLTable(htmlContent);

            if (parsedData && parsedData.data.length > 0) {
                currentRequestData = parsedData.data;
                displayRequestMetrics(parsedData.headers, parsedData.data);
                fileInfo.textContent = `✓ Loaded: ${file.name} (${parsedData.data.length} rows)`;
                fileInfo.style.color = '#28a745';
            } else {
                throw new Error('No table data found in HTML file');
            }
        } catch (error) {
            console.error('Error parsing HTML:', error);
            fileInfo.textContent = `✗ Error: ${error.message}`;
            fileInfo.style.color = '#dc3545';
            showError('Failed to parse HTML file. Please ensure it contains a valid table.');
        }
    };

    reader.onerror = function() {
        fileInfo.textContent = '✗ Error reading file';
        fileInfo.style.color = '#dc3545';
        showError('Failed to read file');
    };

    reader.readAsText(file);
}

// Parse HTML file and extract table data
function parseHTMLTable(htmlContent) {
    // Create a temporary DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Find all tables in the document
    const allTables = doc.querySelectorAll('table');

    if (allTables.length === 0) {
        console.error('HTML content:', htmlContent.substring(0, 500));
        throw new Error('No table found in HTML file. Please ensure the file contains a <table> element.');
    }

    console.log('Found tables:', allTables.length);

    // We'll combine data from all tables
    let allHeaders = [];
    let allData = [];

    // Process each table
    allTables.forEach((table, tableIndex) => {
        console.log(`Processing table ${tableIndex + 1}:`, table);

    // Extract headers - try multiple approaches
    const headers = [];
    let headerRow = table.querySelector('thead tr');

    if (!headerRow) {
        // Try to find first row with th elements
        headerRow = table.querySelector('tr:has(th)');
    }

    if (!headerRow) {
        // Just use the first row
        headerRow = table.querySelector('tr');
    }

    if (headerRow) {
        const headerCells = headerRow.querySelectorAll('th, td');
        console.log('Header cells found:', headerCells.length);
        headerCells.forEach((cell, index) => {
            const headerText = cell.textContent.trim();
            // Include empty headers with a default name
            if (headerText) {
                headers.push(headerText);
            } else {
                headers.push(`Metric`); // Default name for empty first column (usually metric name)
            }
        });
    }

    if (headers.length === 0) {
        throw new Error('No table headers found. Please ensure the table has header rows.');
    }

    console.log('Headers extracted:', headers);

    // Extract data rows
    const data = [];
    let rows = [];

    // Get all tr elements from the table
    const allRows = table.querySelectorAll('tr');

    // Filter out header rows (rows that contain th elements)
    allRows.forEach(row => {
        const hasTh = row.querySelector('th');
        if (!hasTh) {
            rows.push(row);
        }
    });

    console.log('Total rows found:', allRows.length);
    console.log('Data rows (excluding headers):', rows.length);

    let startIndex = 0;

    for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td, th');

        console.log(`Row ${i}: ${cells.length} cells found`);

        if (cells.length > 0) {
            const rowData = {};

            // Handle rows that might have different column counts
            for (let j = 0; j < Math.max(cells.length, headers.length); j++) {
                const headerKey = headers[j] || `column_${j}`;
                const cell = cells[j];

                if (cell) {
                    let cellValue = cell.textContent.trim();

                    // Try to parse as number if it looks like one
                    const cleanValue = cellValue.replace(/[,%\s]/g, '');
                    const numValue = parseFloat(cleanValue);
                    if (!isNaN(numValue) && cleanValue.match(/^[\d.,-]+$/)) {
                        rowData[headerKey] = numValue;
                    } else {
                        rowData[headerKey] = cellValue;
                    }
                } else {
                    rowData[headerKey] = '';
                }
            }

            // Only add row if it has at least one non-empty value
            const hasData = Object.values(rowData).some(val => {
                if (typeof val === 'number') return true;
                return val !== '' && val !== null && val !== undefined;
            });

            if (hasData) {
                console.log('Adding row:', rowData);
                data.push(rowData);
            } else {
                console.log('Skipping empty row');
            }
        }
    }

        console.log(`Table ${tableIndex + 1}: Data rows extracted:`, data.length);

        // Store headers from first table or if they're different
        if (allHeaders.length === 0) {
            allHeaders = [...headers];
        }

        // Add all data rows to combined dataset
        allData = allData.concat(data);
    }); // End of forEach table

    console.log('Total data rows from all tables:', allData.length);

    if (allData.length === 0) {
        console.error('Failed to extract any data rows from any table. Check console for details.');
        throw new Error('No data rows found in tables. The tables appear to be empty or have formatting issues. Check browser console (F12) for details.');
    }

    return { headers: allHeaders, data: allData };
}

// Display Request Metrics
function displayRequestMetrics(headers, data) {
    const thead = document.getElementById('requestMetricsTableHead');
    const tbody = document.getElementById('requestMetricsBody');
    const table = document.getElementById('requestMetricsTable');
    const title = document.getElementById('requestTableTitle');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        table.style.display = 'none';
        title.style.display = 'none';
        updateExportAllButton();
        return;
    }

    // Create table headers
    const headerRow = document.createElement('tr');
    headers.forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header;
        th.className = 'sortable';
        th.dataset.column = header;
        th.dataset.type = 'string'; // Default to string, will handle numbers dynamically
        th.dataset.index = index;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Display data rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            const value = row[header];

            if (typeof value === 'number') {
                td.textContent = value.toFixed(2);
                td.className = 'metric-value';
            } else {
                td.textContent = value || '';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    title.style.display = 'block';
    table.style.display = 'table';
    updateExportAllButton();

    // Initialize sorting for request table
    initializeRequestSorting();
}

// Initialize sorting for request metrics table
function initializeRequestSorting() {
    const headers = document.querySelectorAll('#requestMetricsTable th.sortable');

    headers.forEach(header => {
        // Remove old listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        newHeader.addEventListener('click', () => {
            const column = newHeader.dataset.column;

            // Determine if column is numeric based on data
            const isNumeric = currentRequestData.every(row =>
                typeof row[column] === 'number' || !isNaN(parseFloat(row[column]))
            );
            const type = isNumeric ? 'number' : 'string';

            // Toggle sort direction
            if (currentRequestSort.column === column) {
                currentRequestSort.direction = currentRequestSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentRequestSort.column = column;
                currentRequestSort.direction = type === 'number' ? 'desc' : 'asc';
            }

            // Update header classes
            const currentHeaders = document.querySelectorAll('#requestMetricsTable th.sortable');
            currentHeaders.forEach(h => {
                h.classList.remove('sort-asc', 'sort-desc');
            });

            newHeader.classList.add(currentRequestSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');

            // Sort and display data
            sortAndDisplayRequestData(column, type, currentRequestSort.direction);
        });
    });
}

// Sort request data
function sortAndDisplayRequestData(column, type, direction) {
    const sortedData = [...currentRequestData].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        // Handle different data types
        if (type === 'number') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }

        if (direction === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
    });

    // Get headers from first data row
    const headers = currentRequestData.length > 0 ? Object.keys(currentRequestData[0]) : [];
    displayRequestMetrics(headers, sortedData);
}

// Update Export All Button visibility
function updateExportAllButton() {
    const hasK6Data = currentRequestData.length > 0;
    const hasPodData = currentData.length > 0;
    const hasNodeData = currentNodeData.length > 0;

    const exportAllContainer = document.getElementById('exportAllButtonsContainer');

    // Show export all button if we have any data
    if (hasPodData || hasNodeData || hasK6Data) {
        exportAllContainer.style.display = 'flex';
    } else {
        exportAllContainer.style.display = 'none';
    }
}

// Export all metrics to Excel
function exportAllToExcel() {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `all-metrics-${timestamp}.xlsx`;

    const wb = XLSX.utils.book_new();

    // Get date range from form
    const fromDate = document.getElementById('fromDate').value || 'N/A';
    const toDate = document.getElementById('toDate').value || 'N/A';

    // Add date range as first sheet
    const dateData = [
        ['Metrics Export'],
        ['Start Date & Time', fromDate],
        ['End Date & Time', toDate],
        ['Generated', new Date().toLocaleString()]
    ];
    const dateSheet = XLSX.utils.aoa_to_sheet(dateData);
    XLSX.utils.book_append_sheet(wb, dateSheet, 'Export Info');

    // Add K6 metrics if available
    if (currentRequestData.length > 0) {
        const k6Headers = Object.keys(currentRequestData[0]);
        const k6Data = [k6Headers];
        currentRequestData.forEach(row => {
            const rowData = k6Headers.map(header => row[header] !== undefined ? row[header] : '');
            k6Data.push(rowData);
        });
        const k6Sheet = XLSX.utils.aoa_to_sheet(k6Data);
        XLSX.utils.book_append_sheet(wb, k6Sheet, 'K6 Metrics');
    }

    // Add Pod metrics if available
    if (currentData.length > 0) {
        const showPercentage = document.getElementById('showPercentage').checked;
        const groupPods = document.getElementById('groupPods').checked;

        const podHeaders = ['Worker / Node', 'Pod / Deployment Name'];
        if (groupPods) podHeaders.push('Pod Count');

        if (showPercentage) {
            podHeaders.push('Avg CPU (%)', 'Min CPU (%)', 'Max CPU (%)', 'Avg Memory (%)', 'Min Memory (%)', 'Max Memory (%)');
        } else {
            podHeaders.push('Avg CPU (m)', 'Min CPU (m)', 'Max CPU (m)', 'Avg Memory (MB)', 'Min Memory (MB)', 'Max Memory (MB)');
        }

        const podData = [podHeaders];
        currentData.forEach(row => {
            const rowData = [row.node || '', row.pod || ''];
            if (groupPods) rowData.push(row.pod_count || '');

            if (showPercentage) {
                rowData.push(
                    row.avg_cpu_percent !== null && row.avg_cpu_percent !== undefined ? row.avg_cpu_percent : 'N/A',
                    row.min_cpu_percent !== null && row.min_cpu_percent !== undefined ? row.min_cpu_percent : 'N/A',
                    row.max_cpu_percent !== null && row.max_cpu_percent !== undefined ? row.max_cpu_percent : 'N/A',
                    row.avg_memory_percent !== null && row.avg_memory_percent !== undefined ? row.avg_memory_percent : 'N/A',
                    row.min_memory_percent !== null && row.min_memory_percent !== undefined ? row.min_memory_percent : 'N/A',
                    row.max_memory_percent !== null && row.max_memory_percent !== undefined ? row.max_memory_percent : 'N/A'
                );
            } else {
                rowData.push(
                    row.avg_cpu_millicores || 0,
                    row.min_cpu_millicores || 0,
                    row.max_cpu_millicores || 0,
                    row.avg_memory_mb || 0,
                    row.min_memory_mb || 0,
                    row.max_memory_mb || 0
                );
            }
            podData.push(rowData);
        });
        const podSheet = XLSX.utils.aoa_to_sheet(podData);
        XLSX.utils.book_append_sheet(wb, podSheet, 'Pod Metrics');
    }

    // Add Node metrics if available
    if (currentNodeData.length > 0) {
        const nodeHeaders = ['IP Address / Instance', 'Hostname', 'Avg CPU (%)', 'Max CPU (%)', 'Avg Memory (%)', 'Max Memory (%)', 'Avg Disk (%)', 'Max Disk (%)'];
        const nodeData = [nodeHeaders];

        currentNodeData.forEach(row => {
            nodeData.push([
                row.instance || '',
                row.hostname || '',
                row.avg_cpu || 0,
                row.max_cpu || 0,
                row.avg_memory || 0,
                row.max_memory || 0,
                row.avg_disk || 0,
                row.max_disk || 0
            ]);
        });
        const nodeSheet = XLSX.utils.aoa_to_sheet(nodeData);
        XLSX.utils.book_append_sheet(wb, nodeSheet, 'Node Metrics');
    }

    XLSX.writeFile(wb, filename);
}

// Export all metrics to PDF
function exportAllToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `all-metrics-${timestamp}.pdf`;

    let yPos = 15;

    // Title
    doc.setFontSize(18);
    doc.text('All Metrics Export', 14, yPos);
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    const fromDate = document.getElementById('fromDate').value || 'N/A';
    const toDate = document.getElementById('toDate').value || 'N/A';
    doc.text(`Start Date & Time: ${fromDate}`, 14, yPos);
    yPos += 6;
    doc.text(`End Date & Time: ${toDate}`, 14, yPos);
    yPos += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
    yPos += 10;

    // Add K6 Metrics if available
    if (currentRequestData.length > 0) {
        // Check if we need a new page for the section title (only if not already on a fresh page)
        if (yPos > 180) {
            doc.addPage();
            yPos = 15;
        }

        doc.setFontSize(14);
        doc.text('K6 Load Test Metrics', 14, yPos);
        yPos += 5;

        const k6Headers = Object.keys(currentRequestData[0]);
        const k6Data = currentRequestData.map(row => k6Headers.map(h => row[h] !== undefined ? row[h] : ''));

        doc.autoTable({
            head: [k6Headers],
            body: k6Data,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [102, 126, 234], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 249, 249] }
        });

        // After autoTable, get the final Y position and ensure we're on the last page
        const lastPage = doc.internal.getNumberOfPages();
        doc.setPage(lastPage);
        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Add Pod Metrics if available
    if (currentData.length > 0) {
        // Only add a new page if there's not enough room for title + table header
        // (need at least 20 pixels for title and header)
        if (yPos > 175) {
            doc.addPage();
            yPos = 15;
        }

        doc.setFontSize(14);
        doc.text('Pod / Container Metrics', 14, yPos);
        yPos += 5;

        const showPercentage = document.getElementById('showPercentage').checked;
        const groupPods = document.getElementById('groupPods').checked;

        const podHeaders = ['Worker', 'Pod'];
        if (groupPods) podHeaders.push('Count');

        if (showPercentage) {
            podHeaders.push('Avg CPU %', 'Min CPU %', 'Max CPU %', 'Avg Mem %', 'Min Mem %', 'Max Mem %');
        } else {
            podHeaders.push('Avg CPU', 'Min CPU', 'Max CPU', 'Avg Mem', 'Min Mem', 'Max Mem');
        }

        const podData = currentData.map(row => {
            const rowData = [row.node || '', row.pod || ''];
            if (groupPods) rowData.push(row.pod_count || '');

            if (showPercentage) {
                rowData.push(
                    row.avg_cpu_percent !== null ? row.avg_cpu_percent : 'N/A',
                    row.min_cpu_percent !== null ? row.min_cpu_percent : 'N/A',
                    row.max_cpu_percent !== null ? row.max_cpu_percent : 'N/A',
                    row.avg_memory_percent !== null ? row.avg_memory_percent : 'N/A',
                    row.min_memory_percent !== null ? row.min_memory_percent : 'N/A',
                    row.max_memory_percent !== null ? row.max_memory_percent : 'N/A'
                );
            } else {
                rowData.push(
                    row.avg_cpu_millicores || 0,
                    row.min_cpu_millicores || 0,
                    row.max_cpu_millicores || 0,
                    row.avg_memory_mb || 0,
                    row.min_memory_mb || 0,
                    row.max_memory_mb || 0
                );
            }
            return rowData;
        });

        doc.autoTable({
            head: [podHeaders],
            body: podData,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [102, 126, 234], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 249, 249] }
        });

        // Ensure we're on the last page after autoTable
        const lastPage = doc.internal.getNumberOfPages();
        doc.setPage(lastPage);
        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Add Node Metrics if available
    if (currentNodeData.length > 0) {
        // Only add a new page if there's not enough room for title + table header
        if (yPos > 175) {
            doc.addPage();
            yPos = 15;
        }

        doc.setFontSize(14);
        doc.text('Node / Host Metrics', 14, yPos);
        yPos += 5;

        const nodeHeaders = ['IP Address', 'Hostname', 'Avg CPU %', 'Max CPU %', 'Avg Mem %', 'Max Mem %', 'Avg Disk %', 'Max Disk %'];
        const nodeData = currentNodeData.map(row => [
            row.instance || '',
            row.hostname || '',
            row.avg_cpu || 0,
            row.max_cpu || 0,
            row.avg_memory || 0,
            row.max_memory || 0,
            row.avg_disk || 0,
            row.max_disk || 0
        ]);

        doc.autoTable({
            head: [nodeHeaders],
            body: nodeData,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [102, 126, 234], textColor: 255 },
            alternateRowStyles: { fillColor: [249, 249, 249] },
            margin: { top: yPos }
        });
    }

    doc.save(filename);
}
