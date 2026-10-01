# New funding opportunity checklist

1. Add the opportunity to the **Funding opportunities** worksheet in `Funding_Finder_for_Statistics_FFS.xlsx`.
2. Check the official source and complete every core field, especially the deadline, eligibility, funding, source link and relevance to Statistics.
3. Select the appropriate **Research / Scholarship** and **Status setting** values. Enter exact deadlines as Excel dates where possible so expired opportunities are identified automatically.
4. Set **Notify?** to **Yes**, review the generated email subject and body, add the hyperlinks in Outlook, and send the email.
5. Enter the date sent in **Notification date**.
6. Update **Last reviewed** in the **Guide & sources** worksheet.
7. Save and close the workbook, then run the data-export command in the RStudio Terminal:

   ```bash
   /Users/danielacastrocamilo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/export_funding_data.py
   ```

8. Preview the website and confirm that the opportunity, status, filters, links and details are correct:

   ```bash
   /Applications/RStudio.app/Contents/Resources/app/quarto/bin/quarto preview
   ```

9. Commit and push the updated workbook and website data. Check the GitHub Actions deployment and verify the live website.
