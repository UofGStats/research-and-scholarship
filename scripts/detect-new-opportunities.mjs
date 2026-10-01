import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

const dataPath = "data/funding-opportunities.json";
const outputPath = "new-opportunities.json";
const zeroSha = /^0+$/;

function readJson(text, source) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Could not read ${source}: ${error.message}`);
  }
}

const current = readJson(readFileSync(dataPath, "utf8"), dataPath);
const baseSha = process.env.BASE_SHA || "";
let previous = { opportunities: [] };

// A manually dispatched workflow does not send an email. For a push, compare
// the committed data with the exact repository state before that push.
if (process.env.GITHUB_EVENT_NAME === "push" && baseSha && !zeroSha.test(baseSha)) {
  try {
    const previousText = execFileSync(
      "git",
      ["show", `${baseSha}:${dataPath}`],
      { encoding: "utf8" },
    );
    previous = readJson(previousText, `${dataPath} at ${baseSha}`);
  } catch (error) {
    console.log("No previous funding data was available; no notification will be sent.");
    previous = current;
  }
} else {
  previous = current;
}

const opportunityKey = (item) => [item.opportunity, item.funder, item.source]
  .map((value) => String(value || "").trim().toLowerCase())
  .join("|");
const previousKeys = new Set(previous.opportunities.map(opportunityKey));
const growth = current.opportunities.length - previous.opportunities.length;
const candidates = current.opportunities.filter((item) => !previousKeys.has(opportunityKey(item)));

// An edit to an existing title or URL is not a new opportunity. Only notify
// when the number of records has increased, and never send more alerts than
// the net number of newly added records.
const additions = growth > 0 ? candidates.slice(0, growth) : [];

writeFileSync(
  outputPath,
  `${JSON.stringify({ opportunities: additions }, null, 2)}\n`,
  "utf8",
);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `count=${additions.length}\n`, "utf8");
}

console.log(`Detected ${additions.length} new funding ${additions.length === 1 ? "opportunity" : "opportunities"}.`);
