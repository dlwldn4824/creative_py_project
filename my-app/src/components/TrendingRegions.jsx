// src/components/TrendingRegions.jsx
import { useEffect, useState } from "react";
import "./TrendingRegions.css";

// 가상의 인기 지역 데이터
const VIRTUAL_REGIONS = [
  { name: "강남구", dong: "역삼동", views: 0, change: 0 },
  { name: "서초구", dong: "반포동", views: 0, change: 0 },
  { name: "송파구", dong: "잠실동", views: 0, change: 0 },
  { name: "마포구", dong: "홍대입구", views: 0, change: 0 },
  { name: "용산구", dong: "이태원동", views: 0, change: 0 },
  { name: "종로구", dong: "청와대", views: 0, change: 0 },
  { name: "강동구", dong: "천호동", views: 0, change: 0 },
  { name: "성동구", dong: "성수동", views: 0, change: 0 },
  { name: "영등포구", dong: "여의도", views: 0, change: 0 },
  { name: "강서구", dong: "화곡동", views: 0, change: 0 },
];

export default function TrendingRegions({ onSelectRegion }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    // 초기 데이터 생성
    const generateInitialData = () => {
      return VIRTUAL_REGIONS.map((region, idx) => ({
        ...region,
        views: Math.floor(Math.random() * 5000) + 1000,
        rank: idx + 1,
      })).sort((a, b) => b.views - a.views);
    };

    let currentData = generateInitialData().map((r, idx) => ({
      ...r,
      rank: idx + 1,
    }));

    setTrending(currentData);

    // 3-5초마다 순위 업데이트
    const interval = setInterval(() => {
      setTrending((prev) => {
        // 조회수 랜덤 변경
        const updated = prev.map((region) => ({
          ...region,
          views: Math.max(
            500,
            region.views + Math.floor(Math.random() * 200 - 100)
          ),
        }));

        // 조회수 기준으로 재정렬
        const sorted = [...updated].sort((a, b) => b.views - a.views);

        // 순위 변경 계산
        return sorted.map((region, idx) => {
          const oldRank = prev.find((r) => r.name === region.name)?.rank || idx + 1;
          const newRank = idx + 1;
          return {
            ...region,
            rank: newRank,
            change: oldRank - newRank, // 양수면 상승, 음수면 하락
          };
        });
      });
    }, 3000 + Math.random() * 2000); // 3-5초 랜덤

    return () => clearInterval(interval);
  }, []);

  const formatViews = (views) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div className="trending-regions">
      <div className="trending-header">
        <h3 className="trending-title">
          <span className="trending-icon">🔥</span>
          실시간 인기 지역
        </h3>
        <span className="trending-badge">LIVE</span>
      </div>
      <div className="trending-list">
        {trending.slice(0, 5).map((region, idx) => (
          <div
            key={`${region.name}-${region.dong}`}
            className={`trending-item ${region.change > 0 ? "trending-up" : region.change < 0 ? "trending-down" : ""}`}
            onClick={() => onSelectRegion && onSelectRegion(region)}
          >
            <div className="trending-rank">
              <span className="rank-number">{region.rank}</span>
              {region.change > 0 && (
                <span className="rank-change up">↑ {region.change}</span>
              )}
              {region.change < 0 && (
                <span className="rank-change down">↓ {Math.abs(region.change)}</span>
              )}
            </div>
            <div className="trending-info">
              <div className="trending-name">
                {region.dong} ({region.name})
              </div>
              <div className="trending-views">
                조회수 {formatViews(region.views)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

