import { Select } from "./Select";

interface Props {
  size: string;
  quality: string;
  n?: number;
  sizes: string[];
  qualities: string[];
  onSize: (v: string) => void;
  onQuality: (v: string) => void;
  onN?: (v: number) => void;
  showN?: boolean;
}

export function OutputSettings({
  size,
  quality,
  n,
  sizes,
  qualities,
  onSize,
  onQuality,
  onN,
  showN,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--c-muted)",
        }}
      >
        Output
      </p>
      <Select label="Size" options={sizes} value={size} onChange={(v) => v && onSize(v)} />
      <Select label="Quality" options={qualities} value={quality} onChange={(v) => v && onQuality(v)} />
      {showN && onN && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--c-muted)",
            }}
          >
            Variations
          </label>
          <input
            type="range"
            min={1}
            max={4}
            value={n ?? 1}
            onChange={(e) => onN(Number(e.target.value))}
            style={{ accentColor: "var(--c-accent)" }}
          />
          <span style={{ fontSize: 12, color: "var(--c-muted)" }}>{n ?? 1}</span>
        </div>
      )}
    </div>
  );
}
