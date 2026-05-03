import type { ReactNode } from "react";

export function FormGrid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "16px 20px",
      }}
    >
      {children}
    </div>
  );
}
