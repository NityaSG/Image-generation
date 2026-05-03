import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchGallery, postGallery, deleteGalleryItem } from "../api/client";
import type { GalleryItem, GalleryKind } from "../api/types";

interface GalleryCtxValue {
  gallery: GalleryItem[];
  loading: boolean;
  refresh: () => Promise<void>;
  addToGallery: (input: { src: string; prompt: string; kind: GalleryKind; meta?: Record<string, unknown> }) => Promise<GalleryItem | null>;
  removeFromGallery: (id: string) => Promise<void>;
  clearGallery: () => Promise<void>;
}

const GalleryCtx = createContext<GalleryCtxValue | null>(null);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchGallery();
      setGallery(items);
    } catch (err) {
      console.warn("Gallery fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addToGallery = useCallback<GalleryCtxValue["addToGallery"]>(
    async (input) => {
      try {
        const item = await postGallery({
          src: input.src,
          prompt: input.prompt,
          kind: input.kind,
          meta: input.meta ?? {},
        });
        setGallery((prev) => [...prev, item]);
        return item;
      } catch (err) {
        console.warn("Failed to persist gallery item", err);
        return null;
      }
    },
    [],
  );

  const removeFromGallery = useCallback(async (id: string) => {
    try {
      await deleteGalleryItem(id);
      setGallery((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.warn("Failed to delete gallery item", err);
    }
  }, []);

  const clearGallery = useCallback(async () => {
    const ids = gallery.map((item) => item.id);
    await Promise.all(ids.map((id) => deleteGalleryItem(id).catch(() => null)));
    setGallery([]);
  }, [gallery]);

  return (
    <GalleryCtx.Provider value={{ gallery, loading, refresh, addToGallery, removeFromGallery, clearGallery }}>
      {children}
    </GalleryCtx.Provider>
  );
}

export function useGallery(): GalleryCtxValue {
  const ctx = useContext(GalleryCtx);
  if (!ctx) throw new Error("useGallery must be used inside <GalleryProvider>");
  return ctx;
}
