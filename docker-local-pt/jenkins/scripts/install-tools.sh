#!/usr/bin/env bash
set -euo pipefail
echo "── Jenkins PT tools check ──"
command -v node >/dev/null && node --version
command -v k6 >/dev/null && k6 version
command -v curl >/dev/null && curl --version | head -1
command -v jq >/dev/null && jq --version
command -v git >/dev/null && git --version | head -1
echo "── OK ──"
