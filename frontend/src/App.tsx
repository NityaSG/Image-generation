import { useState } from "react";

import { TopNav, type PageId } from "./nav/TopNav";
import { PageApparel } from "./pages/PageApparel";
import { PageDashboard } from "./pages/PageDashboard";
import { PageEdit } from "./pages/PageEdit";
import { PageGallery } from "./pages/PageGallery";
import { PagePattern } from "./pages/PagePattern";
import { PageSketch } from "./pages/PageSketch";
import { GalleryProvider } from "./theme/GalleryContext";
import { ThemeProvider } from "./theme/ThemeContext";
import { TweaksPanel } from "./tweaks/TweaksPanel";

function PageHost({ activePage, onNavigate }: { activePage: PageId; onNavigate: (id: PageId) => void }) {
  switch (activePage) {
    case "dashboard":
      return <PageDashboard onNavigate={onNavigate} />;
    case "apparel":
      return <PageApparel />;
    case "sketch":
      return <PageSketch />;
    case "pattern":
      return <PagePattern />;
    case "edit":
      return <PageEdit />;
    case "gallery":
      return <PageGallery />;
    default:
      return <PageDashboard onNavigate={onNavigate} />;
  }
}

function Shell() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <TopNav activePage={activePage} onNavigate={setActivePage} />
        <main
          className="page-anim"
          key={activePage}
          style={{
            flex: 1,
            display: "flex",
            minHeight: 0,
            overflow: activePage === "dashboard" || activePage === "gallery" ? "auto" : "hidden",
          }}
        >
          <PageHost activePage={activePage} onNavigate={setActivePage} />
        </main>
      </div>
      <TweaksPanel />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <GalleryProvider>
        <Shell />
      </GalleryProvider>
    </ThemeProvider>
  );
}
