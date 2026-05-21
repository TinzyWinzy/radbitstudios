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
        background: "linear-gradient(135deg, #33D6C2 0%, #1A8A7A 100%)",
        borderRadius: 8,
        fontFamily: "system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 20,
        color: "white",
      }}
    >
      R
    </div>,
    { width: 32, height: 32 },
  );
}
