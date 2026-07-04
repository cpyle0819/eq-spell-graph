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

// CloudFront routes /norraph/api/* here with the prefix intact; strip it
// before matching against the same route table src/server.ts uses locally.
const PATH_PREFIX = "/norraph";

export async function handler(event: LambdaFunctionUrlEvent): Promise<LambdaResponse> {
  const pathname = event.rawPath.startsWith(PATH_PREFIX)
    ? event.rawPath.slice(PATH_PREFIX.length) || "/"
    : event.rawPath;
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
