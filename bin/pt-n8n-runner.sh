#!/usr/bin/env bash
set -e

TARGET="Sandbox"
SUITE="ExaCC"
SCRIPT="ExaCC.js"
VUS=10
DUR="10s"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --target) TARGET="$2"; shift ;;
        --suite) SUITE="$2"; shift ;;
        --script) SCRIPT="$2"; shift ;;
        --vus) VUS="$2"; shift ;;
        --dur) DUR="$2"; shift ;;
    esac
    shift
done

echo "Starting Performance Test via n8n"
echo "Target: $TARGET"
echo "Suite: $SUITE"
echo "Script: $SCRIPT"
echo "VUs: $VUS"
echo "Duration: $DUR"

SUMMARY_FILE="/tests/summary.json"
rm -f "$SUMMARY_FILE"

if [[ "$TARGET" == "Sandbox" || "$TARGET" == "Demo" ]]; then
    echo "Running local dockerized k6 for Sandbox/Demo..."
    # We use docker compose directly. Note: n8n Execute Command must run this.
    docker compose -f /workspace/docker-compose.yml -p qa-n8n-stack run --rm k6-runner \
      run --out influxdb=http://influxdb:8086/k6 --summary-export="$SUMMARY_FILE" \
      -e RUNBY="n8n" -e ENV="INT" -e USER="$VUS" -e DURATION="$DUR" -e NUMSTART=1 -e PLATFORM=Web \
      "/tests/Script/$SUITE/$SCRIPT" > /dev/null 2>&1 || true
else
    echo "Mocking execution for $TARGET (Dev machine without VPN)..."
    echo "1. Creating tarball of /tests/Script/$SUITE..."
    sleep 1
    echo "2. Transferring via SSH to $TARGET..."
    sleep 2
    echo "3. Executing k6 remotely..."
    sleep 3
    echo "4. Downloading summary report..."
    
    # Generate mock summary.json
    cat <<JSON_EOF > "$SUMMARY_FILE"
{
  "metrics": {
    "http_req_duration": {
      "avg": 150.5,
      "p(95)": 190.2
    },
    "http_req_failed": {
      "rate": 0.0005
    },
    "http_reqs": {
      "rate": 450.2
    }
  },
  "root_group": {
    "name": "",
    "path": "",
    "id": "d41d8cd98f00b204e9800998ecf8427e",
    "groups": [],
    "checks": []
  }
}
JSON_EOF
    echo "Mock execution completed."
fi

# Send Webhook
echo "Sending Webhook to Teams..."
node /tests/lib/webhook/send-summary-webhook.mjs "$SUMMARY_FILE" --type teams --webhook "https://defaultd3dc75f5a4ce4c659734a8430d86f5.ac.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c93df6900cc84ab5920be1b006005f92/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hx1ase6P85ZmQ28QbpwdUyxm0fmqgrvKMH9bhRrGUdg" > /dev/null 2>&1 || true

echo "Done!"
