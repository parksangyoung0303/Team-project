/* global naver */

import { useEffect, useState } from "react";

function NaverMap() {
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    if (!window.naver || !window.naver.maps) {
      console.error("네이버 지도 API가 아직 로드되지 않았어요.");
      return;
    }

    const map = new naver.maps.Map("map", {
      center: new naver.maps.LatLng(36.5, 127.5),
      zoom: 7,
    });

    // 전체 경계를 담을 bounds 객체
    const totalBounds = new naver.maps.LatLngBounds();

    fetch("/data/korea_sgg.geojson")
      .then((res) => res.json())
      .then((data) => {
        data.features.forEach((feature) => {
          const name = feature.properties.SIG_KOR_NM;
          const coords = feature.geometry.coordinates;
          const type = feature.geometry.type;

          let paths = [];

          if (type === "Polygon") {
            paths = coords.map((ring) =>
              ring.map(([lng, lat]) => {
                const latlng = new naver.maps.LatLng(lat, lng);
                totalBounds.extend(latlng);
                return latlng;
              })
            );
          } else if (type === "MultiPolygon") {
            paths = coords.map((polygon) =>
              polygon[0].map(([lng, lat]) => {
                const latlng = new naver.maps.LatLng(lat, lng);
                totalBounds.extend(latlng);
                return latlng;
              })
            );
          }

          const originalColor = "#b4e2d5"; // 옅은 초록색
          const hoverColor = "#fca5a5";     // 연한 빨간색

          const polygon = new naver.maps.Polygon({
            map,
            paths,
            clickable: true,
            strokeColor: "#2563eb",
            strokeWeight: 1,
            fillColor: originalColor,
            fillOpacity: 0.4,
          });

          naver.maps.Event.addListener(polygon, "mouseover", () => {
            polygon.setOptions({
              fillColor: hoverColor,
              fillOpacity: 0.6,
            });
          });

          naver.maps.Event.addListener(polygon, "mouseout", () => {
            polygon.setOptions({
              fillColor: originalColor,
              fillOpacity: 0.4,
            });
          });

          naver.maps.Event.addListener(polygon, "click", () => {
            setSelectedRegion(name);
          });
        });

        // 모든 폴리곤 그린 후 지도 위치 자동 조정
        map.fitBounds(totalBounds);
      })
      .catch((err) => {
        console.error("GeoJSON 로딩 실패:", err);
      });
  }, []);

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100vh" }} />

      {selectedRegion && (
        <div
          style={{
            position: "absolute",
            top: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            padding: "1rem 2rem",
            border: "1px solid #ccc",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          <strong>{selectedRegion}</strong> 지역을 클릭했어요!
          <button
            onClick={() => setSelectedRegion(null)}
            style={{ marginLeft: "1rem" }}
          >
            닫기
          </button>
        </div>
      )}
    </>
  );
}

export default NaverMap;
