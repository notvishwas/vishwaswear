import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f1b2d",
          color: "#b08d57",
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {siteConfig.name.charAt(0).toUpperCase()}
      </div>
    ),
    size,
  );
}
