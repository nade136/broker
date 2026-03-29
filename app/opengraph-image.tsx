import { ImageResponse } from "next/og";
import { BridgecoreOgImageMarkup } from "@/lib/og-bridgecore";

export const runtime = "edge";

export const alt = "Bridgecore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<BridgecoreOgImageMarkup />, {
    ...size,
  });
}
