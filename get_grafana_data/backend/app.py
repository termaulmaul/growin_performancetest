from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS
import requests
from datetime import datetime
import statistics
import json

app = Flask(__name__)
CORS(app)

GRAFANA_BASE_URL = "https://monit-pt.corp.mandirisekuritas.co.id"
LOGIN_URL = f"{GRAFANA_BASE_URL}/login"
LOGIN_PAYLOAD = {"user": "viewer", "password": "viewer"}


class GrafanaClient:
    def __init__(self):
        self.session = requests.Session()
        self.cookies = None
        self.datasources = {}

    def authenticate(self):
        """Authenticate with Grafana and get session cookies"""
        try:
            print(f"Authenticating with Grafana at {LOGIN_URL}...")
            response = self.session.post(LOGIN_URL, json=LOGIN_PAYLOAD, verify=False)
            print(f"Auth response status: {response.status_code}")
            print(f"Auth response: {response.text[:200]}")
            response.raise_for_status()
            self.cookies = self.session.cookies
            print(f"Authentication successful. Cookies: {len(self.cookies)}")
            return True
        except Exception as e:
            print(f"Authentication failed: {e}")
            print(f"Response text: {response.text if 'response' in locals() else 'No response'}")
            return False

    def get_datasources(self):
        """Get all datasources to find Prometheus"""
        if not self.cookies:
            if not self.authenticate():
                return None

        try:
            response = self.session.get(
                f"{GRAFANA_BASE_URL}/api/datasources",
                cookies=self.cookies,
                verify=False
            )
            response.raise_for_status()
            datasources = response.json()
            print(f"Found {len(datasources)} datasources")
            for ds in datasources:
                self.datasources[ds.get('type')] = ds
                print(f"  - {ds.get('name')} (ID: {ds.get('id')}, Type: {ds.get('type')})")
            return datasources
        except Exception as e:
            print(f"Failed to fetch datasources: {e}")
            return None

    def get_dashboard(self, dashboard_uid):
        """Fetch dashboard definition"""
        if not self.cookies:
            if not self.authenticate():
                return None

        try:
            print(f"Fetching dashboard {dashboard_uid}...")
            response = self.session.get(
                f"{GRAFANA_BASE_URL}/api/dashboards/uid/{dashboard_uid}",
                cookies=self.cookies,
                verify=False
            )
            response.raise_for_status()
            dashboard = response.json()
            print(f"Dashboard fetched: {dashboard.get('dashboard', {}).get('title', 'Unknown')}")
            return dashboard
        except Exception as e:
            print(f"Failed to fetch dashboard: {e}")
            return None

    def query_prometheus(self, query, from_ts, to_ts, datasource_id=None):
        """Query Prometheus datasource directly"""
        if not self.cookies:
            if not self.authenticate():
                return None

        # Get datasources if not already fetched
        if not self.datasources:
            self.get_datasources()

        # Use provided datasource_id or find Prometheus datasource
        if datasource_id is None:
            prometheus_ds = self.datasources.get('prometheus')
            if prometheus_ds:
                datasource_id = prometheus_ds.get('id')
            else:
                print("No Prometheus datasource found, trying ID 1")
                datasource_id = 1

        api_url = f"{GRAFANA_BASE_URL}/api/datasources/proxy/{datasource_id}/api/v1/query_range"

        params = {
            "query": query,
            "start": from_ts,
            "end": to_ts,
            "step": "60s"
        }

        try:
            print(f"Querying Prometheus: {query[:100]}...")
            response = self.session.get(
                api_url,
                params=params,
                cookies=self.cookies,
                verify=False
            )
            print(f"Prometheus response status: {response.status_code}")
            response.raise_for_status()
            result = response.json()

            if result.get('status') != 'success':
                print(f"Prometheus query failed: {result}")
                return None

            result_count = len(result.get('data', {}).get('result', []))
            print(f"Query returned {result_count} time series")
            return result
        except Exception as e:
            print(f"Prometheus query failed: {e}")
            if 'response' in locals():
                print(f"Response text: {response.text[:500]}")
            return None

    def get_available_containers(self, namespace="growin", datasource_id=2):
        """Get list of available containers in namespace"""
        if not self.cookies:
            if not self.authenticate():
                return []

        # Use a simpler query that we know works - get unique container names
        query = f'group by (container) (container_memory_working_set_bytes{{namespace="{namespace}"}})'

        api_url = f"{GRAFANA_BASE_URL}/api/datasources/proxy/{datasource_id}/api/v1/query"

        params = {
            "query": query
        }

        try:
            print(f"Querying for containers with: {query}")
            response = self.session.get(
                api_url,
                params=params,
                cookies=self.cookies,
                verify=False
            )
            print(f"Container query response status: {response.status_code}")
            response.raise_for_status()
            result = response.json()

            if result.get('status') != 'success':
                print(f"Container query failed: {result}")
                return []

            containers = set()
            for item in result.get('data', {}).get('result', []):
                container = item.get('metric', {}).get('container', '')
                if container and container != '' and not container.startswith('POD'):
                    containers.add(container)

            print(f"Found containers: {sorted(list(containers))}")
            return sorted(list(containers))
        except Exception as e:
            print(f"Failed to get containers: {e}")
            if 'response' in locals():
                print(f"Response text: {response.text[:500]}")
            return []


def group_pod_name(pod_name):
    """Extract base deployment name from pod name

    Examples:
        growin-autoorderservice-pt-55547bbfb-85q6b -> growin-autoorderservice-pt
        growin-marketdataservice-pt-9d448d5b-bd8lz -> growin-marketdataservice-pt
    """
    parts = pod_name.rsplit('-', 2)
    if len(parts) >= 3:
        # Remove the last two parts (replica-set-hash and pod-hash)
        return parts[0]
    return pod_name


def group_pod_metrics(metrics_list):
    """Group pod metrics by deployment name and aggregate statistics

    Args:
        metrics_list: List of metric dictionaries with pod data

    Returns:
        List of grouped metrics with aggregated statistics
    """
    grouped = {}

    for metric in metrics_list:
        group_name = group_pod_name(metric['pod'])

        if group_name not in grouped:
            grouped[group_name] = {
                'pods': [],
                'nodes': set(),
                'avg_values': [],
                'min_values': [],
                'max_values': []
            }

        grouped[group_name]['pods'].append(metric['pod'])
        grouped[group_name]['nodes'].add(metric.get('node', 'Unknown'))
        grouped[group_name]['avg_values'].append(metric['avg'])
        grouped[group_name]['min_values'].append(metric['min'])
        grouped[group_name]['max_values'].append(metric['max'])

    # Calculate aggregated statistics
    result = []
    for group_name, data in grouped.items():
        result.append({
            'pod': group_name,
            'pod_count': len(data['pods']),
            'nodes': ', '.join(sorted(data['nodes'])),
            'avg': statistics.mean(data['avg_values']),
            'min': min(data['min_values']),
            'max': max(data['max_values'])
        })

    return result


def process_metrics_data(data, metric_type='pod'):
    """Process raw metrics data and calculate statistics

    Args:
        data: Prometheus query response
        metric_type: 'pod' for container metrics, 'node' for node metrics
    """
    results = []

    if not data or 'data' not in data or 'result' not in data['data']:
        return results

    for result in data['data']['result']:
        metric = result.get('metric', {})

        if metric_type == 'node':
            # For node metrics, use 'instance' as the primary identifier
            identifier = metric.get('instance', 'Unknown')
            node_name = metric.get('nodename', metric.get('instance', 'Unknown'))
        else:
            # For pod metrics
            identifier = metric.get('pod', metric.get('pod_name', 'Unknown'))
            node_name = metric.get('node', metric.get('instance', 'Unknown'))

        values = result.get('values', [])
        if not values:
            continue

        # Extract numeric values (second element in each [timestamp, value] pair)
        numeric_values = []
        for v in values:
            try:
                numeric_values.append(float(v[1]))
            except (ValueError, IndexError):
                continue

        if numeric_values:
            results.append({
                'pod': identifier,  # Keep as 'pod' for backward compatibility
                'node': node_name,
                'avg': statistics.mean(numeric_values),
                'min': min(numeric_values),
                'max': max(numeric_values)
            })

    return results


@app.route('/api/containers', methods=['GET'])
def get_containers():
    """Endpoint to fetch available containers"""
    namespace = request.args.get('namespace', 'growin')

    print(f"\n=== Fetching available containers for namespace: {namespace} ===")

    client = GrafanaClient()

    if not client.authenticate():
        return jsonify({"error": "Authentication failed"}), 401

    containers = client.get_available_containers(namespace=namespace, datasource_id=2)

    print(f"Found {len(containers)} containers: {containers}")

    return jsonify({"containers": containers})


@app.route('/api/node-metrics', methods=['POST'])
def get_node_metrics():
    """Endpoint to fetch node/host resource utilization for surrounding infrastructure"""
    data = request.json
    from_date = data.get('from_date')
    to_date = data.get('to_date')

    print(f"\n=== New node metrics request (surrounding infrastructure) ===")
    print(f"From: {from_date}")
    print(f"To: {to_date}")

    if not from_date or not to_date:
        return jsonify({"error": "from_date and to_date are required"}), 400

    try:
        # Convert dates to timestamps
        from_ts = int(datetime.fromisoformat(from_date.replace('Z', '+00:00')).timestamp())
        to_ts = int(datetime.fromisoformat(to_date.replace('Z', '+00:00')).timestamp())
        print(f"Timestamp range: {from_ts} to {to_ts}")
    except Exception as e:
        print(f"Date parsing error: {e}")
        return jsonify({"error": f"Invalid date format: {e}"}), 400

    client = GrafanaClient()

    # Authenticate first
    if not client.authenticate():
        return jsonify({"error": "Authentication failed"}), 401

    # Use Prometheus Surrounding datasource (ID: 1) for infrastructure nodes
    datasource_id = 1

    # Query node metrics for surrounding infrastructure (exclude TREMAPPLWRK* nodes)
    # First get hostname mapping to identify which nodes to exclude
    hostname_query = 'node_uname_info'
    hostname_response = client.query_prometheus(hostname_query, from_ts, to_ts, datasource_id=datasource_id)
    hostname_by_instance = {}
    worker_instances = set()

    if hostname_response and 'data' in hostname_response and 'result' in hostname_response['data']:
        for result in hostname_response['data']['result']:
            metric = result.get('metric', {})
            instance = metric.get('instance', '')
            nodename = metric.get('nodename', 'Unknown')
            hostname_by_instance[instance] = nodename
            # Identify worker nodes (containing WRK in the name)
            if 'WRK' in nodename.upper():
                worker_instances.add(instance)

    print(f"Found {len(hostname_by_instance)} total nodes, {len(worker_instances)} worker nodes to exclude")
    print(f"Worker nodes being excluded: {[hostname_by_instance.get(i) for i in worker_instances]}")

    # CPU usage: Get all node CPU metrics
    # Using rate with 2m window to match Grafana exactly
    cpu_query = '(1 - avg(rate(node_cpu_seconds_total{mode="idle"}[2m])) by (instance))*100'

    # Memory usage: Get all node memory metrics
    memory_query = '(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100'

    # Disk usage: Get all node disk metrics
    disk_query = '(1 - (node_filesystem_avail_bytes{fstype!="tmpfs",mountpoint="/"} / node_filesystem_size_bytes{fstype!="tmpfs",mountpoint="/"})) * 100'

    results = []

    # Fetch CPU data
    print(f"\n--- Fetching Node CPU metrics ---")
    cpu_response = client.query_prometheus(cpu_query, from_ts, to_ts, datasource_id=datasource_id)
    cpu_data_by_instance = {}
    if cpu_response:
        cpu_metrics = process_metrics_data(cpu_response, metric_type='node')
        print(f"Processed {len(cpu_metrics)} CPU metrics")
        for metric in cpu_metrics:
            instance = metric['pod']  # In node queries, 'instance' is stored in 'pod' field
            # Skip worker nodes
            if instance not in worker_instances:
                cpu_data_by_instance[instance] = {
                    'avg_cpu': round(metric['avg'], 2),
                    'max_cpu': round(metric['max'], 2)
                }

    # Fetch Memory data
    print(f"\n--- Fetching Node Memory metrics ---")
    memory_response = client.query_prometheus(memory_query, from_ts, to_ts, datasource_id=datasource_id)
    memory_data_by_instance = {}
    if memory_response:
        memory_metrics = process_metrics_data(memory_response, metric_type='node')
        print(f"Processed {len(memory_metrics)} Memory metrics")
        for metric in memory_metrics:
            instance = metric['pod']
            # Skip worker nodes
            if instance not in worker_instances:
                memory_data_by_instance[instance] = {
                    'avg_memory': round(metric['avg'], 2),
                    'max_memory': round(metric['max'], 2)
                }

    # Fetch Disk data
    print(f"\n--- Fetching Node Disk metrics ---")
    disk_response = client.query_prometheus(disk_query, from_ts, to_ts, datasource_id=datasource_id)
    disk_data_by_instance = {}
    if disk_response:
        disk_metrics = process_metrics_data(disk_response, metric_type='node')
        print(f"Processed {len(disk_metrics)} Disk metrics")
        for metric in disk_metrics:
            instance = metric['pod']
            # Skip worker nodes
            if instance not in worker_instances:
                disk_data_by_instance[instance] = {
                    'avg_disk': round(metric['avg'], 2),
                    'max_disk': round(metric['max'], 2)
                }

    print(f"Found {len(hostname_by_instance) - len(worker_instances)} surrounding infrastructure nodes")

    # Combine all data (only non-worker nodes)
    all_instances = set(list(cpu_data_by_instance.keys()) +
                        list(memory_data_by_instance.keys()) +
                        list(disk_data_by_instance.keys()))

    print(f"\n--- Total unique surrounding infrastructure nodes: {len(all_instances)} ---")

    for instance in all_instances:
        hostname = hostname_by_instance.get(instance, 'Unknown')
        print(f"Including node: {hostname} ({instance})")
        result = {
            'instance': instance,
            'hostname': hostname,
            'avg_cpu': cpu_data_by_instance.get(instance, {}).get('avg_cpu', 0),
            'max_cpu': cpu_data_by_instance.get(instance, {}).get('max_cpu', 0),
            'avg_memory': memory_data_by_instance.get(instance, {}).get('avg_memory', 0),
            'max_memory': memory_data_by_instance.get(instance, {}).get('max_memory', 0),
            'avg_disk': disk_data_by_instance.get(instance, {}).get('avg_disk', 0),
            'max_disk': disk_data_by_instance.get(instance, {}).get('max_disk', 0)
        }
        results.append(result)

    print(f"Returning {len(results)} node results\n")
    return jsonify({"data": results})


@app.route('/api/metrics', methods=['POST'])
def get_metrics():
    """Endpoint to fetch and process Grafana metrics"""
    data = request.json
    from_date = data.get('from_date')
    to_date = data.get('to_date')
    containers = data.get('containers', [])
    group_pods = data.get('group_pods', False)

    print(f"\n=== New metrics request ===")
    print(f"From: {from_date}")
    print(f"To: {to_date}")
    print(f"Containers filter: {containers if containers else 'All (default)'}")
    print(f"Group pods: {group_pods}")

    if not from_date or not to_date:
        return jsonify({"error": "from_date and to_date are required"}), 400

    try:
        # Convert dates to timestamps
        from_ts = int(datetime.fromisoformat(from_date.replace('Z', '+00:00')).timestamp())
        to_ts = int(datetime.fromisoformat(to_date.replace('Z', '+00:00')).timestamp())
        print(f"Timestamp range: {from_ts} to {to_ts}")
    except Exception as e:
        print(f"Date parsing error: {e}")
        return jsonify({"error": f"Invalid date format: {e}"}), 400

    client = GrafanaClient()

    # Authenticate first
    if not client.authenticate():
        return jsonify({"error": "Authentication failed"}), 401

    # Use Prometheus SF Kubernetes datasource (ID: 2) based on dashboard URL
    datasource_id = 2

    # Build container filter
    if containers and len(containers) > 0:
        container_filter = '|'.join(containers)
    else:
        # Default containers
        container_filter = "growin-marketdataservice|growin-autoorderservice|growin-orderservice|growin-udfservice"

    # Query CPU metrics (in cores)
    cpu_query = f'rate(container_cpu_usage_seconds_total{{namespace="growin",container=~"{container_filter}"}}[5m])'

    # Query CPU limits
    cpu_limit_query = f'container_spec_cpu_quota{{namespace="growin",container=~"{container_filter}"}} / container_spec_cpu_period{{namespace="growin",container=~"{container_filter}"}}'

    # Query Memory metrics (in bytes)
    memory_query = f'container_memory_working_set_bytes{{namespace="growin",container=~"{container_filter}"}}'

    # Query Memory limits
    memory_limit_query = f'container_spec_memory_limit_bytes{{namespace="growin",container=~"{container_filter}"}}'

    results = []

    # Fetch CPU data (absolute values in cores)
    print(f"\n--- Fetching CPU metrics (using datasource ID: {datasource_id}) ---")
    cpu_data_by_pod = {}
    cpu_response = client.query_prometheus(cpu_query, from_ts, to_ts, datasource_id=datasource_id)
    if cpu_response:
        cpu_metrics = process_metrics_data(cpu_response)
        print(f"Processed {len(cpu_metrics)} CPU metrics")
        for metric in cpu_metrics:
            cpu_data_by_pod[metric['pod']] = {
                'node': metric.get('node', 'Unknown'),
                'avg_cpu_cores': round(metric['avg'], 4),  # CPU in cores
                'min_cpu_cores': round(metric['min'], 4),
                'max_cpu_cores': round(metric['max'], 4),
                'avg_cpu_millicores': round(metric['avg'] * 1000, 2),  # CPU in millicores
                'min_cpu_millicores': round(metric['min'] * 1000, 2),
                'max_cpu_millicores': round(metric['max'] * 1000, 2)
            }
    else:
        print("No CPU response received")

    # Fetch CPU limits
    print(f"\n--- Fetching CPU limits ---")
    cpu_limits_by_pod = {}
    cpu_limit_response = client.query_prometheus(cpu_limit_query, from_ts, to_ts, datasource_id=datasource_id)
    if cpu_limit_response:
        cpu_limit_metrics = process_metrics_data(cpu_limit_response)
        print(f"Processed {len(cpu_limit_metrics)} CPU limit metrics")
        for metric in cpu_limit_metrics:
            # Use the average limit value (should be constant)
            cpu_limits_by_pod[metric['pod']] = round(metric['avg'], 4)
    else:
        print("No CPU limit response received")

    # Fetch Memory data (absolute values in MB)
    print(f"\n--- Fetching Memory metrics (using datasource ID: {datasource_id}) ---")
    memory_data_by_pod = {}
    memory_response = client.query_prometheus(memory_query, from_ts, to_ts, datasource_id=datasource_id)
    if memory_response:
        memory_metrics = process_metrics_data(memory_response)
        print(f"Processed {len(memory_metrics)} Memory metrics")
        for metric in memory_metrics:
            memory_data_by_pod[metric['pod']] = {
                'node': metric.get('node', 'Unknown'),
                'avg_memory_mb': round(metric['avg'] / (1024**2), 2),  # Memory in MB
                'min_memory_mb': round(metric['min'] / (1024**2), 2),
                'max_memory_mb': round(metric['max'] / (1024**2), 2),
                'avg_memory_bytes': round(metric['avg'], 0),  # Keep raw bytes for percentage calc
                'min_memory_bytes': round(metric['min'], 0),
                'max_memory_bytes': round(metric['max'], 0)
            }
    else:
        print("No Memory response received")

    # Fetch Memory limits
    print(f"\n--- Fetching Memory limits ---")
    memory_limits_by_pod = {}
    memory_limit_response = client.query_prometheus(memory_limit_query, from_ts, to_ts, datasource_id=datasource_id)
    if memory_limit_response:
        memory_limit_metrics = process_metrics_data(memory_limit_response)
        print(f"Processed {len(memory_limit_metrics)} Memory limit metrics")
        for metric in memory_limit_metrics:
            # Use the average limit value (should be constant)
            memory_limits_by_pod[metric['pod']] = round(metric['avg'], 0)
    else:
        print("No Memory limit response received")

    # Combine CPU and Memory data
    all_pods = set(list(cpu_data_by_pod.keys()) + list(memory_data_by_pod.keys()))
    print(f"\n--- Total unique pods found: {len(all_pods)} ---")

    for pod in all_pods:
        # Get node from either CPU or Memory data
        node = cpu_data_by_pod.get(pod, {}).get('node') or memory_data_by_pod.get(pod, {}).get('node', 'Unknown')

        # Get CPU data
        cpu_data = cpu_data_by_pod.get(pod, {})
        avg_cpu_cores = cpu_data.get('avg_cpu_cores', 0)
        min_cpu_cores = cpu_data.get('min_cpu_cores', 0)
        max_cpu_cores = cpu_data.get('max_cpu_cores', 0)
        avg_cpu_millicores = cpu_data.get('avg_cpu_millicores', 0)
        min_cpu_millicores = cpu_data.get('min_cpu_millicores', 0)
        max_cpu_millicores = cpu_data.get('max_cpu_millicores', 0)

        # Get Memory data
        memory_data = memory_data_by_pod.get(pod, {})
        avg_memory_mb = memory_data.get('avg_memory_mb', 0)
        min_memory_mb = memory_data.get('min_memory_mb', 0)
        max_memory_mb = memory_data.get('max_memory_mb', 0)
        avg_memory_bytes = memory_data.get('avg_memory_bytes', 0)
        min_memory_bytes = memory_data.get('min_memory_bytes', 0)
        max_memory_bytes = memory_data.get('max_memory_bytes', 0)

        # Calculate percentages if limits are available
        cpu_limit = cpu_limits_by_pod.get(pod)
        memory_limit = memory_limits_by_pod.get(pod)

        # CPU percentages
        if cpu_limit and cpu_limit > 0:
            avg_cpu_percent = round((avg_cpu_cores / cpu_limit) * 100, 2)
            min_cpu_percent = round((min_cpu_cores / cpu_limit) * 100, 2)
            max_cpu_percent = round((max_cpu_cores / cpu_limit) * 100, 2)
        else:
            avg_cpu_percent = None
            min_cpu_percent = None
            max_cpu_percent = None

        # Memory percentages
        if memory_limit and memory_limit > 0:
            avg_memory_percent = round((avg_memory_bytes / memory_limit) * 100, 2)
            min_memory_percent = round((min_memory_bytes / memory_limit) * 100, 2)
            max_memory_percent = round((max_memory_bytes / memory_limit) * 100, 2)
        else:
            avg_memory_percent = None
            min_memory_percent = None
            max_memory_percent = None

        result = {
            'pod': pod,
            'node': node,
            # Absolute values
            'avg_cpu_millicores': avg_cpu_millicores,
            'min_cpu_millicores': min_cpu_millicores,
            'max_cpu_millicores': max_cpu_millicores,
            'avg_memory_mb': avg_memory_mb,
            'min_memory_mb': min_memory_mb,
            'max_memory_mb': max_memory_mb,
            # Percentage values (None if no limit)
            'avg_cpu_percent': avg_cpu_percent,
            'min_cpu_percent': min_cpu_percent,
            'max_cpu_percent': max_cpu_percent,
            'avg_memory_percent': avg_memory_percent,
            'min_memory_percent': min_memory_percent,
            'max_memory_percent': max_memory_percent,
            # Limits
            'cpu_limit_cores': cpu_limit,
            'memory_limit_mb': round(memory_limit / (1024**2), 2) if memory_limit else None
        }
        results.append(result)

    # Apply pod grouping if requested
    if group_pods:
        print(f"\n--- Grouping pods by deployment name ---")
        grouped_results = []
        grouped_data = {}

        for result in results:
            group_name = group_pod_name(result['pod'])

            if group_name not in grouped_data:
                grouped_data[group_name] = {
                    'pods': [],
                    'nodes': set(),
                    'avg_cpu_millicores_values': [],
                    'min_cpu_millicores_values': [],
                    'max_cpu_millicores_values': [],
                    'avg_memory_mb_values': [],
                    'min_memory_mb_values': [],
                    'max_memory_mb_values': [],
                    'avg_cpu_percent_values': [],
                    'min_cpu_percent_values': [],
                    'max_cpu_percent_values': [],
                    'avg_memory_percent_values': [],
                    'min_memory_percent_values': [],
                    'max_memory_percent_values': []
                }

            grouped_data[group_name]['pods'].append(result['pod'])
            grouped_data[group_name]['nodes'].add(result['node'])
            # Absolute values
            grouped_data[group_name]['avg_cpu_millicores_values'].append(result['avg_cpu_millicores'])
            grouped_data[group_name]['min_cpu_millicores_values'].append(result['min_cpu_millicores'])
            grouped_data[group_name]['max_cpu_millicores_values'].append(result['max_cpu_millicores'])
            grouped_data[group_name]['avg_memory_mb_values'].append(result['avg_memory_mb'])
            grouped_data[group_name]['min_memory_mb_values'].append(result['min_memory_mb'])
            grouped_data[group_name]['max_memory_mb_values'].append(result['max_memory_mb'])
            # Percentage values (only if not None)
            if result['avg_cpu_percent'] is not None:
                grouped_data[group_name]['avg_cpu_percent_values'].append(result['avg_cpu_percent'])
            if result['min_cpu_percent'] is not None:
                grouped_data[group_name]['min_cpu_percent_values'].append(result['min_cpu_percent'])
            if result['max_cpu_percent'] is not None:
                grouped_data[group_name]['max_cpu_percent_values'].append(result['max_cpu_percent'])
            if result['avg_memory_percent'] is not None:
                grouped_data[group_name]['avg_memory_percent_values'].append(result['avg_memory_percent'])
            if result['min_memory_percent'] is not None:
                grouped_data[group_name]['min_memory_percent_values'].append(result['min_memory_percent'])
            if result['max_memory_percent'] is not None:
                grouped_data[group_name]['max_memory_percent_values'].append(result['max_memory_percent'])

        # Calculate aggregated statistics
        for group_name, data in grouped_data.items():
            grouped_result = {
                'pod': group_name,
                'pod_count': len(data['pods']),
                'node': ', '.join(sorted(data['nodes'])),
                # Absolute values
                'avg_cpu_millicores': round(statistics.mean(data['avg_cpu_millicores_values']), 2) if data['avg_cpu_millicores_values'] else 0,
                'min_cpu_millicores': round(min(data['min_cpu_millicores_values']), 2) if data['min_cpu_millicores_values'] else 0,
                'max_cpu_millicores': round(max(data['max_cpu_millicores_values']), 2) if data['max_cpu_millicores_values'] else 0,
                'avg_memory_mb': round(statistics.mean(data['avg_memory_mb_values']), 2) if data['avg_memory_mb_values'] else 0,
                'min_memory_mb': round(min(data['min_memory_mb_values']), 2) if data['min_memory_mb_values'] else 0,
                'max_memory_mb': round(max(data['max_memory_mb_values']), 2) if data['max_memory_mb_values'] else 0,
                # Percentage values (None if no pods have limits)
                'avg_cpu_percent': round(statistics.mean(data['avg_cpu_percent_values']), 2) if data['avg_cpu_percent_values'] else None,
                'min_cpu_percent': round(min(data['min_cpu_percent_values']), 2) if data['min_cpu_percent_values'] else None,
                'max_cpu_percent': round(max(data['max_cpu_percent_values']), 2) if data['max_cpu_percent_values'] else None,
                'avg_memory_percent': round(statistics.mean(data['avg_memory_percent_values']), 2) if data['avg_memory_percent_values'] else None,
                'min_memory_percent': round(min(data['min_memory_percent_values']), 2) if data['min_memory_percent_values'] else None,
                'max_memory_percent': round(max(data['max_memory_percent_values']), 2) if data['max_memory_percent_values'] else None
            }
            grouped_results.append(grouped_result)

        results = grouped_results
        print(f"Grouped into {len(results)} deployments")

    print(f"Returning {len(results)} results\n")
    return jsonify({"data": results})


@app.route('/health', methods=['GET'])
@app.route("/report/<path:filename>", methods=["GET"])
def serve_report(filename):
    """Serve static HTML reports"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    report_dir = os.path.join(project_root, "Report", "Utilization")
    return send_from_directory(report_dir, filename)


def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})


if __name__ == '__main__':
    # Disable SSL warnings for self-signed certificates
    import urllib3
    import os
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
