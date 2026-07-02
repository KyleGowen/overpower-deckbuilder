---
name: pdf-to-png
description: >-
  Convert image PDFs to PNG at native resolution (no upscaling beyond embedded
  image DPI) using Docker Poppler. Use when the user invokes /pdf-to-png or asks
  to convert a PDF to PNG, export card artwork from PDF, or batch-convert PDF
  images on Windows.
disable-model-invocation: true
---

# /pdf-to-png

Convert image PDFs (e.g. Photoshop card-art exports) to PNG files at the **highest resolution the source supports** — never upscale beyond embedded image PPI.

## Invocation

User calls **`/pdf-to-png`** with one or more arguments after the command:

| Argument pattern | Meaning |
|------------------|---------|
| Path ending in `.pdf` | Input PDF (required) |
| Path **starting with `/`** | Output directory for the PNG |
| Name **ending with `.png`** | Output filename |

Examples:

```
/pdf-to-png C:/Users/Kyle/Desktop/card.pdf
/pdf-to-png C:/Users/Kyle/Desktop/card.pdf /c/Users/Kyle/Desktop/out
/pdf-to-png C:/Users/Kyle/Desktop/card.pdf mycard.png
/pdf-to-png C:/Users/Kyle/Desktop/card.pdf /c/Users/Kyle/Desktop/out mycard.png
```

**Defaults when omitted:**

- No output directory → same folder as the input PDF
- No output filename → `{pdf-basename}.png` (single page) or `{pdf-basename}-{n}.png` (multi-page)

**Path normalization:** `/c/Users/Kyle/Desktop` → `C:\Users\Kyle\Desktop`. Forward slashes are fine on Windows.

## Workflow

1. **Parse arguments** using the table above. Multiple PDFs are not supported in one call unless the user lists several invocations.
2. **Run the helper script** from the repository root (do not hand-roll Docker commands):

```powershell
& ".cursor/skills/pdf-to-png/scripts/Convert-PdfToPng.ps1" `
  -InputPdf "<input.pdf>" `
  [-OutputDir "<dir>"] `
  [-OutputFileName "<name.png>"]
```

3. **Read the JSON output** — report `dpi`, `pageCount`, and full `outputFiles` paths.
4. **Show the result** — use the Read tool on the PNG (single-page) or list all outputs (multi-page). Open in Glass if the user has the file visible.

## Resolution policy

The script picks DPI from embedded image metadata (`pdfimages -list` x-ppi / y-ppi). If PPI is missing, it derives DPI from pixel dimensions vs PDF page size in points. **Never exceeds native PPI** — avoids blurry upscales from the prior 300 DPI default.

Requires **Docker** (`minidocks/poppler` image; pulled automatically on first run).

## Multi-page PDFs

Custom `OutputFileName` `deck.png` → `deck-1.png`, `deck-2.png`, …

## Errors

| Symptom | Action |
|---------|--------|
| Docker not running | Ask user to start Docker Desktop, then retry |
| Input PDF not found | Confirm path; normalize slashes |
| No PNG produced | PDF may be encrypted or empty — inspect with `pdfinfo` |
| `OutputFileName` without `.png` | Reject; filenames must end with `.png` |

## Completion report

```
✅ PDF → PNG
- Input:  <path>
- Output: <path(s)>
- DPI:    <native dpi> (no upscale)
- Pages:  <n>
```

Then display the image(s) when single-page or when the user asked to see the result.

## Related

- Card image pipeline after export: [add-card](../add-card/SKILL.md) skill and [`docs/current/IMAGE_PIPELINE.md`](../../../docs/current/IMAGE_PIPELINE.md)
