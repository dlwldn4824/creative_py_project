// src/components/MapView.jsx
import React from "react";

export default function MapView({ regions = [] }) {
  console.log("MapView regions:", regions);

  // 1) 데이터가 아예 없을 때
  if (!regions.length) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#999",
          borderRadius: 8,
          border: "1px solid #eee",
          background: "#fafafa",
        }}
      >
        지역 데이터를 불러오는 중입니다…
      </div>
    );
  }

  // 2) 위도/경도 있는 지역만 추리기
  const valid = regions.filter(
    (r) =>
      Number.isFinite(r.lat) &&
      Number.isFinite(r.lng) &&
      !(r.lat === 0 && r.lng === 0)
  );

  // 좌표가 하나도 없으면 일단 리스트라도 보여 주기 (디버깅용)
  if (!valid.length) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 240,
          padding: 16,
          borderRadius: 8,
          border: "1px solid #eee",
          background: "#fafafa",
          fontSize: 14,
          color: "#555",
          overflowY: "auto",
        }}
      >
        <p style={{ marginBottom: 8 }}>
          위도/경도 정보가 없어 간단한 목록으로 표시합니다.
        </p>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          {regions.map((r) => (
            <li key={r.id}>
              {r.name} ({r.gu})
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // 3) 간단한 점 지도용 스케일 계산
  const lats = valid.map((r) => r.lat);
  const lngs = valid.map((r) => r.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 0.01;
  const lngSpan = maxLng - minLng || 0.01;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 240,
        borderRadius: 8,
        background: "#f5f5f7",
        border: "1px solid #eee",
        overflow: "hidden",
      }}
    >
      {valid.map((r) => {
        const x = ((r.lng - minLng) / lngSpan) * 100;
        const y = ((maxLat - r.lat) / latSpan) * 100; // 위쪽이 0이 되도록 뒤집기

        return (
          <div
            key={r.id}
            title={`${r.name} (${r.gu})`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "999px",
                background: "#4f46e5",
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
