# New funding opportunity checklist

1. Add the opportunity to the **Funding opportunities** worksheet in `Funding_Finder_for_Statistics_FFS.xlsx`.
2. Set **Notify?** to **Yes**, review the generated email subject and body, confirm both URLs are clickable in Outlook, and send the email.
3. Enter the date sent in **Notification date**.
4. Save and close the workbook.
5. In RStudio's **Build** pane, click **Render Website**. Quarto automatically exports the spreadsheet data and sets **Last reviewed** to today's date. Confirm that the opportunity, status, filters, links and details are correct.
6. Commit and push the updated workbook and website data. Check the GitHub Actions deployment and verify the live website.
