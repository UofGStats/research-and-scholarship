# Statistics Research & Scholarship

Quarto website containing the Funding Finder for Statistics.

## Update the funding data using RStudio

The Excel workbook is the master copy of the funding data.

1. Open `Funding_Finder_for_Statistics_FFS.xlsx` in Excel.
2. Add or edit opportunities in the **Funding opportunities** worksheet. Keep the existing column names unchanged.
   - Set **Research / Scholarship** to **Research**, **Scholarship**, or **Research and Scholarship**.
   - Use **Status setting** to select the normal status. The calculated **Status** changes to **DEADLINE PASSED** automatically when an exact deadline is earlier than today.
   - Approximate deadlines such as “Oct 2026” and opportunities with no closing date remain under manual control.
3. Update the **Last reviewed** date in the **Guide & sources** worksheet.
4. Save and close the workbook.
5. Open RStudio and select **File → New Project → Existing Directory**. Choose this website folder. If you already have it open as a project, skip this step.
6. In RStudio's **Files** pane, open `scripts/export_funding_data.R` and click **Source**. The Console should report how many opportunities were exported.
7. Open the **Build** pane and click **Render Website**.
8. Check the rendered website, especially the new opportunity, its status, filters, details and official link.

The R script reads the workbook and updates `data/funding-opportunities.json`, which is the file used by the website. It uses project-relative paths, so the instructions work for anyone who opens this folder as an RStudio project.

### One-time R package setup

If the export script reports that packages are missing, run this once in the RStudio **Console**, then click **Source** again:

```r
install.packages(c("readxl", "jsonlite"))
```

## Send an email about a new opportunity

1. In the **Funding opportunities** worksheet, set **Notify?** to **Yes** for the new opportunity.
2. Copy the generated **Email subject** into the Outlook subject line.
3. Copy the generated **Email body** into the message and check the details before sending.
4. In the email, select the words **View official opportunity**, press **Command+K** (Mac) or **Ctrl+K** (Windows), and paste the opportunity URL from the workbook's **Source** column.
5. If required, do the same with the words **Open Funding Finder**, using `https://uofgstats.github.io/research-and-scholarship/` as the URL.
6. Send the email manually, then enter the date in the workbook's **Notification date** column.

Always check the official opportunity page before sending, as deadlines and eligibility information may change.

## Publish with GitHub Pages

The repository includes a GitHub Actions workflow that renders the Quarto website and deploys the generated `_site` folder.

### One-time GitHub setting

1. Open the repository on GitHub.
2. Select **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

Do not select **Deploy from a branch** for this project. That option uses GitHub's Jekyll builder, which cannot build the Quarto source directly.

### Publish an update

Commit and push changes to the `main` branch. The **Publish Quarto website** workflow will run automatically. You can follow its progress under the repository's **Actions** tab.

To test before pushing, use **Build → Render Website** in RStudio. The completed local website will be written to `_site`.
