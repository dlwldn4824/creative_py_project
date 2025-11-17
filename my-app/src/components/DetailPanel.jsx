// src/components/DetailPanel.jsx
export default function DetailPanel({ region, weights }) {
  if (!region) {
    return (
      <div className="detail-panel">
        <p>
          왼쪽 동그라미 버튼이나 추천 리스트를 선택하면<br />
          상세 정보가 여기에 표시됩니다.
        </p>
      </div>
    );
  }

  const { housing, life, safety, transport, name, gu } = region;
  const total =
    housing * weights.housing +
    life * weights.life +
    safety * weights.safety +
    transport * weights.transport;

  return (
    <div className="detail-panel">
      <h3>
        {gu} {name}
      </h3>
      <p className="detail-score">총점 {total.toFixed(3)}</p>
      <ul className="detail-list">
        <li>
          <strong>주거</strong> 점수 {housing.toFixed(2)} × 가중치{" "}
          {weights.housing.toFixed(2)}
        </li>
        <li>
          <strong>생활</strong> 점수 {life.toFixed(2)} × 가중치{" "}
          {weights.life.toFixed(2)}
        </li>
        <li>
          <strong>치안</strong> 점수 {safety.toFixed(2)} × 가중치{" "}
          {weights.safety.toFixed(2)}
        </li>
        <li>
          <strong>교통</strong> 점수 {transport.toFixed(2)} × 가중치{" "}
          {weights.transport.toFixed(2)}
        </li>
      </ul>
      <p className="detail-note">
        이 조합으로 평가했을 때 <strong>{name}</strong>은(는) 이렇게 계산되었습니다.
      </p>
    </div>
  );
}
