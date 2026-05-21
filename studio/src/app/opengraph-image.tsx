// /src/app/opengraph-image.tsx
// Global OG image generator — used as fallback by Next.js for all pages
// that don't have a page-specific opengraph-image.tsx next to them.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Radbit SME Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GlobalOgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 80px",
        background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d0d0d 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "linear-gradient(135deg, #33D6C2 0%, #1A8A7A 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 800,
            color: "#fff",
            fontFamily: "Arial, sans-serif",
          }}
        >
          R
        </div>
        <span style={{ color: "#888", fontSize: 18, fontWeight: 500 }}>
          radbitstudios.co.zw
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 62,
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Radbit SME Hub
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.4,
          }}
        >
          AI-powered business tools for Zimbabwean enterprises
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 500 }}>
          Build · Scale · Own Your Future
        </span>
        <span style={{ color: "#33D6C2", fontSize: 18, fontWeight: 700 }}>
          radbitstudios.co.zw
        </span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
