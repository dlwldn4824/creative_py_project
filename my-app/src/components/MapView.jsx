// src/components/MapView.jsx
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

export default function MapView({ regions, onSelectRegion, selectedRegion }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const visibleRegions = useMemo(() => {
    if (!regions || !regions.length) return [];
    return regions.filter(
      (r) =>
        Number.isFinite(r.lat) &&
        Number.isFinite(r.lng) &&
        r.lat !== 0 &&
        r.lng !== 0
    );
  }, [regions]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.5665, 126.978],
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (!visibleRegions.length) return;

    const bounds = [];

    visibleRegions.forEach((r, idx) => {
      const lat = r.lat;
      const lng = r.lng;
      const isTop3 = idx < 3;
      const isSelected = selectedRegion && selectedRegion.id === r.id;

      // 선택된 지역은 노란색, TOP 3는 빨간색, 나머지는 파란색
      let color, fillColor;
      if (isSelected) {
        color = "#f59e0b";
        fillColor = "#fbbf24";
      } else if (isTop3) {
        color = "#dc2626";
        fillColor = "#ef4444";
      } else {
        color = "#2563eb";
        fillColor = "#3b82f6";
      }

      const marker = L.circleMarker([lat, lng], {
        radius: isSelected ? 16 : isTop3 ? 14 : 12,
        weight: isSelected ? 4 : isTop3 ? 3 : 3,
        color: color,
        fillColor: fillColor,
        fillOpacity: 0.95,
        opacity: 1,
      });

      const scoreText =
        typeof r.score === "number" && Number.isFinite(r.score)
          ? r.score.toFixed(3)
          : "-";

      marker.bindPopup(
        `<b>${idx + 1}위</b> ${r.gu} ${r.name}<br/>총점: ${scoreText}`
      );

      // ⭐ 마커 클릭 시 부모에 선택 알리기
      marker.on("click", () => {
        if (onSelectRegion) onSelectRegion(r);
      });

      marker.addTo(layer);
      bounds.push([lat, lng]);
    });

    // 선택된 지역이 있으면 해당 지역으로 확대, 없으면 전체 보기
    if (selectedRegion && selectedRegion.lat && selectedRegion.lng) {
      const selectedLat = selectedRegion.lat;
      const selectedLng = selectedRegion.lng;
      if (Number.isFinite(selectedLat) && Number.isFinite(selectedLng)) {
        // 애니메이션 최소화 - 짧은 시간으로 부드럽게 이동
        map.setView([selectedLat, selectedLng], 14, {
          animate: true,
          duration: 0.15,
        });
      }
    } else if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [visibleRegions, onSelectRegion, selectedRegion]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="map-leaflet-root" />
      {!visibleRegions.length && (
        <div className="map-empty-overlay">표시할 위치 정보가 없습니다.</div>
      )}
    </div>
  );
}
