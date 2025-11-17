// src/components/SliderRow.jsx
export default function SliderRow({ label, value, onChange }) {
  return (
    <div className="slider-row">
      <div className="slider-label">{label}</div>
      <div className="slider-controls">
        <input
          className="slider-input"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="slider-value">{value.toFixed(2)}</div>
      </div>
    </div>
  );
}
