// src/pages/CategoryDetail.jsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView.jsx";
import DetailPanel from "../components/DetailPanel.jsx";

const CATEGORY_META = {
  housing: {
    label: "주거",
    description: "주거 점수와 소음, 공원 수 등을 기준으로 정렬된 상위 지역입니다.",
  },
  life: {
    label: "생활",
    description: "병원, 마트, 점포 수 등 생활 인프라 중심으로 보는 상세 정보입니다.",
  },
  safety: {
    label: "치안",
    description: "치안 점수 중심으로 상위 지역을 확인할 수 있습니다.",
  },
  transport: {
    label: "교통",
    description: "가까운 역과 거리, 교통 점수를 함께 보여줍니다.",
  },
};

const fmt = (n, d = 2) =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(d) : "-";

export default function CategoryDetail() {
  const { category: categoryParam } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const category = categoryParam || state?.category || "life";
  const meta = CATEGORY_META[category] || CATEGORY_META.life;

  const weights = state?.weights || {};
  const selectedGu = state?.selectedGu || "전체";
  const top10 = state?.top10 || [];
  const allRegions = state?.allRegions || [];

  const [selectedRegion, setSelectedRegion] = useState(
    top10[0] || allRegions[0] || null
  );

  if (!state) {
    return (
      <main className="detail-page">
        <p>홈 화면에서 카테고리를 선택해 들어와 주세요.</p>
        <button className="btn-secondary" onClick={() => navigate("/")}>
          홈으로 돌아가기
        </button>
      </main>
    );
  }

  // 상세 표에 쓸 리스트: 일단 홈에서 나온 TOP10을 우선 사용
  const list = top10.length ? top10 : allRegions.slice(0, 10);

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="logo" onClick={() => navigate("/")}>
          로고
        </div>
        <div className="header-text">
          <h1>{meta.label} 상세 보기</h1>
          <p>{meta.description}</p>
        </div>
      </header>

      <main className="app-main detail-main">
        <section className="detail-left">
          <div className="detail-summary">
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              ← 뒤로가기
            </button>
            <h2>
              {selectedGu === "전체" ? "서울 전체" : selectedGu} ·{" "}
              {meta.label} 기준 추천
            </h2>
            <p className="weight-info">
              현재 가중치 · 주거 {fmt(weights.housing)} / 생활{" "}
              {fmt(weights.life)} / 치안 {fmt(weights.safety)} / 교통{" "}
              {fmt(weights.transport)}
            </p>
          </div>

          {/* 지도: allRegions를 넘겨서 더 많은 지역 볼 수 있게 */}
          <div className="map-wrapper">
            <div className="map-header">지도</div>
            <div className="map-placeholder">
              <MapView
                regions={allRegions.length ? allRegions : list}
                onSelectRegion={setSelectedRegion}
                selectedId={selectedRegion?.id}
              />
            </div>
          </div>
        </section>

        <section className="detail-right">
          <div className="detail-table">
            <h2>홈 화면에서 선정된 TOP 10</h2>
            <table>
              <thead>
                <tr>
                  <th>순위</th>
                  <th>지역</th>
                  <th>총점</th>
                  <th>{meta.label} 점수</th>
                  {category === "life" && (
                    <>
                      <th>병원 수</th>
                      <th>마트/점포 수</th>
                      <th>공원 수</th>
                    </>
                  )}
                  {category === "housing" && (
                    <>
                      <th>평균 소음(dB)</th>
                      <th>공원 수</th>
                    </>
                  )}
                  {category === "transport" && (
                    <>
                      <th>가까운 역</th>
                      <th>거리(km)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {list.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={
                      selectedRegion?.id === r.id ? "row-active" : ""
                    }
                    onClick={() => setSelectedRegion(r)}
                  >
                    <td>{idx + 1}</td>
                    <td>
                      {r.name} ({r.gu})
                    </td>
                    <td>{fmt(r.score, 3)}</td>
                    <td>
                      {category === "housing" && fmt(r.housing)}
                      {category === "life" && fmt(r.life)}
                      {category === "safety" && fmt(r.safety)}
                      {category === "transport" && fmt(r.transport)}
                    </td>

                    {category === "life" && (
                      <>
                        <td>{r.hospitalCount ?? "-"}</td>
                        <td>{r.shopCount ?? "-"}</td>
                        <td>{r.parkCount ?? "-"}</td>
                      </>
                    )}

                    {category === "housing" && (
                      <>
                        <td>{r.avgNoise ?? "-"}</td>
                        <td>{r.parkCount ?? "-"}</td>
                      </>
                    )}

                    {category === "transport" && (
                      <>
                        <td>{r.nearestStation || "-"}</td>
                        <td>{fmt(r.distanceKm)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 오른쪽 아래: 기존 DetailPanel 재사용해서 선택된 지역 상세 */}
          <div className="detail-panel-wrapper">
            <DetailPanel region={selectedRegion} weights={weights} />
          </div>
        </section>
      </main>
    </div>
  );
}
