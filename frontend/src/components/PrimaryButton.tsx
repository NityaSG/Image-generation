import type { ReactNode } from "react";
import { SpinIcon } from "./SpinIcon";

interface Props {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ children, onClick, disabled, loading }: Props) {
  const dim = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dim}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "11px 28px",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.04em",
        background: dim ? "var(--c-border)" : "var(--c-accent)",
        color: "#fff",
        border: "none",
        borderRadius: 4,
        cursor: dim ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        width: "100%",
      }}
    >
      {loading && <SpinIcon />}
      {children}
    </button>
  );
}
