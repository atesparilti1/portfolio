// Injects the build-time render into dist/index.html. Runs after both builds.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = await readFile(resolve(root, "dist/index.html"), "utf8");
const { render } = await import(pathToFileURL(resolve(root, "dist-ssr/entry-server.js")).href);

const html = render();
const marker = '<div id="root"></div>';
if (!template.includes(marker)) throw new Error("root marker not found in dist/index.html");
await writeFile(resolve(root, "dist/index.html"), template.replace(marker, `<div id="root">${html}</div>`));
await rm(resolve(root, "dist-ssr"), { recursive: true, force: true });
console.log(`Prerendered ${Math.round(html.length / 1024)} kB of HTML into dist/index.html`);
