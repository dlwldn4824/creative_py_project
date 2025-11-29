// src/pages/LifePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

import "../styles/life.css";

// CSV 파싱
function parseLifeCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      const val = Number(cols[i]);
      obj[h] = Number.isNaN(val) ? cols[i] : val;
    });
    return obj;
  });
}

// 색상 스케일
const greenScale = (t) => {
  const start = { r: 16, g: 94, b: 43 };
  const end = { r: 187, g: 247, b: 208 };
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r},${g},${b})`;
};

export default function LifePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [selectedGu, setSelectedGu] = useState(null);
  
  const currentPath = location.pathname;

  useEffect(() => {
    const parsed = parseLifeCsv(csvText);
    setRows(parsed);
    if (parsed.length) setSelectedGu(parsed[0].자치구);
  }, []);

  const selectedRow = useMemo(
    () => rows.find((r) => r.자치구 === selectedGu),
    [rows, selectedGu]
  );

  // 정렬 리스트
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
  const byNoise = useMemo(
    () => [...rows].sort((a, b) => b["평균소음(dB)"] - a["평균소음(dB)"]),
    [rows]
  );

  if (!rows.length) return <p style={{ padding: 24 }}>생활 데이터 불러오는 중…</p>;

  return (
    <div className="app-root">
      <header className="app-header" style={{ background: "linear-gradient(135deg, #86efac 0%, #4ade80 100%)", color: "#000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
          <div className="logo" onClick={() => navigate("/")} style={{ color: "#000", cursor: "pointer" }}>창의설계입문</div>
          <div className="header-text" style={{ color: "#000" }}>
            <h1 style={{ color: "#000" }}>나에게 맞는 주거 지역은?</h1>
            <p style={{ color: "#000" }}>서울에서 나에게 딱 맞는 동네를 찾는 주거 매칭 서비스</p>
            <p style={{ marginTop: "4px", fontSize: "13px", opacity: 0.8, color: "#000" }}>
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
      <div className="life-page life-page-main">
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/")}
            style={{ fontSize: "15px", padding: "10px 18px", background: "#86efac", color: "#14532d" }}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      {/* 생활 점수 랭킹 */}
      <section className="life-section">
        <h2>생활 점수 랭킹</h2>
        <div style={{ display: "flex", gap: 24 }}>
          {/* 랭킹 테이블 */}
          <div style={{ flex: 1, maxHeight: 320, overflowY: "auto" }}>
            <table className="life-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>자치구</th>
                  <th>생활점수</th>
                  <th>병원</th>
                  <th>점포</th>
                  <th>공원</th>
                </tr>
              </thead>
              <tbody>
                {byLifeScore.map((r, i) => {
                  const active = selectedGu === r.자치구;
                  return (
                    <tr
                      key={r.자치구}
                      onClick={() => setSelectedGu(r.자치구)}
                      style={{
                        cursor: "pointer",
                        background: active ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td>{i + 1}</td>
                      <td>{r.자치구}</td>
                      <td>{r["생활점수"].toFixed(3)}</td>
                      <td>{r["병의원수"]}</td>
                      <td>{r["점포수"]}</td>
                      <td>{r["공원수"]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 선택 구 정보 */}
          <div className="summary-card">
            <h3>{selectedRow?.자치구} 생활 요약</h3>
            <ul>
              <li>생활점수: {selectedRow?.["생활점수"].toFixed(3)}</li>
              <li>병원 수: {selectedRow?.["병의원수"]}</li>
              <li>점포 수: {selectedRow?.["점포수"]}</li>
              <li>공원 수: {selectedRow?.["공원수"]}</li>
              <li>평균 소음: {selectedRow?.["평균소음(dB)"].toFixed(1)} dB</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 그리드 레이아웃 */}
      <div className="visualization-grid">
        {/* 병원 Treemap */}
        <div className="grid-item">
          <h2>구별 병의원 수</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <Treemap
                data={byHospital.map((r) => ({
                  name: r.자치구,
                  size: r["병의원수"],
                }))}
                dataKey="size"
                isAnimationActive={false}
                content={
                  <CustomTreemapContent
                    selectedGu={selectedGu}
                    onSelect={setSelectedGu}
                  />
                }
              >
                {byHospital.map((_, i) => (
                  <Cell key={i} fill={greenScale(i / byHospital.length)} />
                ))}
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 점포 수 Horizontal Bar Chart */}
        <div className="grid-item">
          <h2>구별 점포 수</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={byPark.map((r) => ({
                  gu: r.자치구,
                  shops: r["점포수"],
                }))}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="gu" width={80} />
                <Tooltip />
                <Bar dataKey="shops" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 평균 소음 BarChart */}
        <div className="grid-item">
          <h2>평균 소음(dB) 순위</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={byNoise.map((r) => ({
                  gu: r.자치구,
                  noise: r["평균소음(dB)"],
                }))}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="gu" width={80} />
                <Tooltip />
                <Bar dataKey="noise" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 평균 소음 Heatmap */}
        <div className="grid-item" style={{ gridColumn: "1 / -1" }}>
          <h2>구별 소음 점수 Heatmap</h2>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            <table className="heatmap-table">
              <thead>
                <tr>
                  <th>자치구</th>
                  <th>평균소음(dB)</th>
                  <th>점수</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const score = r["평균소음(dB)_점수"];
                  const t = 1 - score;
                  const bg = greenScale(t);

                  return (
                    <tr key={r.자치구}>
                      <td>{r.자치구}</td>
                      <td>{r["평균소음(dB)"].toFixed(2)}</td>
                      <td
                        className="heatmap-cell"
                        style={{
                          background: bg,
                          color: t > 0.7 ? "#fff" : "#111",
                          textAlign: "right",
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
        </div>
      </div>
      </div>
    </div>
  );
}

/* Treemap Custom */
function CustomTreemapContent(props) {
  const { x, y, width, height, name, index, onSelect, selectedGu } = props;
  if (!width || !height) return null;

  const gu = name;
  const active = selectedGu === gu;

  return (
    <g>
      <rect
        className="treemap-rect"
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: active ? "#3b82f6" : greenScale(index / 25),
          stroke: active ? "#1e40af" : "#fff",
          strokeWidth: active ? 3 : 1,
          cursor: "pointer",
        }}
        onClick={() => onSelect(gu)}
      />

      {width > 40 && height > 20 && (
        <text
          x={x + 6}
          y={y + 18}
          fontSize={12}
          fill={active ? "#fff" : "#111"}
        >
          {gu}
        </text>
      )}
    </g>
  );
}
