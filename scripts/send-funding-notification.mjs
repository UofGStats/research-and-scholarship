import { readFileSync } from "node:fs";

const required = [
  "AZURE_TENANT_ID",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
  "EMAIL_SENDER",
  "EMAIL_RECIPIENT",
  "FUNDING_FINDER_URL",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Required configuration ${name} is missing.`);
  }
}

const { opportunities } = JSON.parse(readFileSync("new-opportunities.json", "utf8"));
if (!opportunities.length) {
  console.log("No new opportunities to notify.");
  process.exit(0);
}

const escapeHtml = (value = "") => String(value).replace(
  /[&<>"']/g,
  (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
);

const items = opportunities.map((item) => `
  <li style="margin-bottom:20px">
    <strong>${escapeHtml(item.opportunity)}</strong><br>
    ${escapeHtml(item.funder)} · ${escapeHtml(item.deadline_display)}<br>
    <span>${escapeHtml(item.funding_duration)}</span><br>
    <span>${escapeHtml(item.statistics_relevance)}</span>
  </li>`).join("");

const count = opportunities.length;
const subject = `${count} new funding ${count === 1 ? "opportunity" : "opportunities"} for Statistics`;
const html = `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#17272f;max-width:680px">
    <h1 style="font-size:24px;color:#003865">New funding ${count === 1 ? "opportunity" : "opportunities"}</h1>
    <p>${count === 1 ? "A new opportunity has" : "New opportunities have"} been added to the Funding Finder for Statistics:</p>
    <ul>${items}</ul>
    <p><a href="${escapeHtml(process.env.FUNDING_FINDER_URL)}" style="background:#003865;color:#fff;padding:10px 16px;text-decoration:none;border-radius:5px">Open the Funding Finder</a></p>
    <p style="font-size:12px;color:#5c6b72">Deadlines and eligibility can change. Check the official funder page before preparing an application.</p>
  </div>`;

const tokenResponse = await fetch(
  `https://login.microsoftonline.com/${encodeURIComponent(process.env.AZURE_TENANT_ID)}/oauth2/v2.0/token`,
  {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AZURE_CLIENT_ID,
      client_secret: process.env.AZURE_CLIENT_SECRET,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  },
);

if (!tokenResponse.ok) {
  throw new Error(`Microsoft identity authentication failed (${tokenResponse.status}).`);
}

const { access_token: accessToken } = await tokenResponse.json();
const sendResponse = await fetch(
  `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(process.env.EMAIL_SENDER)}/sendMail`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: [
          { emailAddress: { address: process.env.EMAIL_RECIPIENT } },
        ],
      },
      saveToSentItems: true,
    }),
  },
);

if (!sendResponse.ok) {
  const detail = await sendResponse.text();
  throw new Error(`Microsoft Graph sendMail failed (${sendResponse.status}): ${detail}`);
}

console.log(`Sent notification for ${count} new funding ${count === 1 ? "opportunity" : "opportunities"}.`);
