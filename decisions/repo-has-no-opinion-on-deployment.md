# This repo has no opinion on where it's deployed

`src/lambda.ts` takes `rawPath` as already relative to its own root — no hardcoded path prefix, domain, or any other deployment detail. Whatever sits in front of it (CloudFront, API Gateway, a reverse proxy) is responsible for path rewriting and routing; that's infra's job, tracked in whatever separate infra repo owns the actual deployment, not here. See `scripts/build-lambda.ts` for the packaging step this repo does own.

`graph.ts` resolves `data/graph.json`'s path via `fileURLToPath(import.meta.url)` rather than Bun's `import.meta.dir`, since the Lambda bundle runs under the Node.js runtime, not Bun.

