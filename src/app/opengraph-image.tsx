import { ImageResponse } from "next/og";
import { BlobLogo } from "@/lib/logo";

// Preview card shown when a link to the app is shared (chat apps, social, search).
export const alt = "Habit Tracker: every habit, one place";
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
          alignItems: "center",
          justifyContent: "center",
          gap: 56,
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", borderRadius: 56, overflow: "hidden", border: "2px solid #e4e4e7" }}>
          <BlobLogo size={300} scale={0.9} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: "#111113", letterSpacing: -2 }}>Habit Tracker</div>
          <div style={{ fontSize: 38, color: "#52525b", marginTop: 14 }}>Every habit. One place.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
