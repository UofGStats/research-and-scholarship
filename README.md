# Statistics Research & Scholarship

Quarto website containing the Funding Finder for Statistics.

## Update the funding data

Edit `Funding_Finder_for_Statistics_FFS.xlsx`, then run:

```bash
python3 scripts/export_funding_data.py
quarto preview
```

The export script preserves the workbook as the editorial master and writes the website data to `data/funding-opportunities.json`.

## Publish with GitHub Pages

Create a GitHub repository for this folder, commit the project, and run:

```bash
quarto publish gh-pages
```

Quarto creates and updates the `gh-pages` branch containing the rendered site.
