import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf7f2",
          color: "#0f1b2d",
        }}
      >
        <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: 12, textTransform: "uppercase" }}>
          {siteConfig.name}
        </div>
        <div style={{ width: 96, height: 3, background: "#b08d57", margin: "36px 0" }} />
        <div style={{ fontSize: 34, color: "#52627d", maxWidth: 820, textAlign: "center" }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    size,
  );
}
