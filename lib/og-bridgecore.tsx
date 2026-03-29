/** Shared JSX for next/og ImageResponse (opengraph + twitter cards). */
export function BridgecoreOgImageMarkup() {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #0b1120 0%, #1e293b 45%, #0f172a 100%)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 48,
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 44,
            background: "linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 118,
            fontWeight: 800,
            color: "#0b1120",
            letterSpacing: -4,
          }}
        >
          B
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 68, fontWeight: 700, color: "#f8fafc", letterSpacing: -2 }}>
            Bridgecore
          </span>
          <span style={{ fontSize: 30, fontWeight: 500, color: "#94a3b8" }}>
            Modern trading dashboard experience
          </span>
        </div>
      </div>
    </div>
  );
}
