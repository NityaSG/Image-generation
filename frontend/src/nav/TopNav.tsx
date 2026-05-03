import { useState } from "react";

import { useGallery } from "../theme/GalleryContext";
import { useTheme } from "../theme/ThemeContext";
import { IchNextLogo } from "./IchNextLogo";

export type PageId =
  | "dashboard"
  | "apparel"
  | "sketch"
  | "pattern"
  | "edit"
  | "gallery";

const NAV_ITEMS: Array<{ id: PageId; label: string; icon: string }> = [
  { id: "dashboard", label: "Dashboard", icon: "⬜" },
  { id: "apparel", label: "Apparel Dropdowns", icon: "▣" },
  { id: "sketch", label: "Sketch → Realistic", icon: "◎" },
  { id: "pattern", label: "Pattern Generation", icon: "◈" },
  { id: "edit", label: "Iterate & Edit", icon: "◑" },
  { id: "gallery", label: "Gallery", icon: "◧" },
];

interface NavLinkProps {
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number | null;
}

function NavLink({ label, active, onClick, badge }: NavLinkProps) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 14px",
        borderRadius: 5,
        border: "none",
        background: active ? "var(--c-surface)" : "transparent",
        color: active ? "var(--c-fg)" : hover ? "var(--c-fg)" : "var(--c-muted)",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        position: "relative",
      }}
    >
      {label}
      {badge != null && badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            minWidth: 16,
            height: 16,
            background: "var(--c-accent2)",
            color: "#fff",
            borderRadius: 8,
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function TopNav({
  activePage,
  onNavigate,
}: {
  activePage: PageId;
  onNavigate: (id: PageId) => void;
}) {
  const { tweaks, toggleDark } = useTheme();
  const { gallery } = useGallery();

  return (
    <nav
      style={{
        height: "var(--nav-h)",
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid var(--c-border)",
        padding: "0 28px",
        background: "var(--c-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        flexShrink: 0,
        gap: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 40, cursor: "pointer" }}
        onClick={() => onNavigate("dashboard")}
      >
        <IchNextLogo />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, overflowX: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            label={item.label}
            active={activePage === item.id}
            onClick={() => onNavigate(item.id)}
            badge={item.id === "gallery" ? gallery.length : null}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 24 }}>
        <button
          type="button"
          onClick={toggleDark}
          title="Toggle dark mode"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1px solid var(--c-border)",
            background: "var(--c-surface)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {tweaks.dark ? "☀" : "☾"}
        </button>
      </div>
    </nav>
  );
}
