import type {
  EditParams,
  EditResponse,
  GalleryItem,
  GenerateParams,
  GenerateResponse,
  OptionsResponse,
  GalleryKind,
} from "./types";

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";

function url(path: string): string {
  return `${BASE}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail: string;
    try {
      const body = await res.json();
      detail = body.detail ?? JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

// ---- Generate ---------------------------------------------------------------

export async function generate(prompt: string, params: GenerateParams = {}): Promise<string[]> {
  const body = {
    prompt,
    size: params.size ?? "1024x1536",
    quality: params.quality ?? "medium",
    n: params.n ?? 1,
  };
  const res = await request<GenerateResponse>("/generate", { method: "POST", body: JSON.stringify(body) });
  return res.images;
}

// ---- Edit -------------------------------------------------------------------

export async function edit(prompt: string, image: string, params: EditParams = {}): Promise<string> {
  const body = {
    prompt,
    image,
    size: params.size ?? "1024x1536",
    quality: params.quality ?? "medium",
  };
  const res = await request<EditResponse>("/edit", { method: "POST", body: JSON.stringify(body) });
  return res.images[0];
}

// ---- Options ----------------------------------------------------------------

export async function fetchOptions(): Promise<OptionsResponse> {
  return request<OptionsResponse>("/options");
}

// ---- Gallery ----------------------------------------------------------------

export async function fetchGallery(): Promise<GalleryItem[]> {
  const res = await request<{ items: GalleryItem[] }>("/gallery");
  return res.items;
}

export async function postGallery(input: {
  src: string;
  prompt: string;
  kind: GalleryKind;
  meta?: Record<string, unknown>;
}): Promise<GalleryItem> {
  const res = await request<{ item: GalleryItem }>("/gallery", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.item;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await request<{ deleted: string }>(`/gallery/${id}`, { method: "DELETE" });
}

// ---- Vectorize --------------------------------------------------------------

export interface VectorizeParams {
  gallery_id?: string;
  src?: string;
  filter_speckle?: number;
  color_precision?: number;
  corner_threshold?: number;
  length_threshold?: number;
}

export async function vectorize(params: VectorizeParams): Promise<string> {
  const res = await request<{ svg: string }>("/vectorize", {
    method: "POST",
    body: JSON.stringify(params),
  });
  return res.svg;
}
