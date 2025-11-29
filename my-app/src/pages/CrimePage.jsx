// src/pages/CrimePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import rawText from "../data/final_data.csv?raw";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Treemap
} from "recharts";

import "../styles/life.css";

/* -----------------------------
   CSV 파싱 (숫자 자동 변환 포함)
------------------------------ */
function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(",");

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};

    header.forEach((h, i) => {
      const raw = cols[i]?.trim();
      const num = Number(raw);

      obj[h] = Number.isNaN(num) ? raw : num;
    });

    return obj;
  });
}

// 자치구별 대표 행 선택
function reduceByGu(rows) {
  const groups = {};

  rows.forEach((r) => {
    const gu = r["자치구"];
    if (!gu) return;

    if (!groups[gu]) groups[gu] = [];
    groups[gu].push(r);
  });

  const result = [];

  Object.keys(groups).forEach((gu) => {
    const list = groups[gu];

    // 기준 컬럼들: 하나라도 NaN 아니면 그 값 선택
    const keys = [
      "치안점수",
      "살인",
      "강도",
      "강간·강제추행",
      "절도",
      "폭력",
      "CCTV",
      "가로등수"
    ];

    const base = { ...list[0] }; // 기본은 첫 번째 값

    keys.forEach((key) => {
      // key에 대해 NaN 아닌 첫 값을 찾기
      const valid = list.find((row) => row[key] != null && !Number.isNaN(row[key]));

      if (valid) {
        base[key] = valid[key];
      }
      // valid가 없으면 base[key] 그대로 (첫 번째 값 유지)
    });

    result.push(base);
  });

  return result;
}


/* 색상 */
const colors = [
  "#2563eb",
  "#1d4ed8",
  "#1e40af",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

export default function CrimePage() {
  const [rows, setRows] = useState([]);
  const [selectedGu, setSelectedGu] = useState(null);

  /* CSV 로드 */
  useEffect(() => {
    const parsed = parseCsv(rawText);

    // 자치구 기준 데이터만 사용
    const guRows = parsed.filter((r) => r["자치구"]);
    const reduced = reduceByGu(guRows);   // 자치구 대표값 추출
    setRows(reduced);

    if (reduced.length) setSelectedGu(reduced[0]["자치구"]);

    // 여기까지
    if (guRows.length) setSelectedGu(guRows[0]["자치구"]);
  }, []);

  // 선택된 구
  const selectedRow = useMemo(
    () => rows.find((r) => r["자치구"] === selectedGu),
    [rows, selectedGu]
  );

  /* -----------------------------
        1. 치안점수 랭킹
  ------------------------------ */
  const rankedSafety = useMemo(
    () => [...rows].sort((a, b) => b["치안점수"] - a["치안점수"]),
    [rows]
  );

  /* -----------------------------
        2. 살인 랭킹 (도넛)
  ------------------------------ */
  const murderRank = useMemo(
    () => [...rows].sort((a, b) => b["살인"] - a["살인"]),
    [rows]
  );

  /* -----------------------------
        3. 절도 랭킹 (Treemap)
  ------------------------------ */
  const theftRank = useMemo(
    () => [...rows].sort((a, b) => b["절도"] - a["절도"]),
    [rows]
  );

  /* -----------------------------
        4. CCTV 랭킹 (BarChart)
  ------------------------------ */
  const cctvRank = useMemo(
    () => [...rows].sort((a, b) => b["CCTV"] - a["CCTV"]),
    [rows]
  );

  /* -----------------------------
        5. 가로등 랭킹 (Horizontal Bar)
  ------------------------------ */
  const lampRank = useMemo(
    () => [...rows].sort((a, b) => b["가로등수"] - a["가로등수"]),
    [rows]
  );

  if (!rows.length)
    return <p style={{ padding: 24 }}>치안 데이터 불러오는 중…</p>;

  return (
    <div className="life-page crime-page">

      {/* ----------------------------- */}
      {/* 1. 치안점수 랭킹 */}
      {/* ----------------------------- */}
      <section className="life-section">
        <h2>치안 점수 랭킹</h2>

        <div style={{ display: "flex", gap: 24 }}>
          {/* 표 */}
          <div style={{ flex: 1, maxHeight: 350, overflowY: "auto" }}>
            <table className="life-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>자치구</th>
                  <th>치안점수</th>
                  <th>살인</th>
                  <th>강도</th>
                  <th>강간·강제추행</th>
                  <th>절도</th>
                  <th>폭력</th>
                  <th>CCTV</th>
                  <th>가로등수</th>
                </tr>
              </thead>

              <tbody>
                {rankedSafety.map((r, i) => {
                  const active = selectedGu === r["자치구"];
                  return (
                    <tr
                      key={r["자치구"]}
                      onClick={() => setSelectedGu(r["자치구"])}
                      style={{
                        cursor: "pointer",
                        background: active ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td>{i + 1}</td>
                      <td>{r["자치구"]}</td>
                      <td>{Number(r["치안점수"]).toFixed(3)}</td>
                      <td>{r["살인"]}</td>
                      <td>{r["강도"]}</td>
                      <td>{r["강간·강제추행"]}</td>
                      <td>{r["절도"]}</td>
                      <td>{r["폭력"]}</td>
                      <td>{r["CCTV"]}</td>
                      <td>{r["가로등수"]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 요약 카드 */}
          <div className="summary-card">
            <h3>{selectedRow?.자치구} 치안 요약</h3>
            <ul>
              <li>치안점수: {Number(selectedRow?.치안점수).toFixed(3)}</li>
              <li>살인: {selectedRow?.살인}</li>
              <li>강도: {selectedRow?.강도}</li>
              <li>강간·강제추행: {selectedRow?.["강간·강제추행"]}</li>
              <li>절도: {selectedRow?.절도}</li>
              <li>폭력: {selectedRow?.폭력}</li>
              <li>CCTV: {selectedRow?.CCTV}</li>
              <li>가로등 수: {selectedRow?.가로등수}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 그리드 레이아웃 */}
      <div className="visualization-grid">
        {/* 2. 살인 랭킹 (도넛) */}
        <div className="grid-item">
          <h2>살인 발생 수 (도넛 차트)</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={murderRank}
                  dataKey="살인"
                  nameKey="자치구"
                  innerRadius={80}
                  outerRadius={130}
                  paddingAngle={2}
                >
                  {murderRank.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 절도 랭킹 (Treemap) */}
        <div className="grid-item">
          <h2>절도 범죄 수 (Treemap 시각화)</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <Treemap
                data={theftRank.map((r) => ({
                  name: r.자치구,
                  size: r["절도"],
                }))}
                dataKey="size"
                stroke="#fff"
                isAnimationActive={false}
              >
                {theftRank.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. CCTV 랭킹 (세로 BarChart) */}
        <div className="grid-item">
          <h2>CCTV 설치 수</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart data={cctvRank}>
                <XAxis dataKey="자치구" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="CCTV">
                  {cctvRank.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. 가로등 수 랭킹 (가로 Bar) */}
        <div className="grid-item">
          <h2>가로등 수 (수평 막대그래프)</h2>
          <div className="chart-container" style={{ height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={lampRank}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="자치구" width={80} />
                <Tooltip />
                <Bar dataKey="가로등수">
                  {lampRank.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
