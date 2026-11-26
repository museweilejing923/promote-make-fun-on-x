// Prints the X post URL submitted for make.fun's
// "Promote make.fun's make-your-own-bounty post on X" bounty.
// The post itself is the entry; this reads its address from POST.json.
//
// Run: node main.ts

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const POST_FILE = "POST.json";

function postFilePath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), POST_FILE);
}

function readPostUrl(path: string): string | null {
  if (!existsSync(path)) return null;
  try {
    const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
    const url = (data as { url?: unknown } | null)?.url;
    return typeof url === "string" && url.length > 0 ? url : null;
  } catch {
    return null;
  }
}

function main(): void {
  const url = readPostUrl(postFilePath());
  if (url === null) {
    console.log(`No post URL yet: ${POST_FILE} is missing or has no url field.`);
    console.log("Post on X first, then add POST.json with the post URL.");
    return;
  }
  console.log(`Submitted post: ${url}`);
}

main();
