// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import SliderRow from "../components/SliderRow.jsx";
import DetailPanel from "../components/DetailPanel.jsx";
import MapView from "../components/MapView.jsx";

// ✅ Vite: CSV를 문자열로 바로 import
import csvText from "../data/최종_이사점수_병합완료.csv?raw";

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

    lat: Number(row["위도"] || row["lat"] || row["LAT"] || 0),
    lng: Number(row["경도"] || row["lng"] || row["LNG"] || 0),
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

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo">다이어터</div>
        <div className="header-text">
          <h1>나에게 맞는 주거 지역은?</h1>
          <p>높아지는 서울 주거비, 자신에게 최적화된 지역에 거주하기 위한 웹/앱</p>
        </div>
      </header>

      <main className="app-main">
        {/* 왼쪽 패널 */}
        <section className="left-panel">
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

          <div className="slider-group">
            <SliderRow
              label="주거"
              value={weights.housing}
              onChange={(v) => handleWeightChange("housing", v)}
            />
            <SliderRow
              label="생활"
              value={weights.life}
              onChange={(v) => handleWeightChange("life", v)}
            />
            <SliderRow
              label="치안"
              value={weights.safety}
              onChange={(v) => handleWeightChange("safety", v)}
            />
            <SliderRow
              label="교통"
              value={weights.transport}
              onChange={(v) => handleWeightChange("transport", v)}
            />
          </div>

          <div className="slider-footer">
            <button className="btn-secondary" onClick={handleResetWeights}>
              가중치 초기화
            </button>
            <span className="weight-tip">슬라이더로 중요도를 조절해 보세요</span>
          </div>

          {/* ✅ 카테고리별 상세 페이지 버튼 4개 */}
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

        {/* 오른쪽 패널 */}
        <section className="right-panel">
          {/* 지도 */}
          <div className="map-wrapper">
            <div className="map-header">지도</div>
            <div className="map-placeholder">
              <MapView regions={top10} />
            </div>
          </div>

          {/* 하단 결과 + 상세/저장 */}
          <div className="result-bottom">
            <div
              className="result-list"
              key={selectedGu + JSON.stringify(weights)}
            >
              <h2>추천 지역 TOP 10</h2>
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

            <div className="side-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  const target = selectedRegion || top10[0];
                  if (target) {
                    alert(`${target.name}을(를) 임시로 저장했습니다.`);
                  } else {
                    alert("저장할 지역이 없습니다.");
                  }
                }}
              >
                저장하기
              </button>

                <DetailPanel region={selectedRegion} weights={weights} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
