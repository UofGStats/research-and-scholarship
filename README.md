# Statistics Research & Scholarship

Quarto website containing the Funding Finder for Statistics.

## Update the funding data using RStudio

The Excel workbook is the master copy of the funding data. You do not need to know Python to update it.

1. Open `Funding_Finder_for_Statistics_FFS.xlsx` in Excel.
2. Add or edit opportunities in the **Funding opportunities** worksheet. Keep the existing column names unchanged.
3. Update the **Last reviewed** date in the **Guide & sources** worksheet.
4. Save and close the workbook.
5. Open RStudio and select **File → New Project → Existing Directory**. Choose this website folder. If you already have it open as a project, skip this step.
6. Open the **Terminal** tab in RStudio. It is normally beside the Console tab.
7. Run the following command to refresh the website data:

   ```bash
   /Users/danielacastrocamilo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/export_funding_data.py
   ```

8. When the Terminal reports that 41 opportunities were exported, preview the website by running:

   ```bash
   /Applications/RStudio.app/Contents/Resources/app/quarto/bin/quarto preview
   ```

9. Open the local preview address shown in the Terminal and check the updated opportunities.
10. To stop the preview, click in the Terminal and press **Control+C**.

The first command uses a small automated conversion script. You do not need to edit or understand Python: it simply reads the workbook and updates `data/funding-opportunities.json`, which is the file used by the website.

### Commands to copy into the RStudio Terminal

Run these commands one at a time:

```bash
/Users/danielacastrocamilo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/export_funding_data.py
/Applications/RStudio.app/Contents/Resources/app/quarto/bin/quarto preview
```

## Publish with GitHub Pages

Create a GitHub repository for this folder, commit the project, and run:

```bash
quarto publish gh-pages
```

Quarto creates and updates the `gh-pages` branch containing the rendered site.
