import { ImageResponse } from "next/og";
import { BlobLogo } from "@/lib/logo";

// iOS home-screen icon. iOS applies its own rounded mask, so the tile is a full-bleed square.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<BlobLogo size={180} />, { ...size });
}
