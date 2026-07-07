# Audit Log: TASK-R35 (Switch Google Drive Image Resolver to docs.google.com/uc)

## Overview
This document logs the changes made to the frontend image URL resolver to bypass client-side ad-blockers and privacy extensions that trigger `ERR_BLOCKED_BY_CLIENT` when accessing Google's `lh3.googleusercontent.com` CDN.

## Changes Made
1. **gymlog-react/src/components/ImageModal.jsx**:
   - In `getImageUrl`, updated the Google Drive image URL template from `https://lh3.googleusercontent.com/d/${fileRef}` to `https://docs.google.com/uc?export=view&id=${fileRef}`.

2. **gymlog-react/src/components/ExerciseCard.jsx**:
   - In `getImageUrl`, updated the Google Drive image URL template from `https://lh3.googleusercontent.com/d/${fileRef}` to `https://docs.google.com/uc?export=view&id=${fileRef}`.

3. **gymlog-react/src/components/CircuitCard.jsx**:
   - In `getImageUrl`, updated the Google Drive image URL template from `https://lh3.googleusercontent.com/d/${fileRef}` to `https://docs.google.com/uc?export=view&id=${fileRef}`.

## Verification
- Checked compilation with `npm run build` in `gymlog-react`.
