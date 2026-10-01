# New funding opportunity checklist

1. Add the opportunity to the **Funding opportunities** worksheet in `Funding_Finder_for_Statistics_FFS.xlsx`.
2. Set **Notify?** to **Yes**, review the generated email subject and body, confirm both URLs are clickable in Outlook, and send the email.
3. Enter the date sent in **Notification date**.
4. Update **Last reviewed** in the **Guide & sources** worksheet.
5. Save and close the workbook. In RStudio's **Files** pane, open `scripts/export_funding_data.R` and click **Source**.
6. In RStudio's **Build** pane, click **Render Website**. Confirm that the opportunity, status, filters, links and details are correct.
7. Commit and push the updated workbook and website data. Check the GitHub Actions deployment and verify the live website.
