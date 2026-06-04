# Sandbox_Demo

**Smoke test suite untuk validasi Sandbox stack.**

## Purpose

Real Growin scripts (Growin_Auth_AdminPermission_Create, Growin_Calendar, etc.)
butuh **real backend** dengan endpoint complete (login + PIN + userId + trading +
portfolio + market data + ...). Mock-api di Sandbox tidak bisa emulate semua itu.

Sandbox di-design untuk validasi **framework flow** — bukan replacement untuk
real backend testing. Buat keperluan itu, pakai Onprem/Oncloud target.

## What it tests

Demo script `Sandbox_Demo.js` melakukan 3 langkah simple yang mock-api support:
1. `POST /auth/api/v1/login` → check `data.token` exists
2. `GET /auth/api/v1/identity/userid` → check `data.userId` exists
3. `GET /health` → check `ok: true`

Custom metrics naming follows real Growin convention:
- `duration_BP001_01_login`
- `error_rate_BP001_01_login`
- `sample_BP001_01_login`

## Run from pt-menu.sh

```
./pt-menu.sh
  → [1] Run Test
  → Sandbox Demo
  → Sandbox_Demo
  → Sandbox_Demo.js
  → Platform: Web
  → Scenario: BP001
  → VUs: 100  Duration: 60s  ENV: SANDBOX
  → RUNBY: Manual
```

## Direct run (debugging)

```bash
sshpass -p M@nsek.1234 ssh -p 2222 qa@127.0.0.1 \
  "cd /workspace/Script/Sandbox_Demo && \
   k6 run --compatibility-mode=experimental_enhanced Sandbox_Demo.js \
     -e BASE_URL=http://mock-api:8080 -e USER=100 -e DURATION=60s"
```

## For REAL backend testing

Use `[1] Run Test → Onprem` or `Oncloud` target with real Growin scripts.
Backend di Onprem-2 / Oncloud VM punya akses ke `internal-api-pt.growin.id`
yang tidak bisa di-emulate di Sandbox.
