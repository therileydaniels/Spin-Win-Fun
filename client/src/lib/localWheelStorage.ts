const STORAGE_KEY = "quickwheel_saved_wheels";
const MAX_WHEELS = 10;

export interface LocalWheel {
  id: string;
  name: string;
  segments: Array<{
    id: string;
    label: string;
    color: string;
    probability: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getLocalWheels(): LocalWheel[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as LocalWheel[];
  } catch {
    return [];
  }
}

export function saveWheelToLocal(wheel: {
  name: string;
  segments: Array<{
    id: string;
    label: string;
    color: string;
    probability: number;
  }>;
}): { success: boolean; wheel?: LocalWheel; error?: string } {
  try {
    const wheels = getLocalWheels();
    
    if (wheels.length >= MAX_WHEELS) {
      return {
        success: false,
        error: `You can save up to ${MAX_WHEELS} wheels. Please delete old wheels first.`,
      };
    }
    
    const newWheel: LocalWheel = {
      id: generateId(),
      name: wheel.name,
      segments: wheel.segments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    wheels.push(newWheel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wheels));
    
    return { success: true, wheel: newWheel };
  } catch (e) {
    if (e instanceof Error && e.name === "QuotaExceededError") {
      return {
        success: false,
        error: "Storage full. Please delete old wheels to save new ones.",
      };
    }
    return {
      success: false,
      error: "Failed to save wheel. Please try again.",
    };
  }
}

export function updateLocalWheel(
  wheelId: string,
  data: {
    name?: string;
    segments?: Array<{
      id: string;
      label: string;
      color: string;
      probability: number;
    }>;
  }
): { success: boolean; wheel?: LocalWheel; error?: string } {
  try {
    const wheels = getLocalWheels();
    const index = wheels.findIndex((w) => w.id === wheelId);
    
    if (index === -1) {
      return { success: false, error: "Wheel not found." };
    }
    
    if (data.name !== undefined) {
      wheels[index].name = data.name;
    }
    if (data.segments !== undefined) {
      wheels[index].segments = data.segments;
    }
    wheels[index].updatedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wheels));
    
    return { success: true, wheel: wheels[index] };
  } catch (e) {
    if (e instanceof Error && e.name === "QuotaExceededError") {
      return {
        success: false,
        error: "Storage full. Please delete old wheels to save new ones.",
      };
    }
    return {
      success: false,
      error: "Failed to update wheel. Please try again.",
    };
  }
}

export function deleteLocalWheel(wheelId: string): { success: boolean; error?: string } {
  try {
    const wheels = getLocalWheels();
    const filtered = wheels.filter((w) => w.id !== wheelId);
    
    if (filtered.length === wheels.length) {
      return { success: false, error: "Wheel not found." };
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Failed to delete wheel. Please try again.",
    };
  }
}

export function getLocalWheelById(wheelId: string): LocalWheel | null {
  const wheels = getLocalWheels();
  return wheels.find((w) => w.id === wheelId) || null;
}

export function duplicateLocalWheel(wheelId: string): { success: boolean; wheel?: LocalWheel; error?: string } {
  try {
    const wheels = getLocalWheels();
    const source = wheels.find((w) => w.id === wheelId);
    
    if (!source) {
      return { success: false, error: "Wheel not found." };
    }
    
    if (wheels.length >= MAX_WHEELS) {
      return {
        success: false,
        error: `You can save up to ${MAX_WHEELS} wheels. Please delete old wheels first.`,
      };
    }
    
    const newWheel: LocalWheel = {
      id: generateId(),
      name: `${source.name} (Copy)`,
      segments: source.segments.map(s => ({ ...s, id: generateId() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    wheels.push(newWheel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wheels));
    
    return { success: true, wheel: newWheel };
  } catch (e) {
    if (e instanceof Error && e.name === "QuotaExceededError") {
      return {
        success: false,
        error: "Storage full. Please delete old wheels to save new ones.",
      };
    }
    return {
      success: false,
      error: "Failed to duplicate wheel. Please try again.",
    };
  }
}

export function encodeWheelToUrl(wheel: LocalWheel): string {
  const data = {
    n: wheel.name,
    s: wheel.segments.map(seg => ({
      l: seg.label,
      c: seg.color,
      p: seg.probability,
    })),
  };
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function decodeWheelFromUrl(encoded: string): { name: string; segments: Array<{ id: string; label: string; color: string; probability: number }> } | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json);
    
    if (!data.s || !Array.isArray(data.s) || data.s.length < 2 || data.s.length > 20) {
      return null;
    }
    
    const segments = data.s
      .filter((seg: { l?: string; c?: string; p?: number }) => 
        typeof seg.l === "string" && 
        typeof seg.c === "string" && 
        isValidHexColor(seg.c) &&
        typeof seg.p === "number" && 
        isFinite(seg.p) && 
        seg.p >= 0 && 
        seg.p <= 100
      )
      .map((seg: { l: string; c: string; p: number }) => ({
        id: generateId(),
        label: seg.l.slice(0, 25),
        color: seg.c,
        probability: Math.min(100, Math.max(0, seg.p)),
      }));
    
    if (segments.length < 2) {
      return null;
    }
    
    return {
      name: (typeof data.n === "string" ? data.n.slice(0, 50) : "Shared Wheel"),
      segments,
    };
  } catch {
    return null;
  }
}
