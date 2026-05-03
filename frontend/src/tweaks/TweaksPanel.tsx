import { useState } from "react";

import { useTheme } from "../theme/ThemeContext";

const PANEL_STYLE = `
  .twk-panel { position: fixed; right: 16px; bottom: 16px; z-index: 2147483646; width: 280px;
    max-height: calc(100vh - 32px); display: flex; flex-direction: column;
    background: rgba(250,249,247,0.9); color: #29261b;
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(255,255,255,0.6); border-radius: 14px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 40px rgba(0,0,0,0.18);
    font: 11.5px/1.4 ui-sans-serif, system-ui, sans-serif; overflow: hidden; }
  .dark .twk-panel { background: rgba(26,24,20,0.92); color: #f0ece4; border-color: rgba(255,255,255,0.08); }
  .twk-hd { display: flex; align-items: center; justify-content: space-between; padding: 10px 8px 10px 14px; }
  .twk-x { appearance: none; border: 0; background: transparent; color: inherit; opacity: 0.55;
    width: 22px; height: 22px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .twk-x:hover { background: rgba(0,0,0,0.06); opacity: 1; }
  .twk-body { padding: 2px 14px 14px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
  .twk-sect { font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.5; padding: 8px 0 0; }
  .twk-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .twk-toggle { position: relative; width: 34px; height: 20px; border: 0; border-radius: 999px;
    background: rgba(0,0,0,0.18); cursor: pointer; padding: 0; transition: background 0.15s; }
  .twk-toggle[data-on="1"] { background: #34c759; }
  .twk-toggle i { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform 0.15s; }
  .twk-toggle[data-on="1"] i { transform: translateX(14px); }
  .twk-swatch { appearance: none; -webkit-appearance: none; width: 56px; height: 22px;
    border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; padding: 0; cursor: pointer; background: transparent; }
  .twk-swatch::-webkit-color-swatch-wrapper { padding: 0; }
  .twk-swatch::-webkit-color-swatch { border: 0; border-radius: 5px; }
  .twk-fab { position: fixed; right: 16px; bottom: 16px; z-index: 2147483645;
    width: 40px; height: 40px; border-radius: 50%;
    background: var(--c-accent); color: #fff; border: none; cursor: pointer;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center;
    font-size: 16px; }
`;

export function TweaksPanel() {
  const { tweaks, setTweak, toggleDark } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{PANEL_STYLE}</style>
      {!open && (
        <button
          type="button"
          className="twk-fab"
          onClick={() => setOpen(true)}
          title="Theme tweaks"
        >
          ✦
        </button>
      )}
      {open && (
        <div className="twk-panel" data-noncommentable>
          <div className="twk-hd">
            <b>Theme tweaks</b>
            <button className="twk-x" onClick={() => setOpen(false)} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="twk-body">
            <div className="twk-sect">Theme</div>
            <div className="twk-row">
              <span>Dark mode</span>
              <button
                type="button"
                className="twk-toggle"
                data-on={tweaks.dark ? "1" : "0"}
                role="switch"
                aria-checked={tweaks.dark}
                onClick={toggleDark}
              >
                <i />
              </button>
            </div>

            <div className="twk-sect">Brand colours</div>
            <div className="twk-row">
              <span>Accent (primary)</span>
              <input
                type="color"
                className="twk-swatch"
                value={tweaks.accent}
                onChange={(e) => setTweak("accent", e.target.value)}
              />
            </div>
            <div className="twk-row">
              <span>Accent 2 (gold)</span>
              <input
                type="color"
                className="twk-swatch"
                value={tweaks.accent2}
                onChange={(e) => setTweak("accent2", e.target.value)}
              />
            </div>

            <div className="twk-sect">Density</div>
            <div className="twk-row">
              <span>Form density</span>
              <select
                value={tweaks.density}
                onChange={(e) => setTweak("density", e.target.value as "compact" | "comfortable")}
                style={{ height: 26, borderRadius: 6, padding: "0 8px", fontSize: 12 }}
              >
                <option value="compact">compact</option>
                <option value="comfortable">comfortable</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
