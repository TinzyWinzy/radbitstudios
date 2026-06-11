import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Radbit — Sovereign Digital Infrastructure for African Enterprises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function LocaleOgImage() {
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
            background: "linear-gradient(135deg, #1A8A7A 0%, #0D6B5E 50%, #E8A838 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", fontFamily: "Arial, sans-serif", letterSpacing: "-1px" }}>
            R
          </span>
          <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#E8A838" }} />
        </div>
        <span style={{ color: "#888", fontSize: 18, fontWeight: 500 }}>
          radbitstudios.co.zw
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ margin: 0, fontSize: 62, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
          Radbit
        </h1>
        <p style={{ margin: 0, fontSize: 26, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
          Sovereign digital infrastructure for the African enterprise
        </p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, fontWeight: 500 }}>
          Intelligence · Automation · Compliance
        </span>
        <span style={{ color: "#1A8A7A", fontSize: 18, fontWeight: 700 }}>
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
