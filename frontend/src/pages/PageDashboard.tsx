import { type ReactNode, useEffect, useState } from "react";

import { useGallery } from "../theme/GalleryContext";
import type { PageId } from "../nav/TopNav";
import {
  ApparelVisual,
  EditVisual,
  FashionCard,
  HeroBackground,
  PatternVisual,
  SketchVisual,
} from "./dashboard-visuals";

interface Tool {
  id: PageId;
  number: string;
  title: string;
  desc: string;
  tag: string;
  bg: string;
  fg: string;
  accent: string;
  visual: ReactNode;
}

const TOOLS: Tool[] = [
  {
    id: "apparel",
    number: "01",
    title: "Apparel\nfrom Dropdowns",
    desc: "Cascading taxonomy → structured prompt → photorealistic product shot.",
    tag: "Text → Image",
    bg: "#1a1714",
    fg: "#f0ece4",
    accent: "#b5905a",
    visual: <ApparelVisual />,
  },
  {
    id: "sketch",
    number: "02",
    title: "Sketch →\nRealistic",
    desc: "Upload a hand sketch. Preserves silhouette while adding fabric, colour and light.",
    tag: "Image → Image",
    bg: "#f0ece4",
    fg: "#1a1714",
    accent: "#1a1714",
    visual: <SketchVisual />,
  },
  {
    id: "pattern",
    number: "03",
    title: "Pattern\nGeneration",
    desc: "Brief + cultural family + palette → fabric-printable seamless designs.",
    tag: "Text → Textile",
    bg: "#1a1714",
    fg: "#f0ece4",
    accent: "#b5905a",
    visual: <PatternVisual />,
  },
  {
    id: "edit",
    number: "04",
    title: "Iterate\n& Edit",
    desc: "Single-change refinements that chain into multi-turn creative control.",
    tag: "Edit → Refine",
    bg: "#f0ece4",
    fg: "#1a1714",
    accent: "#1a1714",
    visual: <EditVisual />,
  },
];

function BentoCard({ tool, onClick, delay }: { tool: Tool; onClick: () => void; delay: number }) {
  const [hover, setHover] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay + 200);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: 20,
        cursor: "pointer",
        overflow: "hidden",
        background: tool.bg,
        border: `1px solid ${hover ? tool.accent : "transparent"}`,
        transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s",
        transform: hover ? "translateY(-3px)" : "none",
        boxShadow: hover ? "0 20px 60px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.06)",
        opacity: vis ? 1 : 0,
        display: "flex",
        flexDirection: "column",
        minHeight: 320,
        position: "relative",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 40px 0",
          position: "relative",
          minHeight: 200,
        }}
      >
        {tool.visual}
      </div>
      <div style={{ padding: "24px 32px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: tool.accent,
            }}
          >
            {tool.tag}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: tool.accent, opacity: 0.4 }}>{tool.number}</span>
        </div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 22,
            fontWeight: 700,
            color: tool.fg,
            lineHeight: 1.2,
            whiteSpace: "pre-line",
            letterSpacing: "-0.01em",
          }}
        >
          {tool.title}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: tool.fg, opacity: 0.55, lineHeight: 1.6 }}>{tool.desc}</p>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 28,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: tool.accent + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: hover ? "translateX(3px)" : "none",
          transition: "transform 0.2s",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke={tool.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function PageDashboard({ onNavigate }: { onNavigate: (id: PageId) => void }) {
  const { gallery } = useGallery();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div style={{ overflowY: "auto", flex: 1, background: "var(--c-bg)" }}>
      {/* Hero */}
      <section
        style={{
          minHeight: "calc(100vh - var(--nav-h))",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
          position: "relative",
          textAlign: "center",
        }}
      >
        <HeroBackground />
        <div
          style={{
            position: "relative",
            zIndex: 2,
            transform: mounted ? "none" : "translateY(16px)",
            opacity: mounted ? 1 : 0,
            transition: "transform 0.8s ease, opacity 0.8s ease",
            maxWidth: 640,
            background: "var(--c-bg)",
            padding: "24px 48px 16px",
            borderRadius: 24,
          }}
        >
          <p
            style={{
              margin: "0 0 16px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--c-accent2)",
            }}
          >
            Fashion Intelligence Platform
          </p>
          <h1
            style={{
              margin: "0 0 20px",
              fontSize: "clamp(36px, 4.5vw, 64px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.08,
              color: "var(--c-fg)",
            }}
          >
            Design the future
            <br />
            of fashion with AI.
          </h1>
          <p
            style={{
              margin: "0 auto 40px",
              fontSize: "clamp(14px, 1.3vw, 16px)",
              color: "var(--c-muted)",
              lineHeight: 1.75,
              maxWidth: 400,
            }}
          >
            gpt-image-2 powered apparel & textile generation, driven by your existing taxonomy.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => onNavigate("apparel")}
              style={{
                padding: "14px 32px",
                fontSize: 14,
                fontWeight: 600,
                background: "var(--c-fg)",
                color: "var(--c-bg)",
                border: "none",
                borderRadius: 100,
                cursor: "pointer",
              }}
            >
              Start generating
            </button>
            <button
              type="button"
              onClick={() => onNavigate("gallery")}
              style={{
                padding: "14px 32px",
                fontSize: 14,
                fontWeight: 500,
                background: "transparent",
                color: "var(--c-fg)",
                border: "1px solid var(--c-border)",
                borderRadius: 100,
                cursor: "pointer",
              }}
            >
              View gallery {gallery.length > 0 && `(${gallery.length})`}
            </button>
          </div>
        </div>

        {/* Decorative flanks */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: 0.2,
            pointerEvents: "none",
            padding: "0 24px",
            maxWidth: 140,
            zIndex: 0,
          }}
        >
          {[0, 1, 2].map((i) => (
            <FashionCard key={i} index={i} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            opacity: 0.2,
            pointerEvents: "none",
            padding: "0 24px",
            maxWidth: 140,
            zIndex: 0,
          }}
        >
          {[3, 4, 5].map((i) => (
            <FashionCard key={i} index={i} />
          ))}
        </div>
      </section>

      {/* Bento */}
      <section style={{ padding: "80px 48px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--c-muted)",
            }}
          >
            Four Workflows
          </p>
          <h2
            style={{
              margin: 0,
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              color: "var(--c-fg)",
              lineHeight: 1.1,
            }}
          >
            Every stage of creation,
            <br />
            covered.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {TOOLS.map((t, i) => (
            <BentoCard key={t.id} tool={t} onClick={() => onNavigate(t.id)} delay={i * 80} />
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <section
        style={{
          margin: "0 48px 80px",
          borderRadius: 20,
          background: "var(--c-fg)",
          color: "var(--c-bg)",
          padding: "48px 64px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 32,
        }}
      >
        {[
          { val: "4", label: "Generation tools" },
          { val: "gpt-img2", label: "Foundation model" },
          { val: "5", label: "Output sizes" },
          {
            val: gallery.length > 0 ? String(gallery.length) : "∞",
            label: gallery.length > 0 ? "Saved images" : "Possibilities",
          },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <p
              style={{
                margin: "0 0 6px",
                fontSize: "clamp(28px, 3vw, 42px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--c-bg)",
              }}
            >
              {s.val}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(240,236,228,0.55)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* Config footer */}
      <section style={{ padding: "0 48px 80px" }}>
        <div
          style={{
            padding: "24px 32px",
            borderRadius: 16,
            border: "1px solid var(--c-border)",
            background: "var(--c-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34c759" }} />
            <span style={{ fontSize: 13, color: "var(--c-fg)", fontWeight: 500 }}>Platform ready</span>
            <span style={{ fontSize: 12, color: "var(--c-muted)" }}>
              FastAPI backend at localhost:8000 · gpt-image-2 · Azure endpoint
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "apparel", label: "Apparel Dropdowns" },
              { id: "sketch", label: "Sketch → Realistic" },
              { id: "pattern", label: "Pattern Generation" },
              { id: "edit", label: "Iterate & Edit" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onNavigate(t.id as PageId)}
                style={{
                  padding: "6px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  background: "var(--c-bg)",
                  border: "1px solid var(--c-border)",
                  borderRadius: 100,
                  cursor: "pointer",
                  color: "var(--c-muted)",
                  letterSpacing: "0.02em",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
