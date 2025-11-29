// src/pages/TransportPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import rawCsv from "../data/final_data.csv?raw";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import "../styles/life.css"; // 기존 스타일 재활용

// CSV 파싱
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);

  const header = lines[0].split(",").map((h) => h.trim());
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

// 색상 스케일 (초록계열)
const greenScale = (t) => {
  const start = { r: 16, g: 94, b: 43 };
  const end = { r: 187, g: 247, b: 208 };
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return `rgb(${r},${g},${b})`;
};

export default function TransportPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [rows, setRows] = useState([]);
  const [selectedDong, setSelectedDong] = useState(null);

  // CSV 파싱
  useEffect(() => {
    const parsed = parseCSV(rawCsv);
    setRows(parsed);
    if (parsed.length) setSelectedDong(parsed[0].법정동);
  }, []);

  const selectedRow = useMemo(
    () => rows.find((r) => r.법정동 === selectedDong),
    [rows, selectedDong]
  );

  // TOP 20 정렬
  const topTransport = useMemo(() => {
    return [...rows]
      .filter((r) => !isNaN(r["교통점수"]))
      .sort((a, b) => b["교통점수"] - a["교통점수"])
      .slice(0, 20);
  }, [rows]);

  const topBus = useMemo(() => {
    return [...rows]
      .filter((r) => !isNaN(r["근처버스정류장수"]))
      .sort((a, b) => b["근처버스정류장수"] - a["근처버스정류장수"])
      .slice(0, 20);
  }, [rows]);

  const topSubwayNear = useMemo(() => {
    return [...rows]
      .filter((r) => !isNaN(r["거리_km"]) && r["거리_km"] > 0)
      .sort((a, b) => a["거리_km"] - b["거리_km"]) // 가까울수록 좋음!
      .slice(0, 20);
  }, [rows]);

  if (!rows.length) return <p style={{ padding: 24 }}>교통 데이터 불러오는 중…</p>;

  return (
    <div className="app-root">
      <header className="app-header" style={{ background: "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)", color: "#000" }}>
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
      <div className="life-page transport-page" style={{ paddingBottom: 80 }}>
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/")}
            style={{ fontSize: "15px", padding: "10px 18px", background: "#fde68a", color: "#78350f" }}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      {/* 1. 교통 점수 랭킹 */}
      <section className="life-section">
        <h2>교통 점수 랭킹 (TOP 20)</h2>

        <div style={{ display: "flex", gap: 24 }}>
          {/* 좌측 테이블 */}
          <div style={{ flex: 1, maxHeight: 320, overflowY: "auto" }}>
            <table className="life-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>법정동</th>
                  <th>교통점수</th>
                  <th>버스정류장수</th>
                  <th>가까운역</th>
                  <th>거리(km)</th>
                </tr>
              </thead>
              <tbody>
                {topTransport.map((r, i) => {
                  const active = selectedDong === r.법정동;
                  return (
                    <tr
                      key={r.법정동}
                      onClick={() => setSelectedDong(r.법정동)}
                      style={{
                        cursor: "pointer",
                        background: active ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td>{i + 1}</td>
                      <td>{r.법정동}</td>
                      <td>{r["교통점수"].toFixed(3)}</td>
                      <td>{r["근처버스정류장수"]}</td>
                      <td>{r["가장가까운역"]}</td>
                      <td>{r["거리_km"]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 우측 요약 */}
          <div className="summary-card">
            <h3>{selectedRow?.법정동} 교통 요약</h3>
            <ul>
              <li>교통점수: {selectedRow?.["교통점수"]?.toFixed(3)}</li>
              <li>버스정류장수: {selectedRow?.["근처버스정류장수"]}</li>
              <li>가까운 역: {selectedRow?.["가장가까운역"]}</li>
              <li>거리(km): {selectedRow?.["거리_km"]}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 그리드 레이아웃 */}
      <div className="visualization-grid">
        {/* 2. 버스 정류장 TOP20 */}
        <div className="grid-item">
          <h2>근처 버스정류장 수 TOP 20</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={topBus.map((r) => ({
                  dong: r.법정동,
                  bus: r["근처버스정류장수"],
                }))}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dong" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="bus" fill="#69d3a7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 지하철 접근성 TOP 20 */}
        <div className="grid-item">
          <h2>지하철 접근성 (가까운 순 TOP 20)</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={topSubwayNear.map((r) => ({
                  dong: r.법정동,
                  dist: r["거리_km"],
                }))}
                layout="vertical"
                margin={{ left: 80, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dong" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="dist" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
