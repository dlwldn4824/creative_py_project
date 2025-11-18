// src/components/MapView.jsx
import React from "react";

export default function MapView({ regions, onSelectRegion, selectedId }) {
  console.log("🔥 MapView regions:", regions);

  const list = Array.isArray(regions) ? regions : [];

  const baseStyle = {
    position: "relative",
    width: "100%",
    height: "100%",
    minHeight: 240,
    borderRadius: 8,
    background: "#f5f5f7",
    border: "1px solid #eee",
    overflow: "hidden",
    fontSize: 14,
  };

  // 1. 데이터 없음
  if (list.length === 0) {
    return (
      <div style={baseStyle}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999",
          }}
        >
          지역 데이터를 불러오는 중입니다…
        </div>
      </div>
    );
  }

  // 2. 유효한 lat/lng
  const valid = list.filter(
    (r) =>
      Number.isFinite(r.lat) &&
      Number.isFinite(r.lng) &&
      !(r.lat === 0 && r.lng === 0)
  );

  // lat/lng 없으면 리스트로 보여주기
  if (valid.length === 0) {
    return (
      <div style={baseStyle}>
        <div
          style={{
            padding: 16,
            height: "100%",
            overflowY: "auto",
            color: "#555",
          }}
        >
          <p style={{ marginBottom: 8 }}>
            위도/경도 정보가 없어 간단한 목록으로 표시합니다.
          </p>
          <ol style={{ paddingLeft: 20, margin: 0 }}>
            {list.map((r) => (
              <li key={r.id}>
                {r.name} ({r.gu})
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  // 3. 점 지도 스케일 계산
  const lats = valid.map((r) => r.lat);
  const lngs = valid.map((r) => r.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  return (
    <div style={baseStyle}>
      {valid.map((r) => {
        const x = ((r.lng - minLng) / lngSpan) * 100;
        const y = ((maxLat - r.lat) / latSpan) * 100;

        const isActive = selectedId && selectedId === r.id;

        return (
          <div
            key={r.id}
            title={`${r.name} (${r.gu})`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              cursor: onSelectRegion ? "pointer" : "default",
            }}
            onClick={() => onSelectRegion && onSelectRegion(r)}
          >
            <div
              style={{
                width: isActive ? 16 : 12,
                height: isActive ? 16 : 12,
                borderRadius: "999px",
                background: isActive ? "#dc2626" : "#4f46e5",
                border: "2px solid #ffffff",
                boxShadow: "0 0 4px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
