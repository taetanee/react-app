import React, { useEffect, useState, useCallback, useRef } from "react";
import { message } from "../Components/Message";

const API      = "https://api.mypad.kr/quantInvest";
const PAGE_SIZE = 20;

const SECTOR_KO = {
    "Information Technology": "IT", "Health Care": "헬스케어",
    "Financials": "금융", "Consumer Discretionary": "경기소비재",
    "Communication Services": "커뮤니케이션", "Industrials": "산업재",
    "Consumer Staples": "필수소비재", "Energy": "에너지",
    "Utilities": "유틸리티", "Real Estate": "리츠", "Materials": "소재",
};
const sectorKo = (s) => SECTOR_KO[s] || s || "-";

function fmtCap(v) {
    if (!v) return "-";
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v}`;
}

function scoreColor(score) {
    if (score >= 80) return '#1a7a4a';
    if (score >= 60) return '#2e86ab';
    if (score >= 40) return '#e07b39';
    return '#c0392b';
}
function scoreBg(score) {
    if (score >= 80) return '#e6f9f0';
    if (score >= 60) return '#e3f2fd';
    if (score >= 40) return '#fff3e0';
    return '#fdecea';
}
function rankBadge(rank) {
    const medals = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
    if (medals[rank]) return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            background: medals[rank], color: '#fff', fontWeight: 700, fontSize: 12,
        }}>{rank}</span>
    );
    return <span style={{ color: '#888', fontSize: 13 }}>{rank}</span>;
}

function ScoreBadge({ score }) {
    return (
        <span style={{
            display: 'inline-block', minWidth: 52, padding: '3px 8px',
            borderRadius: 6, fontSize: 13, fontWeight: 700,
            color: scoreColor(score), background: scoreBg(score),
        }}>
            {typeof score === 'number' ? score.toFixed(1) : score}
        </span>
    );
}

// ── 페이지네이션 ─────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const getPageNums = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
        let start = Math.max(0, page - 3), end = Math.min(totalPages - 1, page + 3);
        if (end - start < 6) { start === 0 ? (end = Math.min(6, totalPages - 1)) : (start = Math.max(0, end - 6)); }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 20 }}>
            <PBtn onClick={() => onChange(0)} disabled={page === 0}>«</PBtn>
            <PBtn onClick={() => onChange(page - 1)} disabled={page === 0}>‹</PBtn>
            {getPageNums().map(p => <PBtn key={p} active={p === page} onClick={() => onChange(p)}>{p + 1}</PBtn>)}
            <PBtn onClick={() => onChange(page + 1)} disabled={page === totalPages - 1}>›</PBtn>
            <PBtn onClick={() => onChange(totalPages - 1)} disabled={page === totalPages - 1}>»</PBtn>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#aaa' }}>{page + 1} / {totalPages}</span>
        </div>
    );
}
function PBtn({ children, onClick, disabled, active }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            width: 34, height: 34, borderRadius: 7,
            border: active ? '2px solid #2e86ab' : '1px solid #e0e0e0',
            background: active ? '#2e86ab' : disabled ? '#f8f8f8' : '#fff',
            color: active ? '#fff' : disabled ? '#ccc' : '#333',
            fontWeight: active ? 700 : 400, fontSize: 13,
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{children}</button>
    );
}

// ── 전략 설명 카드 ───────────────────────────────────────────
const STRATEGY_INFO = {
    value: {
        icon: "💰",
        title: "저평가 주식을 찾는 전략",
        desc: "주가가 기업의 실제 가치보다 싸게 거래되는 종목을 고릅니다. PER(주가 ÷ 순이익)과 PBR(주가 ÷ 순자산)이 낮을수록 더 싼 주식입니다.",
        metrics: [
            { label: "PER", tip: "낮을수록 이익 대비 주가가 싸다" },
            { label: "PBR", tip: "낮을수록 자산 대비 주가가 싸다" },
        ],
        color: "#1a7a4a",
        bg: "#e6f9f0",
    },
    quality: {
        icon: "⭐",
        title: "우량한 기업을 찾는 전략",
        desc: "수익성이 높은 진짜 좋은 기업을 찾습니다. ROE(자기자본이익률)는 주주 돈을 얼마나 잘 불리는지, GP/A(총이익/총자산)는 사업 자체의 경쟁력을 나타냅니다. 두 지표가 모두 높은 기업은 장기적으로 우수한 성과를 냅니다.",
        metrics: [
            { label: "ROE", tip: "높을수록 자기자본 대비 이익이 크다" },
            { label: "GP/A", tip: "높을수록 자산 대비 총이익이 크다 — 사업 경쟁력" },
        ],
        color: "#2e86ab",
        bg: "#e3f2fd",
    },
    smallcap: {
        icon: "🌱",
        title: "빠르게 성장하는 소형주를 찾는 전략",
        desc: "시가총액이 작지만 매출이 빠르게 성장하는 기업을 찾습니다. 소형주는 대형주보다 장기 수익률이 높은 경향(소형주 프리미엄)이 있고, 높은 성장률은 미래 가치 상승을 기대하게 합니다.",
        metrics: [
            { label: "시가총액", tip: "낮을수록 아직 주목받지 못한 소형주" },
            { label: "매출 성장률", tip: "높을수록 빠르게 성장 중인 기업" },
        ],
        color: "#1a7a4a",
        bg: "#e6f9f0",
    },
    momentum: {
        icon: "🚀",
        title: "오르는 주식이 계속 오르는 전략",
        desc: "최근 1년간 주가 상승세가 강하고 매출도 성장 중인 기업을 찾습니다. 수십 년의 연구로 검증된 '모멘텀 효과' — 오르는 주식은 계속 오르는 경향이 있습니다.",
        metrics: [
            { label: "52주 수익률", tip: "높을수록 최근 1년 주가 상승이 강하다" },
            { label: "매출 성장률", tip: "높을수록 사업이 빠르게 성장 중" },
        ],
        color: "#c77b2d",
        bg: "#fff3e0",
    },
};

function StrategyCard({ strategyKey }) {
    const info = STRATEGY_INFO[strategyKey];
    if (!info) return null;
    return (
        <div style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            background: info.bg, border: `1.5px solid ${info.color}22`,
            borderRadius: 12, padding: '14px 18px', marginBottom: 16,
        }}>
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{info.icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: info.color, marginBottom: 4 }}>
                    {info.title}
                </div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 8 }}>
                    {info.desc}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {info.metrics.map(m => (
                        <span key={m.label} title={m.tip} style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                            background: '#fff', border: `1px solid ${info.color}44`,
                            color: info.color, fontWeight: 600, cursor: 'default',
                        }}>
                            {m.label} — {m.tip}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── 검색창 ───────────────────────────────────────────────────
function SearchBox({ value, onChange, placeholder = "종목코드 / 기업명 검색" }) {
    return (
        <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: '#aaa', pointerEvents: 'none',
            }}>&#128269;</span>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '9px 36px 9px 36px',
                    border: '1.5px solid #e0e0e0', borderRadius: 10,
                    fontSize: 13, outline: 'none',
                    transition: 'border-color 0.2s',
                    background: '#fafafa',
                }}
                onFocus={e => e.target.style.borderColor = '#2e86ab'}
                onBlur={e => e.target.style.borderColor = '#e0e0e0'}
            />
            {value && (
                <button onClick={() => onChange('')} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 16, color: '#aaa', padding: '0 4px', lineHeight: 1,
                }}>✕</button>
            )}
        </div>
    );
}

// ── 섹터 필터 ─────────────────────────────────────────────────
function SectorFilter({ sectors, sector, onChange }) {
    if (!sectors.length) return null;
    return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {["ALL", ...sectors].map(sec => (
                <button key={sec} onClick={() => onChange(sec)} style={{
                    padding: '5px 12px', borderRadius: 20, border: '1px solid',
                    borderColor: sector === sec ? '#2e86ab' : '#ddd',
                    background: sector === sec ? '#2e86ab' : '#fff',
                    color: sector === sec ? '#fff' : '#555',
                    fontSize: 12, cursor: 'pointer', fontWeight: sector === sec ? 600 : 400,
                }}>
                    {sec === "ALL" ? "전체" : sectorKo(sec)}
                </button>
            ))}
        </div>
    );
}

// ── 공통 테이블 래퍼 ─────────────────────────────────────────
function ScreenTable({ loading, items, status, children }) {
    if (loading) return (
        <div style={{ ...tableCard, padding: 60, textAlign: 'center', color: '#aaa', fontSize: 14 }}>
            <span style={spinStyle} /> 로딩 중...
        </div>
    );
    if (!items.length) return (
        <div style={{ ...tableCard, padding: 60, textAlign: 'center', color: '#aaa', fontSize: 14 }}>
            {status === "NO_DATA" ? "데이터가 없습니다. [데이터 새로고침] 버튼을 눌러주세요." : "조건에 맞는 종목이 없습니다."}
        </div>
    );
    return <div style={tableCard}>{children}</div>;
}

// ── 가치 투자 스크리닝 탭 ───────────────────────────────────
function ValueTab({ id, updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);
    const [search, setSearch]         = useState("");
    const debounceRef                 = useRef(null);

    const fetchList = useCallback(async (p, sec, q = "") => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=value`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector, search); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector, search); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec, search); };
    const handleSearch = (q) => {
        setSearch(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(0); fetchList(0, sector, q); }, 300);
    };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <StrategyCard strategyKey="value" />
            <SearchBox value={search} onChange={handleSearch} />
            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th><Th right>PER</Th>
                            <Th right>PBR</Th><Th right>시가총액</Th><Th center w={90}>가치점수</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={item.symbol} style={{ borderBottom: '1px solid #f3f3f3', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                                <Td center>{rankBadge(item.rank)}</Td>
                                <Td><a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#2e86ab', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>{item.symbol}</a></Td>
                                <Td><div style={{ fontSize: 13, fontWeight: 500, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div></Td>
                                <Td><SectorChip>{sectorKo(item.sector)}</SectorChip></Td>
                                <Td right mono>${fmtNum(item.price, 2)}</Td>
                                <Td right><ColorNum v={item.pe} low={15} mid={25} /></Td>
                                <Td right><ColorNum v={item.pb} low={1.5} mid={3} dec={2} /></Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center><ScoreBadge score={item.valueScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

        </>
    );
}

// ── 퀄리티 전략 탭 ──────────────────────────────────────────
function QualityTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);
    const [search, setSearch]         = useState("");
    const debounceRef                 = useRef(null);

    const fetchList = useCallback(async (p, sec, q = "") => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getQualityList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=quality`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector, search); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector, search); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec, search); };
    const handleSearch = (q) => {
        setSearch(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(0); fetchList(0, sector, q); }, 300);
    };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <StrategyCard strategyKey="quality" />
            <SearchBox value={search} onChange={handleSearch} />
            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th>
                            <Th right>ROE(%)</Th><Th right>GP/A(%)</Th>
                            <Th right>시가총액</Th>
                            <Th center w={80}>ROE점수</Th><Th center w={80}>GP/A점수</Th><Th center w={80}>퀄리티점수</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={item.symbol} style={{ borderBottom: '1px solid #f3f3f3', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                                <Td center>{rankBadge(item.rank)}</Td>
                                <Td><a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#2e86ab', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>{item.symbol}</a></Td>
                                <Td><div style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div></Td>
                                <Td><SectorChip>{sectorKo(item.sector)}</SectorChip></Td>
                                <Td right mono>${fmtNum(item.price, 2)}</Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.roe >= 20 ? '#1a7a4a' : item.roe >= 10 ? '#2e86ab' : '#c0392b' }}>
                                        {fmtNum(item.roe, 1)}%
                                    </span>
                                </Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.gpa >= 30 ? '#1a7a4a' : item.gpa >= 15 ? '#2e86ab' : '#888' }}>
                                        {item.gpa ? `${fmtNum(item.gpa, 1)}%` : '-'}
                                    </span>
                                </Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center><ScoreBadge score={item.roeScore} /></Td>
                                <Td center><ScoreBadge score={item.gpaScore} /></Td>
                                <Td center><ScoreBadge score={item.qualityScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

        </>
    );
}

// ── 소형주 전략 탭 ──────────────────────────────────────────
function SmallCapTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);
    const [search, setSearch]         = useState("");
    const debounceRef                 = useRef(null);

    const fetchList = useCallback(async (p, sec, q = "") => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getSmallCapList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=smallcap`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector, search); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector, search); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec, search); };
    const handleSearch = (q) => {
        setSearch(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(0); fetchList(0, sector, q); }, 300);
    };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <StrategyCard strategyKey="smallcap" />
            <SearchBox value={search} onChange={handleSearch} />
            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th>
                            <Th right>시가총액</Th><Th right>매출 성장률</Th>
                            <Th center w={80}>소형주점수</Th><Th center w={80}>성장점수</Th><Th center w={80}>소형주종합점수</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={item.symbol} style={{ borderBottom: '1px solid #f3f3f3', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                                <Td center>{rankBadge(item.rank)}</Td>
                                <Td><a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#2e86ab', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>{item.symbol}</a></Td>
                                <Td><div style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div></Td>
                                <Td><SectorChip>{sectorKo(item.sector)}</SectorChip></Td>
                                <Td right mono>${fmtNum(item.price, 2)}</Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.revenueGrowth >= 20 ? '#1a7a4a' : item.revenueGrowth >= 5 ? '#2e86ab' : item.revenueGrowth >= 0 ? '#888' : '#c0392b' }}>
                                        {item.revenueGrowth >= 0 ? '+' : ''}{fmtNum(item.revenueGrowth, 1)}%
                                    </span>
                                </Td>
                                <Td center><ScoreBadge score={item.smallScore} /></Td>
                                <Td center><ScoreBadge score={item.growthScore} /></Td>
                                <Td center><ScoreBadge score={item.smallCapScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

        </>
    );
}

// ── 모멘텀 전략 탭 ──────────────────────────────────────────
function MomentumTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);
    const [search, setSearch]         = useState("");
    const debounceRef                 = useRef(null);

    const fetchList = useCallback(async (p, sec, q = "") => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getMomentumList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=momentum`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector, search); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector, search); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec, search); };
    const handleSearch = (q) => {
        setSearch(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(0); fetchList(0, sector, q); }, 300);
    };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <StrategyCard strategyKey="momentum" />
            <SearchBox value={search} onChange={handleSearch} />
            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th>
                            <Th right>52주 수익률</Th><Th right>매출 성장률</Th>
                            <Th right>시가총액</Th>
                            <Th center w={80}>주가점수</Th><Th center w={80}>성장점수</Th><Th center w={80}>모멘텀점수</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={item.symbol} style={{ borderBottom: '1px solid #f3f3f3', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                                <Td center>{rankBadge(item.rank)}</Td>
                                <Td><a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#2e86ab', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>{item.symbol}</a></Td>
                                <Td><div style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div></Td>
                                <Td><SectorChip>{sectorKo(item.sector)}</SectorChip></Td>
                                <Td right mono>${fmtNum(item.price, 2)}</Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.fiftyTwoWeekChange >= 0 ? '#1a7a4a' : '#c0392b' }}>
                                        {item.fiftyTwoWeekChange >= 0 ? '+' : ''}{fmtNum(item.fiftyTwoWeekChange, 1)}%
                                    </span>
                                </Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.revenueGrowth >= 0 ? '#1a7a4a' : '#c0392b' }}>
                                        {item.revenueGrowth >= 0 ? '+' : ''}{fmtNum(item.revenueGrowth, 1)}%
                                    </span>
                                </Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center><ScoreBadge score={item.priceScore} /></Td>
                                <Td center><ScoreBadge score={item.growthScore} /></Td>
                                <Td center><ScoreBadge score={item.momentumScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

        </>
    );
}

// ── 총합 랭킹 탭 ────────────────────────────────────────────
function CombinedTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);
    const [search, setSearch]         = useState("");
    const debounceRef                 = useRef(null);

    const fetchList = useCallback(async (p, sec, q = "") => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getCombinedList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}&search=${encodeURIComponent(q)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=value`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector, search); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector, search); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec, search); };
    const handleSearch = (q) => {
        setSearch(q);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { setPage(0); fetchList(0, sector, q); }, 300);
    };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span><span style={{ color: '#888' }}>※ 4전략 모두 적용 가능한 종목만 표시</span></>}
            </div>

            <SearchBox value={search} onChange={handleSearch} />
            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th>
                            <Th center w={80} title="가치 전략 (Low PER + Low PBR)">가치</Th>
                            <Th center w={80} title="퀄리티 전략 (High ROE + High GP/A)">퀄리티</Th>
                            <Th center w={80} title="모멘텀 전략 (52주 수익률 + 매출 성장)">모멘텀</Th>
                            <Th center w={80} title="소형주 전략 (Low Market Cap + Revenue Growth)">소형주</Th>
                            <Th center w={90}>총합점수</Th>
                            <Th right>시가총액</Th>
                            <Th center w={80}>시총순위</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={item.symbol} style={{ borderBottom: '1px solid #f3f3f3', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#fafafa'}>
                                <Td center>{rankBadge(item.rank)}</Td>
                                <Td><a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#2e86ab', fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>{item.symbol}</a></Td>
                                <Td><div style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div></Td>
                                <Td><SectorChip>{sectorKo(item.sector)}</SectorChip></Td>
                                <Td right mono>${fmtNum(item.price, 2)}</Td>
                                <Td center><ScoreBadge score={item.valueScore} /></Td>
                                <Td center><ScoreBadge score={item.qualityScore} /></Td>
                                <Td center><ScoreBadge score={item.momentumScore} /></Td>
                                <Td center><ScoreBadge score={item.smallCapScore} /></Td>
                                <Td center>
                                    <span style={{
                                        display: 'inline-block', minWidth: 58, padding: '4px 10px',
                                        borderRadius: 8, fontSize: 14, fontWeight: 800,
                                        color: scoreColor(item.totalScore),
                                        background: scoreBg(item.totalScore),
                                        border: `1.5px solid ${scoreColor(item.totalScore)}33`,
                                    }}>
                                        {typeof item.totalScore === 'number' ? item.totalScore.toFixed(1) : '-'}
                                    </span>
                                </Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center>
                                    <span style={{ fontSize: 12, color: '#888' }}>
                                        {item.mcapRank ? `${item.mcapRank}위` : '-'}
                                    </span>
                                </Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

        </>
    );
}

// ── 메인 페이지 ─────────────────────────────────────────────
export default function QuantPage() {
    const [activeTab,  setActiveTab]  = useState("combined");
    const [refreshing, setRefreshing] = useState(false);
    const [updatedAt,  setUpdatedAt]  = useState(null);
    const [pollTimer,  setPollTimer]  = useState(null);

    useEffect(() => {
        fetch(`${API}/getStatus`).then(r => r.json())
            .then(d => { if (d.updatedAt) setUpdatedAt(d.updatedAt); })
            .catch(() => {});
        return () => { if (pollTimer) clearInterval(pollTimer); };
    }, []);

    const handleRefresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        message("S&P 500 전체 수집 시작 (10~15분 소요)", "info");
        try {
            await fetch(`${API}/refresh`, { method: "POST" });
            const timer = setInterval(async () => {
                try {
                    const res  = await fetch(`${API}/getStatus`);
                    const data = await res.json();
                    if (data.status === "OK" && data.updatedAt !== updatedAt) {
                        setUpdatedAt(data.updatedAt);
                        setRefreshing(false);
                        clearInterval(timer);
                        message("데이터 수집 완료!", "success");
                    }
                } catch (e) {}
            }, 10000);
            setPollTimer(timer);
            setTimeout(() => { clearInterval(timer); setRefreshing(false); }, 20 * 60 * 1000);
        } catch (e) { setRefreshing(false); message("갱신 요청 실패", "error"); }
    };

    const tabs = [
        { key: "combined", label: "총합 랭킹",          sub: "4전략 점수 평균" },
        { key: "value",    label: "가치 전략",           sub: "Low PER + Low PBR" },
        { key: "quality",  label: "퀄리티 전략",         sub: "High ROE + High GP/A" },
        { key: "momentum", label: "모멘텀 전략",         sub: "52주 수익률 + 매출 성장" },
        { key: "smallcap", label: "소형주 전략",         sub: "Low Cap + Revenue Growth" },
    ];

    return (
        <div style={{ maxWidth: 1150, margin: '0 auto', padding: '20px 16px', fontFamily: 'sans-serif' }}>

            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>S&P 500 퀀트 스크리닝</h2>
                    <p style={{ margin: '5px 0 0', fontSize: 12, color: '#888' }}>
                        Wikipedia S&P 500 전체 종목 · Yahoo Finance 실시간 펀더멘털 · 자동 갱신 오전 7시 KST
                    </p>
                </div>
                <button onClick={handleRefresh} disabled={refreshing} style={{
                    padding: '8px 18px', borderRadius: 8, border: 'none',
                    background: refreshing ? '#bdc3c7' : '#2e86ab',
                    color: '#fff', fontWeight: 700, fontSize: 13, cursor: refreshing ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    {refreshing ? <><span style={spinStyle} />수집 중...</> : "데이터 새로고침"}
                </button>
            </div>

            {/* 탭 */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #eee' }}>
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                        padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: activeTab === tab.key ? '2px solid #2e86ab' : '2px solid transparent',
                        marginBottom: -2, transition: 'all 0.2s',
                        color: activeTab === tab.key ? '#2e86ab' : '#888',
                    }}>
                        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>{tab.label}</div>
                        <div style={{ fontSize: 11, marginTop: 2, opacity: 0.75 }}>{tab.sub}</div>
                    </button>
                ))}
            </div>

            {/* 탭 콘텐츠 */}
            {activeTab === "combined" && <CombinedTab updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "value"    && <ValueTab    updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "quality"  && <QualityTab  updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "momentum" && <MomentumTab updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "smallcap" && <SmallCapTab updatedAt={updatedAt} refreshing={refreshing} />}
        </div>
    );
}

// ── UI 헬퍼 컴포넌트 ────────────────────────────────────────
function Th({ children, w, center, right }) {
    return <th style={{ padding: '11px 12px', textAlign: center ? 'center' : right ? 'right' : 'left', fontSize: 12, fontWeight: 700, color: '#555', whiteSpace: 'nowrap', width: w }}>{children}</th>;
}
function Td({ children, center, right, mono, muted }) {
    return <td style={{ padding: '10px 12px', fontSize: 13, verticalAlign: 'middle', textAlign: center ? 'center' : right ? 'right' : 'left', fontFamily: mono ? 'monospace' : 'inherit', color: muted ? '#888' : 'inherit' }}>{children}</td>;
}
function SectorChip({ children }) {
    return <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f0f0f0', color: '#555', whiteSpace: 'nowrap' }}>{children}</span>;
}
function ColorNum({ v, low, mid, dec = 1 }) {
    const color = v < low ? '#1a7a4a' : v < mid ? '#2e86ab' : '#c0392b';
    return <span style={{ fontSize: 13, fontWeight: 600, color }}>{typeof v === 'number' ? v.toFixed(dec) : v}</span>;
}
function InfoBox({ children }) {
    return <div style={{ marginTop: 20, padding: '12px 16px', background: '#f8f9fb', borderRadius: 10, fontSize: 12, color: '#777', lineHeight: 1.8 }}>{children}</div>;
}
function fmtNum(v, dec) { return typeof v === 'number' ? v.toFixed(dec) : v; }

const tableCard = { background: '#fff', borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' };
const metaBar   = { marginBottom: 12, padding: '8px 14px', background: '#f8f9fa', borderRadius: 8, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#666', alignItems: 'center' };
const spinStyle = { display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', verticalAlign: 'middle' };

if (typeof document !== 'undefined' && !document.getElementById('spin-kf')) {
    const s = document.createElement('style'); s.id = 'spin-kf';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
}
