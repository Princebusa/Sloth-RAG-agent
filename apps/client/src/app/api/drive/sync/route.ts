import { getApiAuthHeaders, getApiUrl } from "@/lib/api";

export async function POST() {
  try {
    const headers = await getApiAuthHeaders();
    const response = await fetch(`${getApiUrl()}/drive/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const headers = await getApiAuthHeaders();
    const response = await fetch(`${getApiUrl()}/drive/sync-status`, {
      method: "GET",
      headers,
    });

    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load sync status";
    const status = message === "Unauthorized" ? 401 : 500;
    return Response.json({ error: message }, { status });
  }
}
