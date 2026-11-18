import { ImageResponse } from "next/og";
import { BlobLogo } from "@/lib/logo";

// PNG icons for the web app manifest: /pwa-icon/192 and /pwa-icon/512.
// The mark is scaled down a little so the icon also works as a "maskable" icon on Android.
const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const px = Number(size);
  if (!SIZES.includes(px)) return new Response("Not found", { status: 404 });
  return new ImageResponse(<BlobLogo size={px} scale={0.82} />, { width: px, height: px });
}
