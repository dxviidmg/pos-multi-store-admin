import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121a45",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="#ffb020" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6" />
        </svg>
      </div>
    ),
    size
  );
}
