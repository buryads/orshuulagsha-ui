const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface LiveCard {
  bur: string | null;
  ru: string;
}

export async function loadCard(id: string): Promise<LiveCard | null> {
  if (!API_BASE || !/^\d+$/.test(id)) return null;
  try {
    const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/greetings/${id}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(2500),
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: { live?: boolean; bur?: string | null; ru?: string | null } };
    const data = body.data;
    return data?.live && data.ru ? { bur: data.bur ?? null, ru: data.ru } : null;
  } catch {
    return null;
  }
}
