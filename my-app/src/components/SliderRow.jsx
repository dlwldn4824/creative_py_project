// src/components/SliderRow.jsx
export default function SliderRow({ label, value, onChange }) {
  // 카테고리별 색상 정의 (이미지 레퍼런스 색상)
  const getColor = (label) => {
    switch (label) {
      case "주거":
        return "#fbcfe8"; // 연한 핑크
      case "생활":
        return "#86efac"; // 연한 초록
      case "치안":
        return "#93c5fd"; // 연한 파랑
      case "교통":
        return "#fde68a"; // 연한 노랑
      default:
        return "#6b7280"; // 기본 회색
    }
  };

  const getTextColor = (label) => {
    switch (label) {
      case "주거":
        return "#831843"; // 어두운 핑크
      case "생활":
        return "#14532d"; // 어두운 초록
      case "치안":
        return "#1e3a8a"; // 어두운 파랑
      case "교통":
        return "#78350f"; // 어두운 노랑/갈색
      default:
        return "#1e293b";
    }
  };

  const color = getColor(label);
  const textColor = getTextColor(label);
  const percentage = (value * 100).toFixed(0);

  return (
    <div className="slider-row">
      <div className="slider-label" style={{ backgroundColor: color, color: textColor }}>
        {label}
      </div>
      <div className="slider-controls">
        <div className="slider-wrapper" style={{ "--slider-color": color, "--slider-percentage": `${percentage}%` }}>
          <input
            className="slider-input"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
        <div className="slider-value">{value.toFixed(2)}</div>
      </div>
    </div>
  );
}
