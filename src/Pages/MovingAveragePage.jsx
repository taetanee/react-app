import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    ResponsiveContainer, ComposedChart, Line, XAxis, YAxis,
    Tooltip, Legend, CartesianGrid,
} from "recharts";

// ── 설정 ─────────────────────────────────────────────────────
const API_BASE_URL = "https://api.mypad.kr/myDashboard";

const TICKERS = [
    { key: "snp500",  label: "S&P 500",  symbol: "^GSPC", color: "#00b894" },
    { key: "nasdaq",  label: "NASDAQ",   symbol: "^IXIC", color: "#7b2ff7" },
    { key: "soxl",    label: "SOXL",     symbol: "SOXL",  color: "#e17055" },
];

const PERIODS = [
    { key: "3mo",  label: "3개월" },
    { key: "6mo",  label: "6개월" },
    { key: "1y",   label: "1년"   },
    { key: "2y",   label: "2년"   },
    { key: "5y",   label: "5년"   },
];

const MA_OPTIONS = [
    { key: "ma5",   period: 5,   color: "#f39c12", label: "MA5"   },
    { key: "ma20",  period: 20,  color: "#e74c3c", label: "MA20"  },
    { key: "ma60",  period: 60,  color: "#3498db", label: "MA60"  },
    { key: "ma120", period: 120, color: "#9b59b6", label: "MA120" },
    { key: "ma200", period: 200, color: "#1abc9c", label: "MA200" },
];

// ── 이동평균 계산 ─────────────────────────────────────────────
function calcMA(closes, period) {
    return closes.map((_, i) => {
        if (i < period - 1) return null;
        const slice = closes.slice(i - period + 1, i + 1);
        return slice.reduce((s, v) => s + v, 0) / period;
    });
}

// ── 날짜 포맷 ─────────────────────────────────────────────────
function fmtShort(dateStr) {
    if (!dateStr) return "";
    const [, m, dd] = dateStr.split("-");
    return `${m}/${dd}`;
}

// ── 숫자 포맷 ────────────────────────────────────────────────
function fmtPrice(v) {
    if (v == null || isNaN(v)) return "-";
    return v >= 1000
        ? v.toLocaleString("en-US", { maximumFractionDigits: 0 })
        : v.toFixed(2);
}
function fmtPct(v) {
    if (v == null) return "-";
    const s = v >= 0 ? "+" : "";
    return `${s}${v.toFixed(2)}%`;
}

// ── 백엔드 API로 히스토리 fetch ───────────────────────────────
async function fetchHistory(symbol, range) {
    const url = `${API_BASE_URL}/getStockHistory?ticker=${encodeURIComponent(symbol)}&range=${range}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`서버 응답 오류 (HTTP ${res.status})`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!Array.isArray(data) || data.length === 0) throw new Error("데이터 없음");
    // data: [{ date: "2024-01-02", close: 4768.72 }, ...]
    return data;
}

// ── 커스텀 툴팁 ──────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid #e0e0e0",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 12,
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
            minWidth: 140,
        }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#333" }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, color: p.color, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontFamily: "monospace" }}>{fmtPrice(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────
export default function MovingAveragePage() {
    const [activeTicker, setActiveTicker] = useState("snp500");
    const [activePeriod, setActivePeriod] = useState("1y");
    const [activeMA, setActiveMA]         = useState(["ma20", "ma60", "ma120"]);
    const [chartData, setChartData]       = useState([]);
    const [loading, setLoading]           = useState(false);
    const [error, setError]               = useState(null);
    const [info, setInfo]                 = useState(null); // { last, change, pct, high, low }
    const abortRef = useRef(null);

    const ticker = TICKERS.find(t => t.key === activeTicker);

    const load = useCallback(async (sym, range) => {
        if (abortRef.current) abortRef.current = false;
        setLoading(true);
        setError(null);
        setChartData([]);
        setInfo(null);
        let cancelled = false;
        abortRef.current = () => { cancelled = true; };

        try {
            const rows = await fetchHistory(sym, range);
            if (cancelled) return;

            const closes = rows.map(r => r.close);

            // 각 MA 계산
            const maValues = {};
            MA_OPTIONS.forEach(({ key, period }) => {
                maValues[key] = calcMA(closes, period);
            });

            const data = rows.map((r, i) => {
                const entry = {
                    date: r.date,
                    종가: r.close,
                };
                MA_OPTIONS.forEach(({ key }) => {
                    const v = maValues[key][i];
                    entry[key] = v != null ? parseFloat(v.toFixed(2)) : null;
                });
                return entry;
            });

            setChartData(data);

            // 요약 정보
            const last  = closes[closes.length - 1];
            const first = closes[0];
            const high  = Math.max(...closes);
            const low   = Math.min(...closes);
            const pct   = ((last - first) / first) * 100;
            setInfo({ last, change: last - first, pct, high, low });
        } catch (e) {
            if (!cancelled) setError(e.message || "데이터를 불러올 수 없습니다.");
        } finally {
            if (!cancelled) setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(ticker.symbol, activePeriod);
    }, [activeTicker, activePeriod, load, ticker.symbol]);

    const toggleMA = (key) => {
        setActiveMA(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div style={{
            maxWidth: 1000,
            margin: "0 auto",
            padding: "20px 16px 48px",
            fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}>
            {/* 헤더 */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>이동평균선 차트</h2>
                <p style={{ margin: "5px 0 0", fontSize: 12, color: "#888" }}>
                    Yahoo Finance 일봉 데이터 기준 · S&P 500, NASDAQ, SOXL
                </p>
            </div>

            {/* 종목 선택 탭 */}
            <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #eee" }}>
                {TICKERS.map(t => (
                    <button key={t.key} onClick={() => setActiveTicker(t.key)} style={{
                        padding: "10px 20px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        borderBottom: activeTicker === t.key ? `2px solid ${t.color}` : "2px solid transparent",
                        marginBottom: -2,
                        color: activeTicker === t.key ? t.color : "#888",
                        fontWeight: activeTicker === t.key ? 700 : 400,
                        fontSize: 14,
                        transition: "all 0.15s",
                        whiteSpace: "nowrap",
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* 기간 + MA 선택 */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
            }}>
                {/* 기간 */}
                <div style={{ display: "flex", gap: 4 }}>
                    {PERIODS.map(p => (
                        <button key={p.key} onClick={() => setActivePeriod(p.key)} style={{
                            padding: "5px 12px",
                            borderRadius: 20,
                            border: "1.5px solid",
                            borderColor: activePeriod === p.key ? "#2d3436" : "#ddd",
                            background: activePeriod === p.key ? "#2d3436" : "#fff",
                            color: activePeriod === p.key ? "#fff" : "#555",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                        }}>
                            {p.label}
                        </button>
                    ))}
                </div>

                <div style={{ width: 1, height: 20, background: "#ddd", margin: "0 4px" }} />

                {/* MA 선택 */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {MA_OPTIONS.map(m => {
                        const on = activeMA.includes(m.key);
                        return (
                            <button key={m.key} onClick={() => toggleMA(m.key)} style={{
                                padding: "5px 12px",
                                borderRadius: 20,
                                border: `1.5px solid ${m.color}`,
                                background: on ? m.color : "#fff",
                                color: on ? "#fff" : m.color,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.15s",
                            }}>
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 요약 정보 바 */}
            {info && !loading && (
                <div style={{
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap",
                    marginBottom: 14,
                    padding: "10px 16px",
                    background: "#f8f9fa",
                    borderRadius: 10,
                    fontSize: 13,
                }}>
                    <InfoItem label="현재가"  value={fmtPrice(info.last)} />
                    <InfoItem
                        label={`${activePeriod} 등락`}
                        value={`${info.change >= 0 ? "+" : ""}${fmtPrice(Math.abs(info.change))} (${fmtPct(info.pct)})`}
                        color={info.pct >= 0 ? "#e74c3c" : "#3498db"}
                    />
                    <InfoItem label="기간 고점" value={fmtPrice(info.high)} color="#e74c3c" />
                    <InfoItem label="기간 저점" value={fmtPrice(info.low)}  color="#3498db" />
                    <InfoItem label="데이터 수" value={`${chartData.length}거래일`} />
                </div>
            )}

            {/* 차트 영역 */}
            <div style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #eee",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                padding: "20px 10px 10px",
                minHeight: 380,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {loading && (
                    <div style={{ textAlign: "center", color: "#aaa", fontSize: 14 }}>
                        <Spinner /> 데이터 불러오는 중...
                    </div>
                )}
                {error && (
                    <div style={{ textAlign: "center", color: "#e74c3c", fontSize: 13, padding: "20px 30px", maxWidth: 420 }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>데이터를 불러올 수 없습니다</div>
                        <div style={{ color: "#888", lineHeight: 1.6 }}>
                            {error}<br />
                            백엔드 서버가 실행 중인지 확인해 주세요.
                        </div>
                    </div>
                )}
                {!loading && !error && chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={fmtShort}
                                tick={{ fontSize: 11, fill: "#aaa" }}
                                minTickGap={40}
                                tickLine={false}
                                axisLine={{ stroke: "#eee" }}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#aaa" }}
                                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
                                tickLine={false}
                                axisLine={false}
                                width={55}
                                domain={["auto", "auto"]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                formatter={(value) => {
                                    const m = MA_OPTIONS.find(o => o.key === value);
                                    return m ? m.label : "종가";
                                }}
                            />

                            {/* 종가 */}
                            <Line
                                type="monotone"
                                dataKey="종가"
                                stroke={ticker.color}
                                strokeWidth={1.5}
                                dot={false}
                                activeDot={{ r: 4 }}
                                connectNulls
                            />

                            {/* MA 선 */}
                            {MA_OPTIONS.map(m => {
                                if (!activeMA.includes(m.key)) return null;
                                return (
                                    <Line
                                        key={m.key}
                                        type="monotone"
                                        dataKey={m.key}
                                        stroke={m.color}
                                        strokeWidth={1.5}
                                        strokeDasharray={m.key === "ma5" ? "4 2" : undefined}
                                        dot={false}
                                        connectNulls
                                        name={m.key}
                                    />
                                );
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* MA 설명 */}
            <div style={{
                marginTop: 20,
                padding: "14px 18px",
                background: "#f8f9fa",
                borderRadius: 10,
                fontSize: 12,
                color: "#666",
                lineHeight: 1.8,
            }}>
                <div style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>이동평균선이란?</div>
                <div>
                    <b>MA(N)</b>은 최근 N 거래일의 종가 평균을 이은 선입니다.
                    단기선(MA5·MA20)이 장기선(MA60·MA120·MA200)을 <b style={{ color: "#e74c3c" }}>상향 돌파</b>하면 골든크로스(상승 신호),
                    <b style={{ color: "#3498db" }}> 하향 돌파</b>하면 데드크로스(하락 신호)로 봅니다.
                    MA200은 장기 추세, MA60·MA120은 중기 지지/저항선으로 자주 활용됩니다.
                </div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
                    {MA_OPTIONS.map(m => (
                        <span key={m.key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ display: "inline-block", width: 18, height: 2, background: m.color, borderRadius: 2 }} />
                            <b style={{ color: m.color }}>{m.label}</b>: {m.period}일 이동평균
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InfoItem({ label, value, color }) {
    return (
        <div>
            <div style={{ fontSize: 10, color: "#aaa", fontWeight: 700, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: color || "#2d3436" }}>{value}</div>
        </div>
    );
}

function Spinner() {
    return (
        <span style={{
            display: "inline-block",
            width: 16, height: 16,
            border: "2px solid #ddd",
            borderTopColor: "#3498db",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            marginRight: 8,
            verticalAlign: "middle",
        }} />
    );
}
