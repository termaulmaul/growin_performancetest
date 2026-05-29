#!/usr/bin/env bash
# Re-seed pipeline job on running Jenkins (idempotent).
set -euo pipefail
GROOVY_SRC="${1:-/workspace/docker-local-pt/jenkins/init.groovy.d/01-create-local-k6-job.groovy}"
if [[ ! -f "$GROOVY_SRC" ]]; then
  echo "ERROR: groovy not found: $GROOVY_SRC" >&2
  exit 1
fi
cp "$GROOVY_SRC" /tmp/seed-local-k6-job.groovy
java -jar /usr/share/jenkins/jenkins.war groovy /tmp/seed-local-k6-job.groovy
echo ">> job local-k6-mock-pipeline configured"
