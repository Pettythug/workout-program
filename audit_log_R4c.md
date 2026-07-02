# Audit Log - TASK-R4c: Security Hotfix - PIN Validation Fail-Open Bug

## Objective
Patch the "Fail-Open" vulnerability in `gymlog_handleLogSet()` so that the server strictly rejects requests if a required PIN is undefined on the server.

## Changes Made
- Modified `Combined_AppScript_v2.gs`

In `gymlog_handleLogSet()`, updated the PIN validation loop to explicitly check if a PIN is configured for the requested user on the server (`validPins[personKey]`). 
- If no PIN is configured, it now immediately throws an error: `"Unauthorized: No PIN configured on the server for [person]"`.
- If a PIN is configured but does not match the provided PIN, it throws the existing `"Unauthorized: Invalid PIN for [person]"` error.

This patch ensures strict validation and resolves the vulnerability where logs were silently accepted when server-side PIN configuration was missing.
