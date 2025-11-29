// src/pages/TransportPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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
    <div className="life-page transport-page" style={{ paddingBottom: 80 }}>
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
  );
}
