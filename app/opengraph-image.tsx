import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

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
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, rgb(11, 16, 32) 0%, rgb(19, 36, 76) 50%, rgb(41, 111, 214) 100%)",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 34,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            opacity: 0.9,
          }}
        >
          Legal Assist
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>
            Immigration Help
          </div>
          <div style={{ display: "flex", fontSize: 40, opacity: 0.92 }}>
            Fast intake. Clear next steps.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, opacity: 0.85 }}>
          Legal Intake Assistant
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
