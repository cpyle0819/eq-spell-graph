/**
 * Builds the Lambda deployment package for src/lambda.ts (see that file for
 * why it has no knowledge of where/how it's actually deployed).
 * Output: dist-lambda.zip, consumed by whatever infra repo deploys this app.
 *
 * Layout mirrors the source tree (src/lambda.js next to data/graph.json) so
 * graph.ts's `resolve(__dirname, "../data/graph.json")` resolves the same
 * way it does when run locally under Bun.
 */
import { rm, mkdir, cp } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outdir = resolve(root, "dist-lambda");

await rm(outdir, { recursive: true, force: true });
await rm(resolve(root, "dist-lambda.zip"), { force: true });

await Bun.build({
  entrypoints: [resolve(root, "src/lambda.ts")],
  outdir: resolve(outdir, "src"),
  target: "node",
  format: "esm",
  minify: true,
});

await mkdir(resolve(outdir, "data"), { recursive: true });
await cp(resolve(root, "data/graph.json"), resolve(outdir, "data/graph.json"));
await Bun.write(resolve(outdir, "package.json"), JSON.stringify({ type: "module" }, null, 2));

const zipPath = resolve(root, "dist-lambda.zip");
if (process.platform === "win32") {
  execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${outdir}\\*' -DestinationPath '${zipPath}'"`,
    { stdio: "inherit" }
  );
} else {
  execSync(`cd "${outdir}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
}

console.log(`Built ${resolve(root, "dist-lambda.zip")}`);
