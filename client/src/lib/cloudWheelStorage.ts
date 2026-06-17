import type { LocalWheel } from "./localWheelStorage";

type GetToken = () => Promise<string | null>;

async function authedFetch(
  getToken: GetToken,
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  return fetch(`/api/wheels${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

type CloudWheel = {
  id: string;
  userId: string;
  name: string;
  segments: LocalWheel["segments"];
  createdAt: string;
  updatedAt: string;
};

function toLocalShape(w: CloudWheel): LocalWheel {
  return {
    id: w.id,
    name: w.name,
    segments: w.segments,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  };
}

export async function listCloudWheels(getToken: GetToken): Promise<LocalWheel[]> {
  const res = await authedFetch(getToken, "");
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  const rows: CloudWheel[] = await res.json();
  return rows.map(toLocalShape);
}

export async function getCloudWheel(
  getToken: GetToken,
  id: string
): Promise<LocalWheel | null> {
  const res = await authedFetch(getToken, `/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Get failed: ${res.status}`);
  return toLocalShape(await res.json());
}

export async function saveCloudWheel(
  getToken: GetToken,
  wheel: { name: string; segments: LocalWheel["segments"] }
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const res = await authedFetch(getToken, "", {
    method: "POST",
    body: JSON.stringify(wheel),
  });
  // 409 = wheel cap reached; 422 = segment count over the plan limit. Both carry
  // a user-facing `error` message (e.g. the Pro upgrade nudge) — surface it.
  if (res.status === 409 || res.status === 422) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? "Couldn't save wheel" };
  }
  if (!res.ok) return { success: false, error: `Save failed: ${res.status}` };
  const created: CloudWheel = await res.json();
  return { success: true, wheel: toLocalShape(created) };
}

export async function updateCloudWheel(
  getToken: GetToken,
  id: string,
  data: { name?: string; segments?: LocalWheel["segments"] }
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const res = await authedFetch(getToken, `/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (res.status === 404) return { success: false, error: "Wheel not found" };
  if (res.status === 422) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? "Segment limit exceeded for your plan." };
  }
  if (!res.ok) return { success: false, error: `Update failed: ${res.status}` };
  const updated: CloudWheel = await res.json();
  return { success: true, wheel: toLocalShape(updated) };
}

export async function deleteCloudWheel(
  getToken: GetToken,
  id: string
): Promise<{ success: boolean; error?: string }> {
  const res = await authedFetch(getToken, `/${id}`, { method: "DELETE" });
  if (res.status === 404) return { success: false, error: "Wheel not found" };
  if (!res.ok) return { success: false, error: `Delete failed: ${res.status}` };
  return { success: true };
}

export async function duplicateCloudWheel(
  getToken: GetToken,
  id: string
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const source = await getCloudWheel(getToken, id);
  if (!source) return { success: false, error: "Wheel not found" };
  return saveCloudWheel(getToken, {
    name: `${source.name} (Copy)`,
    segments: source.segments.map((s) => ({ ...s, id: crypto.randomUUID() })),
  });
}
