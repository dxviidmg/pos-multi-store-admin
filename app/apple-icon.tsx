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
          background: "#0B1B4D",
        }}
      >
        <svg width="130" height="130" viewBox="0 0 100 100">
          <rect x="11" y="12" width="78" height="58" rx="13" fill="none" stroke="#FFFFFF" strokeWidth="7" />
          <rect x="27" y="46" width="11" height="16" rx="3" fill="#FFFFFF" />
          <rect x="45" y="36" width="11" height="26" rx="3" fill="#FFFFFF" />
          <rect x="63" y="24" width="11" height="38" rx="3" fill="#FFB020" />
          <path d="M44 70 L40 83 H60 L56 70 Z" fill="#FFFFFF" />
          <rect x="30" y="83" width="40" height="7" rx="3.5" fill="#FFFFFF" />
        </svg>
      </div>
    ),
    size
  );
}
