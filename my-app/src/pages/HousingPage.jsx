// src/pages/HousingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import csvText from "../data/final_data.csv?raw";
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
import "../styles/life.css";

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => {
      const v = Number(cols[i]);
      obj[h] = Number.isNaN(v) ? cols[i] : v;
    });
    return obj;
  });
}

export default function HousingPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [selectedDong, setSelectedDong] = useState(null);

  useEffect(() => {
    const parsed = parseCsv(csvText);
    setRows(parsed);
    if (parsed.length) setSelectedDong(parsed[0].법정동);
  }, []);

  const selectedRow = useMemo(
    () => rows.find((r) => r.법정동 === selectedDong),
    [rows, selectedDong]
  );

  // -----------------------------
  // 1) 주거점수 TOP 20
  // -----------------------------
  const top20Housing = useMemo(
    () => [...rows].sort((a, b) => b["주거점수"] - a["주거점수"]).slice(0, 20),
    [rows]
  );

  // -----------------------------
  // 2) 전월세평균 TOP 20
  // -----------------------------
  const top20Rent = useMemo(
    () =>
      [...rows]
        .filter((r) => r["전월세평균"] > 0)
        .sort((a, b) => b["전월세평균"] - a["전월세평균"])
        .slice(0, 20),
    [rows]
  );

  // -----------------------------
  // 3) 건축년도 TOP 20
  // -----------------------------
  const top20Year = useMemo(
    () =>
      [...rows]
        .filter((r) => r["건축년도"] > 1900 && r["건축년도"] < 2030)
        .sort((a, b) => b["건축년도"] - a["건축년도"])
        .slice(0, 20),
    [rows]
  );

  // -----------------------------
  // 4) 안정성점수 TOP 20
  // -----------------------------
  const top20Safety = useMemo(
    () =>
      [...rows]
        .filter((r) => r["안정성점수"] > 0)
        .sort((a, b) => b["안정성점수"] - a["안정성점수"])
        .slice(0, 20),
    [rows]
  );

  // 안정성 점수의 실제 범위 계산 (차이를 더 잘 보이게 하기 위해)
  const safetyScoreRange = useMemo(() => {
    if (top20Safety.length === 0) return { min: 0.5, max: 1 };
    const scores = top20Safety.map((r) => r["안정성점수"]);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    // 여유 공간을 주되, 최소값은 0.5 이상, 최대값은 1 이하로 유지
    const padding = (max - min) * 0.1; // 10% 여유 공간
    return {
      min: Math.max(0.5, min - padding),
      max: Math.min(1, max + padding),
    };
  }, [top20Safety]);

  // 색상 그라데이션 함수 (점수에 따라 색상 변경)
  const getSafetyColor = (score) => {
    if (!safetyScoreRange || top20Safety.length === 0) return "#f87171";
    const { min, max } = safetyScoreRange;
    const normalized = (score - min) / (max - min); // 0~1로 정규화
    
    // 낮은 점수: 연한 빨강, 높은 점수: 진한 빨강/주황
    if (normalized < 0.33) {
      return "#fca5a5"; // 연한 빨강
    } else if (normalized < 0.66) {
      return "#f87171"; // 중간 빨강
    } else {
      return "#ef4444"; // 진한 빨강
    }
  };

  if (!rows.length)
    return <p style={{ padding: 20 }}>주거 데이터 불러오는 중…</p>;

  return (
    <div className="app-root">
      <header className="app-header" style={{ background: "linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)", color: "#000" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flex: 1 }}>
          <div className="logo" style={{ color: "#000" }}>다이어터</div>
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
            style={{ color: "#000" }}
          >
            주거
          </button>
          <button
            className="chip chip-life"
            onClick={() => navigate("/life")}
            style={{ color: "#000" }}
          >
            생활
          </button>
          <button
            className="chip chip-safe"
            onClick={() => navigate("/safety")}
            style={{ color: "#000" }}
          >
            치안
          </button>
          <button
            className="chip chip-traffic"
            onClick={() => navigate("/transport")}
            style={{ color: "#000" }}
          >
            교통
          </button>
        </div>
      </header>
      <div className="life-page housing-page">
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={() => navigate("/")}
            style={{ fontSize: "15px", padding: "10px 18px", background: "#fbcfe8", color: "#831843" }}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      {/* ---------------------------
          1. 주거 점수 랭킹 (TOP 20)
      ---------------------------- */}
      <section className="life-section">
        <h2>주거 점수 랭킹 (TOP 20)</h2>

        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1, maxHeight: 340, overflowY: "auto" }}>
            <table className="life-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>법정동</th>
                  <th>주거점수</th>
                  <th>전월세평균</th>
                  <th>건축년도</th>
                  <th>안정성점수</th>
                </tr>
              </thead>

              <tbody>
                {top20Housing.map((r, idx) => {
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
                      <td>{idx + 1}</td>
                      <td>{r.법정동}</td>
                      <td>{r.주거점수.toFixed(3)}</td>
                      <td>{r["전월세평균"]?.toLocaleString()}</td>
                      <td>{r["건축년도"]?.toFixed(0)}</td>
                      <td>{r["안정성점수"]?.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 요약 */}
          <div className="summary-card">
            <h3>{selectedDong} 주거 요약</h3>
            <ul>
              <li>주거점수: {selectedRow?.["주거점수"]?.toFixed(3)}</li>
              <li>
                전월세 평균:{" "}
                {selectedRow?.["전월세평균"]?.toLocaleString()} 만원
              </li>
              <li>평균 건축년도: {selectedRow?.["건축년도"]?.toFixed(0)}</li>
              <li>안정성점수: {selectedRow?.["안정성점수"]?.toFixed(3)}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 그리드 레이아웃 */}
      <div className="visualization-grid">
        {/* ---------------------------
            2. 전월세 평균 (TOP 20)
        ---------------------------- */}
        <div className="grid-item">
          <h2>전월세 평균 (만원) — TOP 20</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={top20Rent.map((r) => ({
                  dong: r.법정동,
                  rent: r["전월세평균"],
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="dong" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="rent" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------------------
            3. 건축년도 (TOP 20)
        ---------------------------- */}
        <div className="grid-item">
          <h2>건축년도 순위 — TOP 20</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={top20Year.map((r) => ({
                  dong: r.법정동,
                  year: r["건축년도"],
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[1990, 2025]} />
                <YAxis dataKey="dong" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="year" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------------------
            4. 안정성 점수 (TOP 20)
        ---------------------------- */}
        <div className="grid-item" style={{ gridColumn: "1 / -1" }}>
          <h2>안정성 점수 (0.5~1) — TOP 20</h2>
          <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
            실제 범위: {safetyScoreRange.min.toFixed(3)} ~ {safetyScoreRange.max.toFixed(3)}
          </p>
          <div className="chart-container" style={{ height: 420 }}>
            <ResponsiveContainer>
              <BarChart
                data={top20Safety.map((r) => ({
                  dong: r.법정동,
                  score: r["안정성점수"],
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[safetyScoreRange.min, safetyScoreRange.max]}
                  tickFormatter={(value) => value.toFixed(3)}
                />
                <YAxis dataKey="dong" type="category" width={100} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(3)}`, "안정성 점수"]}
                  labelFormatter={(label) => `법정동: ${label}`}
                />
                <Bar dataKey="score">
                  {top20Safety.map((r, index) => (
                    <Cell key={`cell-${index}`} fill={getSafetyColor(r["안정성점수"])} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}