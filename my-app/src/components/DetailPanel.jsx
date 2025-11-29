// src/components/DetailPanel.jsx
import "./DetailPanel.css";

const fmt = (n, digits = 2) =>
  typeof n === "number" && Number.isFinite(n) ? n.toFixed(digits) : "-";

export default function DetailPanel({ region, weights }) {
  if (!region) {
    return (
      <div className="detail-panel">
        <div className="detail-note">
          추천 리스트에서 지역을 선택하면<br />
          상세 정보가 여기에 표시됩니다.
        </div>
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
      <div className="detail-header">
        <h3>
          {gu} {name}
        </h3>
      </div>

      <div className="detail-score">
        총점: {fmt(score, 3)}
      </div>

      <div className="detail-tags">
        <span className="tag home">주거 {fmt(housing, 2)}</span>
        <span className="tag life">생활 {fmt(life, 2)}</span>
        <span className="tag safe">치안 {fmt(safety, 2)}</span>
        <span className="tag traffic">교통 {fmt(transport, 2)}</span>
      </div>

      <div className="detail-list">
        <div><strong>주거</strong></div>
        <div>평균 월세: {avgRent ? `${fmt(avgRent, 0)} 만원` : "데이터 없음"}</div>
      </div>

      <div className="detail-list">
        <div><strong>생활 인프라</strong></div>
        <div>평균 소음: {avgNoise ? `${fmt(avgNoise, 1)} dB` : "데이터 없음"}</div>
        <div>공원 수: {parkCount ?? "-"}</div>
        <div>병의원 수: {hospitalCount ?? "-"}</div>
        <div>점포 수: {shopCount ?? "-"}</div>
      </div>

      <div className="detail-list">
        <div><strong>교통 / 접근성</strong></div>
        <div>가장 가까운 역: {nearestStation || "-"}</div>
        <div>역까지 거리: {distanceKm ? `${fmt(distanceKm, 2)} km` : "데이터 없음"}</div>
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
