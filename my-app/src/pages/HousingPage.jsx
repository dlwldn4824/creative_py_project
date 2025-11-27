// src/pages/HousingPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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

  if (!rows.length)
    return <p style={{ padding: 20 }}>주거 데이터 불러오는 중…</p>;

  return (
    <div className="life-page">
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

      {/* ---------------------------
          2. 전월세 평균 (TOP 20)
      ---------------------------- */}
      <section className="life-section">
        <h2>전월세 평균 (만원) — TOP 20</h2>

        <div className="chart-container" style={{ height: 420 }}>
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
      </section>

      {/* ---------------------------
          3. 건축년도 (TOP 20)
      ---------------------------- */}
      <section className="life-section">
        <h2>건축년도 순위 — TOP 20</h2>

        <div className="chart-container" style={{ height: 420 }}>
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
      </section>

      {/* ---------------------------
          4. 안정성 점수 (TOP 20)
      ---------------------------- */}
      <section className="life-section">
        <h2>안정성 점수 (0.5~1) — TOP 20</h2>

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
              <XAxis type="number" domain={[0.5, 1]} />
              <YAxis dataKey="dong" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="score" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
