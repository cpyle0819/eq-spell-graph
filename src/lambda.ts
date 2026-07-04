import { handleApi } from "./api";

// Lambda Function URL event (payload format 2.0). Only the fields we use.
interface LambdaFunctionUrlEvent {
  rawPath: string;
  rawQueryString: string;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// This handler has no knowledge of where it's mounted (domain, path prefix,
// etc.) — it expects rawPath already relative to its own root, matching the
// same route table src/server.ts uses locally. Whatever's in front of this
// Lambda (CloudFront, API Gateway, ...) is responsible for stripping any
// path prefix before forwarding the request; that's a deployment concern,
// not an application one.
export async function handler(event: LambdaFunctionUrlEvent): Promise<LambdaResponse> {
  const pathname = event.rawPath || "/";
  const searchParams = new URLSearchParams(event.rawQueryString);

  const result = await handleApi(pathname, searchParams);

  if (!result) {
    return {
      statusCode: 404,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Not found" }),
    };
  }

  return {
    statusCode: result.status,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(result.body),
  };
}
