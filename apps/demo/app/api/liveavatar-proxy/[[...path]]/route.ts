import { NextRequest, NextResponse } from "next/server";
import { API_KEY, LIVEAVATAR_BACKEND_API_URL } from "../../secrets";

/**
 * Catch-all proxy for LiveAvatar SDK requests
 * Handles paths like /api/liveavatar-proxy/v1/sessions/start
 * The SDK appends its paths to the apiUrl, so we capture them here
 */

interface RouteContext {
  params: {
    path?: string[];
  };
}

async function proxyRequest(
  request: NextRequest,
  method: string,
  context: RouteContext
) {
  try {
    // Extract the path segments from the catch-all route
    const pathSegments = context.params.path || [];
    const sdkPath = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "/v1/sessions";
    
    console.log(`[LiveAvatar Proxy] ${method} request to: ${sdkPath}`);
    
    // Get request body for POST/PUT requests
    let body;
    if (method === "POST" || method === "PUT") {
      body = await request.json().catch(() => ({}));
    }
    
    // Extract authorization header
    const authHeader = request.headers.get("authorization");
    
    // Build headers for the backend request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    // Use API key or authorization header
    if (authHeader) {
      headers["Authorization"] = authHeader;
    } else if (API_KEY) {
      headers["X-Api-Key"] = API_KEY;
    }
    
    // Make the request to the actual LiveAvatar API
    const backendUrl = `${LIVEAVATAR_BACKEND_API_URL}${sdkPath}`;
    console.log(`[LiveAvatar Proxy] Proxying to: ${backendUrl}`);
    
    const fetchOptions: RequestInit = {
      method,
      headers,
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(backendUrl, fetchOptions);
    
    const data = await response.json().catch(() => ({}));
    
    console.log(`[LiveAvatar Proxy] Response status: ${response.status}`);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[LiveAvatar Proxy] Error:", error);
    return NextResponse.json(
      { error: "Proxy request failed", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, "POST", context);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, "DELETE", context);
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, "GET", context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, "PUT", context);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, "PATCH", context);
}
