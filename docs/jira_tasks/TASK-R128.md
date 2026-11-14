# TASK-R128: Optimize 470 MB Exercise Images (`public/images/`) and Add Lazy Loading

- **Target Role:** `Sandbox_Developer`
- **Required Model:** `Gemini 3.8 Flash (High)` (`MEDIUM_TIER`)
- **STRICT MODEL GATEKEEPER CHECK (MANDATORY ON TURN 1):**
  1. Check your active model against `MEDIUM_TIER`: `["Gemini 3.8 Flash (High)", "Gemini 3.8 Flash", "Claude Sonnet 4.6 (Thinking)"]`.
  2. If running on a **HIGHER model** (e.g. `Gemini 4 Argon`, `Gemini 3.8 Pro`, `Claude Opus`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too high. Please switch to Gemini 3.8 Flash (High) before proceeding.`
  3. If running on a **LOWER model** (e.g. `Gemini 3.8 Flash (Low)`, `Gemini 3.5 Flash (Medium/Low)`):
     - **HALT IMMEDIATELY.** Do NOT read files or run tools.
     - Output: `Model Alignment Error: Request Switch -> Model is too low. Please switch to Gemini 3.8 Flash (High) before proceeding.`

---

## Overview
`gymlog-react/public/images/` currently contains 69 uncompressed high-resolution `.jpg` camera photos totaling **469.76 MB** (averaging 3.6 MB–6.5 MB per image).
- Every time Vite runs `npm run build`, it copies all 470 MB into `gymlog-react/dist/images/`, making build output and git transfers massive.
- On Vercel, every branch deployment and PR merge stores large snapshots, consuming gigabytes of bandwidth and build storage.
- On mobile devices at the gym, opening an exercise image downloads 4–6 MB of uncompressed bytes, wasting cellular data.

---

## Technical Specifications & Requirements

### 1. Add `loading="lazy"` & `decoding="async"` (`gymlog-react/src/components/ImageModal.jsx`)
In `gymlog-react/src/components/ImageModal.jsx`, add `loading="lazy"` and `decoding="async"` to the modal's `<img src={imgSrc} ... />` tag.

### 2. Batch Resize & Compress `gymlog-react/public/images/*.jpg`
1. Resize all 69 `.jpg` images to a maximum dimension of `1000px` (preserving aspect ratio) and compress at 80% JPEG quality.
2. **Keep all existing filenames 100% identical** (e.g. `Leg_Press.jpg` remains `Leg_Press.jpg`) so no image mappings, database references, or URLs break.
3. Target: Total directory size of `gymlog-react/public/images/` must reduce from **469.76 MB down to < 25 MB** (a >94% reduction).
4. You can use PowerShell with `System.Drawing` to perform the batch resize:
   ```powershell
   Add-Type -AssemblyName System.Drawing
   $imgDir = "gymlog-react/public/images"
   $files = Get-ChildItem -Path $imgDir -Filter "*.jpg"
   $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
   $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
   $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 80L)

   foreach ($f in $files) {
       $bmp = [System.Drawing.Bitmap]::FromFile($f.FullName)
       $origW = $bmp.Width
       $origH = $bmp.Height
       $maxDim = 1000
       if ($origW -gt $maxDim -or $origH -gt $maxDim) {
           if ($origW -gt $origH) {
               $newW = $maxDim
               $newH = [int]($origH * $maxDim / $origW)
           } else {
               $newH = $maxDim
               $newW = [int]($origW * $maxDim / $origH)
           }
           $newBmp = New-Object System.Drawing.Bitmap($newW, $newH)
           $g = [System.Drawing.Graphics]::FromImage($newBmp)
           $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
           $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
           $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
           $g.DrawImage($bmp, 0, 0, $newW, $newH)
           $g.Dispose()
           $bmp.Dispose()
           
           $tempPath = "$($f.FullName).tmp.jpg"
           $newBmp.Save($tempPath, $jpegCodec, $encoderParams)
           $newBmp.Dispose()
           Move-Item -Path $tempPath -Destination $f.FullName -Force
       } else {
           $bmp.Dispose()
       }
   }
   ```

---

## Target Files
- `gymlog-react/src/components/ImageModal.jsx`
- `gymlog-react/public/images/*`

---

## Validation & Verification Protocol
1. Verify `public/images` size is < 25 MB:
   ```powershell
   (Get-ChildItem -Path gymlog-react/public/images -File | Measure-Object -Property Length -Sum).Sum / 1MB
   ```
2. Verify production build passes with zero errors:
   ```cmd
   cmd /c npm run build
   ```
3. Respond strictly inside a markdown code block with the 4-line XML handoff snippet:
   ```xml
   <TASK_HANDOFF>
     <TASK_ID>TASK-R128</TASK_ID>
     <ROLE>Sandbox_Developer</ROLE>
     <STATUS>DEVELOPMENT_TASK_COMPLETE</STATUS>
     <BUILD_EXIT_CODE>0</BUILD_EXIT_CODE>
   </TASK_HANDOFF>
   ```
