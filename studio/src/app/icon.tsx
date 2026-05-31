import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1A8A7A 0%, #0D6B5E 50%, #E8A838 100%)",
        borderRadius: 7,
        position: "relative",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <text
          x="3"
          y="18"
          fill="white"
          fontSize="19"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-1"
        >
          R
        </text>
        <circle cx="19" cy="4" r="2.5" fill="#E8A838" />
      </svg>
    </div>,
    { width: 32, height: 32 },
  );
}
