// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ 추가
import SliderRow from "../components/SliderRow.jsx";
import DetailPanel from "../components/DetailPanel.jsx";
import MapView from "../components/MapView.jsx";
import TrendingRegions from "../components/TrendingRegions.jsx";

import csvText from "../data/final_data.csv?raw";

const DEFAULT_WEIGHTS = {
  housing: 0.25,
  life: 0.25,
  safety: 0.25,
  transport: 0.25,
};

/** CSV 한 줄(row) → 우리 앱에서 쓰기 편한 객체 */
function mapRowToRegion(row, index) {
  const name = (row["법정동"] || row["동명"] || row["동"] || "").trim();
  const gu = (row["자치구"] || row["구명"] || row["구"] || "").trim();

  return {
    id: name && gu ? `${gu}-${name}` : `row-${index}`,
    name,
    gu,

    housing: Number(row["주거점수"] || 0),
    transport: Number(row["교통점수"] || 0),
    safety: Number(row["치안점수"] || 0),
    life: Number(row["생활점수"] || row["생활점수_y"] || 0),

    // 👉 앞으로 추가할 세부 컬럼 자리 (예: 평균 월세)
    avgRent: Number(row["평균월세"] || 0),

    lat: Number(row["위도(법정동)"] || row["위도"] || row["lat"] || row["LAT"] || 0),
    lng: Number(row["경도(법정동)"] || row["경도"] || row["lng"] || row["LNG"] || 0),
    nearestStation: row["가장가까운역"] || "",
    distanceKm: Number(row["거리_km"] || 0),
    avgNoise: Number(row["평균소음(dB)"] || 0),
    parkCount: Number(row["공원수"] || 0),
    hospitalCount: Number(row["병의원수"] || 0),
    shopCount: Number(row["점포수"] || 0),

    // ⭐ 원본 컬럼 전부
    raw: row,
  };
}


/** CSV 텍스트 → region 배열 */
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const [headerLine, ...rows] = lines;

  const headers = headerLine
    .split(",")
    .map((h) => h.replace(/^\uFEFF/, "").trim());

  console.log("CSV HEADER:", headers);

  const result = rows
    .filter((line) => line.trim().length > 0)
    .map((rowLine, index) => {
      const cols = rowLine.split(",");
      const raw = {};
      headers.forEach((key, i) => {
        raw[key] = (cols[i] ?? "").trim();
      });
      return mapRowToRegion(raw, index);
    });

  console.log("PARSED LENGTH:", result.length);
  console.log("PARSED SAMPLE:", result.slice(0, 5));
  return result;
}

// 안전한 toFixed
const fmt = (n, digits = 3) =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(digits) : "0.000";

export default function Home() {
  const [regions, setRegions] = useState([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [selectedGu, setSelectedGu] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState(null);

  const navigate = useNavigate(); // ✅ 네비게이터
  const location = useLocation();
  const currentPath = location.pathname;

  // ✅ CSV 파싱
  useEffect(() => {
    try {
      console.log("RAW CSV TEXT SAMPLE:", csvText.slice(0, 200));
      const parsed = parseCsv(csvText);
      setRegions(parsed);
    } catch (err) {
      console.error("CSV parse error:", err);
    }
  }, []);

  // ✅ 구 목록
  const guOptions = useMemo(() => {
    const set = new Set(regions.map((r) => r.gu).filter(Boolean));
    return ["전체", ...Array.from(set)];
  }, [regions]);

  // ✅ 선택된 구에 따른 필터링
  const filteredRegions = useMemo(() => {
    if (!regions.length) return [];
    if (selectedGu === "전체") return regions;
    return regions.filter((r) => r.gu === selectedGu);
  }, [regions, selectedGu]);

  // ✅ 점수 계산 + 정렬
  const scoredRegions = useMemo(() => {
    const result = filteredRegions
      .map((r) => {
        const score =
          r.housing * weights.housing +
          r.life * weights.life +
          r.safety * weights.safety +
          r.transport * weights.transport;

        return { ...r, score: Number.isFinite(score) ? score : 0 };
      })
      .sort((a, b) => b.score - a.score);

    console.log("selectedGu:", selectedGu);
    console.log("filtered length:", filteredRegions.length);
    console.log("scored length:", result.length);

    return result;
  }, [filteredRegions, weights, selectedGu]);

  // ✅ 리스트 & 지도용 TOP 10
  const top10 = useMemo(() => scoredRegions.slice(0, 10), [scoredRegions]);

  useEffect(() => {
    console.log(
      "top10 length:",
      top10.length,
      top10.map((r) => r.name)
    );
  }, [top10]);

  const handleWeightChange = (key, value) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetWeights = () => setWeights(DEFAULT_WEIGHTS);

  // 저장하기 함수
  const handleSave = () => {
    if (!top10.length) {
      alert("저장할 지역이 없습니다.");
      return;
    }

    // 저장할 데이터 구조
    const saveData = {
      timestamp: new Date().toISOString(),
      selectedGu: selectedGu,
      weights: weights,
      top10: top10.map((r, idx) => ({
        rank: idx + 1,
        name: r.name,
        gu: r.gu,
        housing: r.housing,
        life: r.life,
        safety: r.safety,
        transport: r.transport,
        score: r.score,
        lat: r.lat,
        lng: r.lng,
        nearestStation: r.nearestStation,
        distanceKm: r.distanceKm,
        avgRent: r.avgRent,
      })),
    };

    // localStorage에 저장 (기존 저장 목록 가져오기)
    const existingSaves = JSON.parse(localStorage.getItem("savedRegions") || "[]");
    existingSaves.push(saveData);
    
    // 최대 10개까지만 저장 (오래된 것부터 삭제)
    if (existingSaves.length > 10) {
      existingSaves.shift();
    }
    
    localStorage.setItem("savedRegions", JSON.stringify(existingSaves));
    
    alert(`추천 지역 TOP 10이 저장되었습니다.\n저장된 항목: ${existingSaves.length}개`);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
          <div className="logo">다이어터</div>
          <div className="header-text">
            <h1>나에게 맞는 주거 지역은?</h1>
            <p>서울에서 나에게 딱 맞는 동네를 찾는 주거 매칭 서비스</p>
            <p style={{ marginTop: "4px", fontSize: "12px", opacity: 0.85 }}>
              주거 · 생활 · 치안 · 교통 점수를 조절해 내 기준에 맞는 동네를 발견해 보세요.
            </p>
          </div>
        </div>
        <div className="category-chips">
          <button
            className="chip chip-home"
            onClick={() => navigate("/housing")}
            style={{
              background: currentPath === "/housing" ? "#fbcfe8" : "rgba(255, 255, 255, 0.9)",
              color: currentPath === "/housing" ? "#831843" : "#000",
              border: currentPath === "/housing" ? "1px solid #fbcfe8" : "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            주거
          </button>
          <button
            className="chip chip-life"
            onClick={() => navigate("/life")}
            style={{
              background: currentPath === "/life" ? "#86efac" : "rgba(255, 255, 255, 0.9)",
              color: currentPath === "/life" ? "#14532d" : "#000",
              border: currentPath === "/life" ? "1px solid #86efac" : "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            생활
          </button>
          <button
            className="chip chip-safe"
            onClick={() => navigate("/safety")}
            style={{
              background: currentPath === "/safety" ? "#93c5fd" : "rgba(255, 255, 255, 0.9)",
              color: currentPath === "/safety" ? "#1e3a8a" : "#000",
              border: currentPath === "/safety" ? "1px solid #93c5fd" : "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            치안
          </button>
          <button
            className="chip chip-traffic"
            onClick={() => navigate("/transport")}
            style={{
              background: currentPath === "/transport" ? "#fde68a" : "rgba(255, 255, 255, 0.9)",
              color: currentPath === "/transport" ? "#78350f" : "#000",
              border: currentPath === "/transport" ? "1px solid #fde68a" : "1px solid rgba(255, 255, 255, 0.3)"
            }}
          >
            교통
          </button>
        </div>
      </header>

      <main className="app-main">
        {/* 왼쪽 패널 */}
        <section className="left-panel">
          {/* 실시간 인기 지역 */}
          <TrendingRegions
            onSelectRegion={(region) => {
              // 실시간 인기 지역 클릭 시 해당 구로 필터링
              setSelectedGu(region.name);
              setSelectedRegion(null);
            }}
          />

          <div className="gu-select-row">
            <label className="gu-label">서울 ▾</label>
            <select
              className="gu-select"
              value={selectedGu}
              onChange={(e) => {
                setSelectedGu(e.target.value);
                setSelectedRegion(null); // 구 바뀌면 선택 초기화
              }}
            >
              {guOptions.map((gu) => (
                <option key={gu} value={gu}>
                  {gu}
                </option>
              ))}
            </select>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">가중치 설정</h3>
            <p className="info-card-desc">
              각 항목의 중요도를 조절하여 나에게 맞는 지역을 찾아보세요.
              슬라이더를 움직여 가중치를 변경할 수 있습니다.
            </p>
          </div>

          <div className="slider-group">
            <div className="slider-item-wrapper">
              <div className="slider-info">
                <span className="slider-info-label">주거</span>
                <span className="slider-info-desc">주거 환경, 월세, 건축년도 등</span>
              </div>
              <SliderRow
                label="주거"
                value={weights.housing}
                onChange={(v) => handleWeightChange("housing", v)}
              />
            </div>
            <div className="slider-item-wrapper">
              <div className="slider-info">
                <span className="slider-info-label">생활</span>
                <span className="slider-info-desc">병원, 점포, 공원, 소음 등</span>
              </div>
              <SliderRow
                label="생활"
                value={weights.life}
                onChange={(v) => handleWeightChange("life", v)}
              />
            </div>
            <div className="slider-item-wrapper">
              <div className="slider-info">
                <span className="slider-info-label">치안</span>
                <span className="slider-info-desc">범죄율, CCTV, 가로등 등</span>
              </div>
              <SliderRow
                label="치안"
                value={weights.safety}
                onChange={(v) => handleWeightChange("safety", v)}
              />
            </div>
            <div className="slider-item-wrapper">
              <div className="slider-info">
                <span className="slider-info-label">교통</span>
                <span className="slider-info-desc">지하철 접근성, 버스정류장 등</span>
              </div>
              <SliderRow
                label="교통"
                value={weights.transport}
                onChange={(v) => handleWeightChange("transport", v)}
              />
            </div>
          </div>

          <div className="slider-footer">
            <button className="btn-secondary" onClick={handleResetWeights}>
              가중치 초기화
            </button>
            <span className="weight-tip">슬라이더로 중요도를 조절해 보세요</span>
          </div>

          {/* ✅ 카테고리별 상세 페이지 버튼 4개 */}
          <div className="info-card">
            <h3 className="info-card-title">상세 정보 보기</h3>
            <p className="info-card-desc">
              각 카테고리별 상세 데이터와 시각화를 확인할 수 있습니다.
            </p>
          </div>
          <div className="bubble-card">
            <button
              className="bubble-item bubble-item--category"
              onClick={() =>
                navigate("/housing", {
                  state: {
                    category: "housing",
                    selectedGu,
                    weights,
                    top10,
                    allRegions: scoredRegions,
                  },
                })
              }
            >
              <span className="bubble-circle">주거</span>
              <span className="bubble-label">주거 상세 보기</span>
            </button>

            <button
              className="bubble-item bubble-item--category"
              onClick={() =>
                navigate("/life", {
                  state: {
                    category: "life",
                    selectedGu,
                    weights,
                    top10,
                    allRegions: scoredRegions,
                  },
                })
              }
            >
              <span className="bubble-circle">생활</span>
              <span className="bubble-label">생활 인프라 상세</span>
            </button>

            <button
              className="bubble-item bubble-item--category"
              onClick={() =>
                navigate("/safety", {
                  state: {
                    category: "safety",
                    selectedGu,
                    weights,
                    top10,
                    allRegions: scoredRegions,
                  },
                })
              }
            >
              <span className="bubble-circle">치안</span>
              <span className="bubble-label">치안/안전 상세</span>
            </button>

            <button
              className="bubble-item bubble-item--category"
              onClick={() =>
                navigate("/transport", {
                  state: {
                    category: "transport",
                    selectedGu,
                    weights,
                    top10,
                    allRegions: scoredRegions,
                  },
                })
              }
            >
              <span className="bubble-circle">교통</span>
              <span className="bubble-label">교통 접근성 상세</span>
            </button>
          </div>
        </section>

        {/* 가운데: 지도 */}
        <section className="middle-panel">
          <div className="map-wrapper">
            <div className="map-header">지도</div>
            <div className="map-placeholder">
              <MapView regions={top10} selectedRegion={selectedRegion} />
            </div>
          </div>
        </section>

        {/* 오른쪽 패널 */}
        <section className="right-panel">
          <div
            className="result-list"
            key={selectedGu + JSON.stringify(weights)}
          >
            <h2>추천 지역 TOP 10</h2>
            <div className="rank-list">
              {top10.map((r, idx) => (
                <div
                  key={r.id}
                  className={
                    "result-row" +
                    (selectedRegion?.id === r.id ? " result-row--active" : "")
                  }
                  onClick={() => setSelectedRegion(r)}
                >
                  <div className="result-rank">{idx + 1}</div>
                  <div className="result-info">
                    <div className="result-name">
                      {r.name} ({r.gu})
                    </div>
                    <div className="result-sub">
                      주거 {fmt(r.housing, 2)} / 생활 {fmt(r.life, 2)} / 치안{" "}
                      {fmt(r.safety, 2)} / 교통 {fmt(r.transport, 2)} | 총점{" "}
                      {fmt(r.score, 3)}
                    </div>
                  </div>
                </div>
              ))}
              {!top10.length && <p>추천 결과가 없습니다.</p>}
            </div>
          </div>

          <div className="side-actions">
            <button
              className="btn-primary"
              onClick={handleSave}
            >
              저장하기
            </button>

            <DetailPanel region={selectedRegion} weights={weights} />
          </div>
        </section>
      </main>
    </div>
  );
}
