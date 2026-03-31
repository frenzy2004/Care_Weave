

# CareWeave — Final Polished Plan

Two small refinements added to the already-approved plan. Everything else remains identical.

## What Changed

### 1. Insight Engine — Confidence Labels
Each insight card will include a confidence indicator based on data volume:
- **High** (5+ supporting instances)
- **Medium** (3-4 instances)
- **Low** (1-2 instances)

Display format: `"Symptoms improved after anti-inflammatory drugs" — Confidence: Medium (based on 3 instances)`

Shown as a subtle gray badge beneath each insight card.

### 2. Health Story Mode — Responsibility Disclaimer
Every generated health story ends with:

> *"This report is meant to support conversations with your doctor, not replace medical advice."*

Styled as a muted italic footer line. Also included at the bottom of every PDF export.

## Everything Else — Unchanged

Full implementation order remains:
1. Data model, types, localStorage hooks, sample data seed
2. Layout shell (sidebar nav, header with Doctor Mode toggle)
3. Dashboard with headline metric + quick actions + flare button
4. Symptom Logger with flare toggle + emoji slider
5. Medication Tracker with drug classes
6. Provider Directory + Visits Log
7. Health Timeline with meaningful event labels
8. Pattern Dashboard (3-4 charts + Insight Engine with confidence labels)
9. Health Story Mode with disclaimer
10. Doctor Mode styling layer
11. PDF Export with insights, story, and disclaimer

Design: Clean clinical (blue #2563EB, white/gray bg, teal/amber/red accents, Inter font).
Stack: Recharts, jsPDF + html2canvas, date-fns, lucide-react, localStorage, no auth.
Pre-seeded with 6 months of realistic demo data.

