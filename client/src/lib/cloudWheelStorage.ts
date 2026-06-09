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

export async function saveCloudWheel(
  getToken: GetToken,
  wheel: { name: string; segments: LocalWheel["segments"] }
): Promise<{ success: boolean; wheel?: LocalWheel; error?: string }> {
  const res = await authedFetch(getToken, "", {
    method: "POST",
    body: JSON.stringify(wheel),
  });
  if (res.status === 409) {
    const body = await res.json().catch(() => ({}));
    return { success: false, error: body.error ?? "Wheel limit reached" };
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
  const list = await listCloudWheels(getToken);
  const source = list.find((w) => w.id === id);
  if (!source) return { success: false, error: "Wheel not found" };
  return saveCloudWheel(getToken, {
    name: `${source.name} (Copy)`,
    segments: source.segments.map((s) => ({ ...s, id: crypto.randomUUID() })),
  });
}
