// src/components/DetailPanel.jsx
import "./DetailPanel.css";

const fmt = (n, digits = 2) =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(digits) : "-";

export default function DetailPanel({ region, weights }) {
  if (!region) {
    return (
      <div className="detail-panel">
        <p className="detail-empty">
          왼쪽 지도 마커나 추천 리스트에서 지역을 선택하면<br />
          상세 정보가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  const {
    name,
    gu,
    score,
    housing,
    life,
    safety,
    transport,
    nearestStation,
    distanceKm,
    avgNoise,
    parkCount,
    hospitalCount,
    shopCount,
    avgRent,
    raw,
  } = region;

  return (
    <div className="detail-panel">
      <h3 className="detail-title">
        {gu} {name}
      </h3>

      <div className="detail-score-block">
        <div className="detail-score-main">
          총점 <strong>{fmt(score, 3)}</strong>
        </div>
        <div className="detail-score-sub">
          주거 {fmt(housing)} / 생활 {fmt(life)} / 치안 {fmt(safety)} / 교통{" "}
          {fmt(transport)}
        </div>
      </div>

      <div className="detail-section">
        <h4>주거</h4>
        <ul>
          <li>평균 월세: {avgRent ? `${fmt(avgRent, 0)} 만원` : "데이터 없음"}</li>
        </ul>
      </div>

      <div className="detail-section">
        <h4>생활 인프라</h4>
        <ul>
          <li>평균 소음: {avgNoise ? `${fmt(avgNoise, 1)} dB` : "데이터 없음"}</li>
          <li>공원 수: {parkCount ?? "-"}</li>
          <li>병의원 수: {hospitalCount ?? "-"}</li>
          <li>점포 수: {shopCount ?? "-"}</li>
        </ul>
      </div>

      <div className="detail-section">
        <h4>교통 / 접근성</h4>
        <ul>
          <li>가장 가까운 역: {nearestStation || "-"}</li>
          <li>
            역까지 거리:{" "}
            {distanceKm ? `${fmt(distanceKm, 2)} km` : "데이터 없음"}
          </li>
        </ul>
      </div>

      {/* 원본 CSV 컬럼 전체 표로 보여주기 */}
      {raw && (
        <div className="detail-section detail-raw">
          <h4>원본 데이터</h4>
          <div className="detail-raw-table-wrapper">
            <table className="detail-raw-table">
              <tbody>
                {Object.entries(raw).map(([key, value]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{String(value ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
