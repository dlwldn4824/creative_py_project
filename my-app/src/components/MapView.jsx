// src/components/MapView.jsx
import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

export default function MapView({ regions, onSelectRegion }) {
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

      const marker = L.circleMarker([lat, lng], {
        radius: isTop3 ? 9 : 7,
        weight: 2,
        color: isTop3 ? "#ff4d4f" : "#4f7cff",
        fillColor: isTop3 ? "#ff7875" : "#7c9cff",
        fillOpacity: 0.9,
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

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [visibleRegions, onSelectRegion]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="map-leaflet-root" />
      {!visibleRegions.length && (
        <div className="map-empty-overlay">표시할 위치 정보가 없습니다.</div>
      )}
    </div>
  );
}
