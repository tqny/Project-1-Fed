#!/usr/bin/env bash
set -euo pipefail

missing=0

declare -a required_paths=(
  "README.md"
  "CHANGELOG.md"
  "docs/adr"
  "docs/demos"
  "docs/metrics"
  "docs/postmortems"
  "docs/worklog"
  "scripts/check-evidence.sh"
  ".github/PULL_REQUEST_TEMPLATE.md"
  ".github/workflows/evidence-check.yml"
  "docs/adr/0000-template.md"
  "docs/demos/DEMO_LOG_TEMPLATE.md"
  "docs/postmortems/TEMPLATE.md"
  "docs/metrics/WEEKLY_METRICS_TEMPLATE.md"
)

for path in "${required_paths[@]}"; do
  if [[ ! -e "$path" ]]; then
    echo "Missing required evidence artifact: $path"
    missing=1
  fi
done

if ! grep -q "\[Unreleased\]" CHANGELOG.md; then
  echo "CHANGELOG.md must contain [Unreleased]"
  missing=1
fi

today_worklog="docs/worklog/$(date +%F).md"
if [[ ! -f "$today_worklog" ]]; then
  echo "Missing daily worklog: $today_worklog"
  missing=1
fi

if [[ "$missing" -ne 0 ]]; then
  echo "Evidence check failed"
  exit 1
fi

echo "Evidence check passed"
