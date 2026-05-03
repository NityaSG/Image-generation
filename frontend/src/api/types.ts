// API contract types — mirror backend/schemas.py.

export type GalleryKind = "apparel" | "sketch" | "pattern" | "edit";

export interface GalleryItem {
  id: string;
  src: string; // data URL
  prompt: string;
  kind: GalleryKind;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface GenerateResponse {
  images: string[]; // data URLs
  gallery_ids?: string[];
}

export interface EditResponse {
  images: string[]; // data URLs
  gallery_ids?: string[];
}

export interface OptionsResponse {
  GENDER_OPTIONS: string[];
  categories: Record<string, string[]>; // gender -> [category]
  subtypes: Record<string, string[]>; // "gender/category" -> [subtype]
  features: Record<string, Record<string, string[]>>; // "gender/category" -> attr -> [enum]
  woven_fabrics: string[];
  knit_fabrics: string[];
  patterns: string[];
  embroidery: string[];
  washes: string[];
  pattern_families: Record<string, string[]>;
  repeat_types: string[];
  style_modes: string[];
  sizes: string[];
  qualities: string[];
  backgrounds: string[];
  photo_styles: string[];
  framings: string[];
}

export interface GenerateParams {
  size?: string;
  quality?: string;
  n?: number;
}

export interface EditParams {
  size?: string;
  quality?: string;
}
