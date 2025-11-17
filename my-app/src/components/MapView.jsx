// src/components/MapView.jsx
import { useEffect, useRef } from "react";

export default function MapView({ regions }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Kakao 지도 API 로드
    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=카카오_JS_키_여기에";
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        // 지도 생성
        const center = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울 중심
        const options = {
          center,
          level: 5,
        };

        const map = new window.kakao.maps.Map(mapRef.current, options);
        mapInstanceRef.current = map;

        // TOP4 마커 찍기
        regions.forEach((r) => {
          if (!r.lat || !r.lng) return;

          const markerPos = new window.kakao.maps.LatLng(r.lat, r.lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPos,
            map,
          });

          const iwContent = `
            <div style="padding:8px;font-size:13px;">
              <b>${r.name}</b> (${r.gu})<br/>
              주거: ${r.housing}<br/>
              생활: ${r.life}<br/>
              치안: ${r.safety}<br/>
              교통: ${r.transport}
            </div>
          `;
          const infowindow = new window.kakao.maps.InfoWindow({
            content: iwContent,
          });

          window.kakao.maps.event.addListener(marker, "click", () => {
            infowindow.open(map, marker);
          });
        });
      });
    };

    document.head.appendChild(script);

    return () => {
      // cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [regions]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "10px",
      }}
    />
  );
}
