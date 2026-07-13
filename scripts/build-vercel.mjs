import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const source = resolve(root, "public");
const output = resolve(root, "vercel-dist");
const template = resolve(source, "vercel-index.html");

await rm(output, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });
await writeFile(resolve(output, "index.html"), await readFile(template, "utf8"), "utf8");
await rm(resolve(output, "vercel-index.html"), { force: true });

console.log("Vercel static output prepared in vercel-dist");
