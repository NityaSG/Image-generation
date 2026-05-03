// Decorative SVGs used by PageDashboard. Kept separate to keep the page file readable.

export function ApparelVisual() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <ellipse cx="90" cy="45" rx="28" ry="32" fill="rgba(181,144,90,0.18)" stroke="rgba(181,144,90,0.4)" strokeWidth="1" />
      <path
        d="M62 75 C55 85 48 105 50 135 L130 135 C132 105 125 85 118 75 C112 78 102 80 90 80 C78 80 68 78 62 75Z"
        fill="rgba(181,144,90,0.12)"
        stroke="rgba(181,144,90,0.35)"
        strokeWidth="1"
      />
      <circle cx="46" cy="155" r="8" fill="#5B2A86" />
      <circle cx="64" cy="155" r="8" fill="#E0B084" />
      <circle cx="82" cy="155" r="8" fill="#1B3A6B" />
      <circle cx="100" cy="155" r="8" fill="#2A6B35" />
      <rect x="116" y="148" width="48" height="14" rx="7" fill="rgba(181,144,90,0.2)" />
    </svg>
  );
}

export function SketchVisual() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <g opacity="0.5">
        <path
          d="M30 30 C35 25 55 20 60 30 L65 70 L55 75 L55 150 L35 150 L35 75 L25 70 Z"
          stroke="#8a8076"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="3 2"
        />
        <path d="M25 70 L15 74 L20 90 L35 93" stroke="#8a8076" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
        <path d="M65 70 L75 74 L70 90 L55 93" stroke="#8a8076" strokeWidth="1.2" fill="none" strokeDasharray="3 2" />
      </g>
      <path d="M85 90 L105 90 M99 84 L105 90 L99 96" stroke="#1a1714" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M115 30 C120 25 140 20 145 30 L150 70 L140 75 L140 150 L120 150 L120 75 L110 70 Z"
        fill="rgba(26,23,20,0.12)"
        stroke="#1a1714"
        strokeWidth="1.2"
      />
      <path d="M110 70 L100 74 L105 90 L120 93" fill="rgba(26,23,20,0.08)" stroke="#1a1714" strokeWidth="1.2" />
      <path d="M150 70 L160 74 L155 90 L140 93" fill="rgba(26,23,20,0.08)" stroke="#1a1714" strokeWidth="1.2" />
      <line x1="118" y1="100" x2="142" y2="100" stroke="#1a1714" strokeWidth="0.5" opacity="0.2" />
      <line x1="118" y1="108" x2="142" y2="108" stroke="#1a1714" strokeWidth="0.5" opacity="0.2" />
      <line x1="118" y1="116" x2="142" y2="116" stroke="#1a1714" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

export function PatternVisual() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <defs>
        <pattern id="pv1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10 2 C14 6 14 14 10 18 C6 14 6 6 10 2Z" fill="rgba(181,144,90,0.5)" />
        </pattern>
        <pattern id="pv2" x="10" y="10" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M10 2 C14 6 14 14 10 18 C6 14 6 6 10 2Z" fill="rgba(181,144,90,0.2)" />
        </pattern>
      </defs>
      <rect x="20" y="20" width="140" height="140" rx="12" fill="rgba(26,23,20,0.25)" />
      <rect x="20" y="20" width="140" height="140" rx="12" fill="url(#pv2)" />
      <rect x="20" y="20" width="140" height="140" rx="12" fill="url(#pv1)" />
      <rect x="20" y="20" width="140" height="140" rx="12" fill="none" stroke="rgba(181,144,90,0.3)" strokeWidth="1" />
      <path d="M22 90 L10 90 M14 86 L10 90 L14 94" stroke="rgba(181,144,90,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M158 90 L170 90 M166 86 L170 90 L166 94" stroke="rgba(181,144,90,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M90 22 L90 10 M86 14 L90 10 L94 14" stroke="rgba(181,144,90,0.6)" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M90 158 L90 170 M86 166 L90 170 L94 166" stroke="rgba(181,144,90,0.6)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function EditVisual() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
      <rect x="15" y="30" width="68" height="120" rx="8" fill="rgba(26,23,20,0.06)" stroke="rgba(26,23,20,0.15)" strokeWidth="1" />
      <path d="M30 60 L68 60" stroke="rgba(26,23,20,0.1)" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 80 L68 80" stroke="rgba(26,23,20,0.08)" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 100 L55 100" stroke="rgba(26,23,20,0.06)" strokeWidth="8" strokeLinecap="round" />
      <path d="M88 90 L102 90 M97 85 L102 90 L97 95" stroke="#1a1714" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="86" y="78" width="16" height="12" rx="4" fill="#1a1714" />
      <path d="M91 84 L92 85 L96 81" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="106" y="30" width="68" height="120" rx="8" fill="rgba(91,42,134,0.15)" stroke="rgba(91,42,134,0.4)" strokeWidth="1.2" />
      <path d="M121 60 L159 60" stroke="rgba(91,42,134,0.45)" strokeWidth="8" strokeLinecap="round" />
      <path d="M121 80 L159 80" stroke="rgba(181,144,90,0.45)" strokeWidth="8" strokeLinecap="round" />
      <path d="M121 100 L146 100" stroke="rgba(27,58,107,0.4)" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

export function HeroBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, oklch(0.88 0.04 65 / 0.3) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--c-border)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}

const FASHION_CONFIGS = [
  { w: 90, h: 200, hue: 30, sat: 18 },
  { w: 80, h: 160, hue: 210, sat: 15 },
  { w: 95, h: 220, hue: 340, sat: 14 },
  { w: 85, h: 190, hue: 15, sat: 18 },
  { w: 75, h: 155, hue: 160, sat: 12 },
  { w: 90, h: 210, hue: 260, sat: 13 },
];

export function FashionCard({ index }: { index: number }) {
  const c = FASHION_CONFIGS[index % FASHION_CONFIGS.length];
  return (
    <div
      style={{
        width: c.w,
        height: c.h,
        borderRadius: 10,
        flexShrink: 0,
        background: `linear-gradient(160deg, hsl(${c.hue},${c.sat}%,91%) 0%, hsl(${c.hue},${c.sat + 6}%,83%) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid hsl(${c.hue},${c.sat}%,86%)`,
      }}
    >
      <svg width="36" height="60" viewBox="0 0 48 80" fill="none">
        <path
          d="M24 8 C16 8 10 14 10 20 L8 36 L16 38 L16 72 L32 72 L32 38 L40 36 L38 20 C38 14 32 8 24 8Z"
          fill={`hsl(${c.hue},${c.sat + 4}%,68%)`}
          opacity="0.5"
        />
      </svg>
    </div>
  );
}
