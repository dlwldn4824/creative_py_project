// src/pages/LifePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import csvText from "../data/life_score.csv?raw";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Treemap,
  Cell,
} from "recharts";

function parseLifeCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      const raw = cols[i];
      const num = Number(raw);
      obj[h] = Number.isNaN(num) ? raw : num;
    });
    return obj;
  });
}

const greenScale = (t) => {
  // 0~1 사이 t -> 짙은~연한 초록
  const start = { r: 16, g: 94, b: 43 }; // 진한
  const end = { r: 187, g: 247, b: 208 }; // 연한
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r},${g},${b})`;
};

export default function LifePage() {
  const [rows, setRows] = useState([]);
  const [selectedGu, setSelectedGu] = useState(null);

  // CSV 파싱
  useEffect(() => {
    const parsed = parseLifeCsv(csvText);
    setRows(parsed);
    if (parsed.length) setSelectedGu(parsed[0].자치구);
  }, []);

  const selectedRow = useMemo(
    () => rows.find((r) => r.자치구 === selectedGu),
    [rows, selectedGu]
  );

  // 공통 정렬 데이터
  const byLifeScore = useMemo(
    () => [...rows].sort((a, b) => b["생활점수"] - a["생활점수"]),
    [rows]
  );
  const byHospital = useMemo(
    () => [...rows].sort((a, b) => b["병의원수"] - a["병의원수"]),
    [rows]
  );
  const byPark = useMemo(
    () => [...rows].sort((a, b) => b["공원수"] - a["공원수"]),
    [rows]
  );
  const byShop = useMemo(
    () => [...rows].sort((a, b) => b["점포수"] - a["점포수"]),
    [rows]
  );
  const byNoise = useMemo(
    () => [...rows].sort((a, b) => b["평균소음(dB)"] - a["평균소음(dB)"]),
    [rows]
  );

  if (!rows.length) return <p style={{ padding: 24 }}>생활 데이터 불러오는 중…</p>;

  return (
    <div className="life-page" style={{ padding: "24px 40px" }}>
      {/* 헤더 */}
      <header style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 20px",
            borderRadius: 999,
            background: "#f3f4f6",
            marginBottom: 12,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          CHAPTER 05 · 생활 인프라
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          서울시 생활 인프라 시각화
        </h1>
        <p style={{ color: "#6b7280" }}>
          구별 병의원, 공원, 대규모 점포, 소음 정보 등을 다양한 시각화로 비교합니다.
        </p>
      </header>

      {/* 0. 생활점수 랭킹 + 선택 */}
      <section className="life-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>생활 점수 랭킹</h2>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1, maxHeight: 320, overflowY: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>순위</th>
                  <th style={{ padding: 8, textAlign: "left" }}>자치구</th>
                  <th style={{ padding: 8 }}>생활점수</th>
                  <th style={{ padding: 8 }}>병원</th>
                  <th style={{ padding: 8 }}>점포</th>
                  <th style={{ padding: 8 }}>공원</th>
                </tr>
              </thead>
              <tbody>
                {byLifeScore.map((r, idx) => {
                  const active = r.자치구 === selectedGu;
                  return (
                    <tr
                      key={r.자치구}
                      onClick={() => setSelectedGu(r.자치구)}
                      style={{
                        cursor: "pointer",
                        background: active ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td style={{ padding: 8 }}>{idx + 1}</td>
                      <td style={{ padding: 8 }}>{r.자치구}</td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {r["생활점수"].toFixed(3)}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {r["병의원수"]}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {r["점포수"]}
                      </td>
                      <td style={{ padding: 8, textAlign: "right" }}>
                        {r["공원수"]}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 선택된 구 요약 카드 */}
          <div
            style={{
              width: 280,
              padding: 16,
              borderRadius: 16,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              alignSelf: "flex-start",
            }}
          >
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>
              {selectedRow?.자치구} 생활 요약
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
              생활점수는 공원 수, 병원 수, 점포 수, 평균 소음 점수를 합산한 값입니다.
            </p>
            <ul style={{ fontSize: 14, lineHeight: 1.7 }}>
              <li>생활점수: {selectedRow["생활점수"].toFixed(3)}</li>
              <li>병원 수: {selectedRow["병의원수"].toLocaleString()} 개</li>
              <li>점포 수: {selectedRow["점포수"].toLocaleString()} 개</li>
              <li>공원 수: {selectedRow["공원수"].toLocaleString()} 개</li>
              <li>
                평균 소음: {selectedRow["평균소음(dB)"].toFixed(2)}
                dB
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 1. 구별 병의원 개수 시각화 (버블 느낌 Treemap) */}
      <section className="life-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>구별 병의원 개수 시각화</h2>
        <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 13 }}>
          병의원 수가 많을수록 면적이 크게 표시됩니다. 구를 클릭하면 상단 요약 카드가
          해당 구로 바뀝니다.
        </p>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <Treemap
              data={byHospital.map((r) => ({
                name: r.자치구,
                size: r["병의원수"],
              }))}
              dataKey="size"
              stroke="#fff"
              content={<CustomTreemapContent onSelect={setSelectedGu} />}
            >
              {byHospital.map((_, index) => (
                <Cell
                  key={`cell-hospital-${index}`}
                  fill={greenScale(index / byHospital.length)}
                />
              ))}
            </Treemap>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. 구별 공원 개수 Treemap */}
      <section className="life-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>구별 공원 개수</h2>
        <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 13 }}>
          공원 수를 기준으로 Treemap을 구성했습니다. 초록이 진할수록 공원 수가 많습니다.
        </p>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <Treemap
              data={byPark.map((r) => ({
                name: `${r.자치구} (${r["공원수"]})`,
                size: r["공원수"],
              }))}
              dataKey="size"
              stroke="#fff"
            >
              {byPark.map((_, index) => (
                <Cell
                  key={`cell-park-${index}`}
                  fill={greenScale(index / byPark.length)}
                />
              ))}
            </Treemap>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. 구별 평균 소음 막대 그래프 */}
      <section className="life-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>서울시 평균 소음 데시벨</h2>
        <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 13 }}>
          구별 전체 평균 소음(dB)을 내림차순으로 정렬한 막대 그래프입니다.
        </p>
        <div style={{ width: "100%", height: 360 }}>
          <ResponsiveContainer>
            <BarChart
              data={byNoise.map((r) => ({
                gu: r.자치구,
                noise: r["평균소음(dB)"],
              }))}
              layout="vertical"
              margin={{ left: 80, right: 20, top: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="gu" />
              <Tooltip />
              <Bar dataKey="noise" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. 소음 점수 Heatmap 스타일 테이블 */}
      <section className="life-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>구별 소음 점수 Heatmap</h2>
        <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 13 }}>
          조용한 지역일수록 점수가 높고 색이 짙어집니다. (평균소음 점수를 0~1 범위로
          정규화한 값)
        </p>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              borderCollapse: "collapse",
              fontSize: 13,
              minWidth: 480,
            }}
          >
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: 8, textAlign: "left" }}>자치구</th>
                <th style={{ padding: 8, textAlign: "right" }}>평균소음(dB)</th>
                <th style={{ padding: 8, textAlign: "right" }}>소음점수</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const score = r["평균소음(dB)_점수"]; // 0~1
                const bg = greenScale(score);
                return (
                  <tr key={r.자치구}>
                    <td style={{ padding: 8 }}>{r.자치구}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {r["평균소음(dB)"].toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        textAlign: "right",
                        background: bg,
                        color: score > 0.7 ? "#f9fafb" : "#111827",
                      }}
                    >
                      {score.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. 대규모 점포(점포수) 버블/Treemap */}
      <section className="life-section" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, marginBottom: 4 }}>
          생활 부문 – 대규모 점포(점포수) 시각화
        </h2>
        <p style={{ color: "#6b7280", marginBottom: 16, fontSize: 13 }}>
          점포 수(대형마트, 백화점, 쇼핑센터 등)를 기준으로 버블·Treemap을 구성했습니다.
        </p>

        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "stretch",
            flexWrap: "wrap",
          }}
        >
          {/* 버블 느낌: flex + 원 크기 비례 */}
          <div
            style={{
              flex: 1,
              minWidth: 280,
              padding: 16,
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
            }}
          >
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>구별 점포수 버블</h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                alignItems: "flex-end",
              }}
            >
              {byShop.map((r) => {
                const base = r["점포수"];
                const size = 30 + (base / byShop[0]["점포수"]) * 60; // 30~90px
                const active = r.자치구 === selectedGu;
                return (
                  <div
                    key={r.자치구}
                    onClick={() => setSelectedGu(r.자치구)}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: "999px",
                      background: active ? "#3b82f6" : "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f9fafb",
                      fontSize: 11,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                    title={`${r.자치구} · ${base}개`}
                  >
                    <div>
                      <div>{r.자치구}</div>
                      <div style={{ fontSize: 10 }}>{base}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Treemap */}
          <div style={{ flex: 1, minWidth: 280, height: 280 }}>
            <ResponsiveContainer>
              <Treemap
                data={byShop.map((r) => ({
                  name: `${r.자치구} (${r["점포수"]})`,
                  size: r["점포수"],
                }))}
                dataKey="size"
                stroke="#fff"
              >
                {byShop.map((_, index) => (
                  <Cell
                    key={`cell-shop-${index}`}
                    fill={greenScale(index / byShop.length)}
                  />
                ))}
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Treemap 안의 라벨 스타일을 바꾸기 위한 커스텀 컴포넌트 */
function CustomTreemapContent(props) {
  const {
    x,
    y,
    width,
    height,
    index,
    name,
    colors,
    onSelect,
    root,
    depth,
  } = props;
  if (!width || !height) return null;

  const handleClick = () => {
    if (onSelect && name) {
      // name 이 "강남구" 또는 "강남구 (123)" 형태
      const gu = name.split(" ")[0];
      onSelect(gu);
    }
  };

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors && colors[index] ? colors[index] : "#6ee7b7",
          stroke: "#fff",
          cursor: "pointer",
        }}
        onClick={handleClick}
      />
      {width > 40 && height > 24 && (
        <text
          x={x + 4}
          y={y + 18}
          fill="#111827"
          fontSize={11}
          pointerEvents="none"
        >
          {name}
        </text>
      )}
    </g>
  );
}
CustomTreemapContent.defaultProps = {
  colors: [],
};
