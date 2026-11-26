// Prints the X post URL submitted for make.fun's
// "Promote make.fun's make-your-own-bounty post on X" bounty.
// The post itself is the entry; this reads its address from POST.json.
//
// Run: node main.ts

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const POST_FILE = "POST.json";
const STATUS_URL = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/;

function postFilePath(): string {
  return join(dirname(fileURLToPath(import.meta.url)), POST_FILE);
}

type PostResult = { ok: true; url: string } | { ok: false; reason: "missing" | "unreadable" | "invalid-url" };

function isValidPostUrl(url: unknown): url is string {
  return typeof url === "string" && STATUS_URL.test(url);
}

function readPost(path: string): PostResult {
  if (!existsSync(path)) return { ok: false, reason: "missing" };
  try {
    const data = JSON.parse(readFileSync(path, "utf8")) as unknown;
    const url = (data as { url?: unknown } | null)?.url;
    return isValidPostUrl(url)
      ? { ok: true, url }
      : { ok: false, reason: "invalid-url" };
  } catch {
    return { ok: false, reason: "unreadable" };
  }
}

const REASON_TEXT: Record<PostResult["reason"], string> = {
  missing: `No post URL yet: ${POST_FILE} is missing.`,
  unreadable: `Cannot read ${POST_FILE}: it is not valid JSON.`,
  "invalid-url": `Bad URL in ${POST_FILE}: expected an x.com status link.`,
};

function report(result: PostResult, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(result.ok ? { url: result.url } : { error: result.reason }));
    return;
  }
  if (result.ok) {
    console.log(`Submitted post: ${result.url}`);
  } else {
    console.log(REASON_TEXT[result.reason]);
  }
}

function main(): void {
  report(readPost(postFilePath()), process.argv.slice(2).includes("--json"));
}

main();
