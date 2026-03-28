import React, { useEffect, useState, useCallback } from "react";
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

    const fetchList = useCallback(async (p, sec) => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}`);
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
    // 갱신 완료 감지
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec); };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

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

            <InfoBox>
                PER·PBR 오름차순 순위를 합산해 0~100점으로 환산. 낮을수록 저평가.<br />
                <span style={{ color: '#1a7a4a' }}>녹색</span> PER&lt;15 / PBR&lt;1.5 &nbsp;
                <span style={{ color: '#2e86ab' }}>파랑</span> PER&lt;25 / PBR&lt;3 &nbsp;
                <span style={{ color: '#c0392b' }}>빨강</span> 그 이상
            </InfoBox>
        </>
    );
}

// ── 슈퍼 퀀트 전략 탭 ───────────────────────────────────────
function SuperQuantTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);

    const fetchList = useCallback(async (p, sec) => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getSuperQuantList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=super`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec); };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th><Th right>PBR</Th>
                            <Th right>GP/A or ROE</Th><Th right>시가총액</Th>
                            <Th center w={80}>가치</Th><Th center w={80}>품질</Th><Th center w={80}>종합</Th>
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
                                <Td right><ColorNum v={item.pb} low={1.5} mid={3} dec={2} /></Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a7a4a' }}>
                                        {fmtNum(item.qualityMetric, 1)}%
                                    </span>
                                    <span style={{ fontSize: 10, color: '#aaa', marginLeft: 4 }}>
                                        {item.qualityLabel || ''}
                                    </span>
                                </Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center><ScoreBadge score={item.valueScore} /></Td>
                                <Td center><ScoreBadge score={item.qualityScore} /></Td>
                                <Td center><ScoreBadge score={item.combinedScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

            <InfoBox>
                <strong>슈퍼 퀀트 전략</strong>: 저평가(Low PBR) + 우량(High GP/A) 조합.
                GP/A(총이익/총자산) 데이터가 없는 종목은 ROE(자기자본이익률)로 대체.<br />
                가치·품질 점수를 각 0~100점으로 환산 후 평균 → 종합점수 순 정렬.
                PBR이 낮고 GP/A·ROE가 높을수록 높은 점수.
            </InfoBox>
        </>
    );
}

// ── 마법공식 탭 ─────────────────────────────────────────────
function MagicFormulaTab({ updatedAt, refreshing }) {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading]       = useState(false);
    const [status, setStatus]         = useState("");
    const [sector, setSector]         = useState("ALL");
    const [sectors, setSectors]       = useState([]);

    const fetchList = useCallback(async (p, sec) => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getMagicFormulaList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}`);
            const data = await res.json();
            setItems(data.items || []); setTotalPages(data.totalPages || 0);
            setTotalCount(data.totalCount || 0); setStatus(data.status || "OK");
        } catch (e) { message("로드 실패: " + e.message, "error"); }
        finally { setLoading(false); }
    }, []);

    const fetchSectors = useCallback(async () => {
        try {
            const res = await fetch(`${API}/getSectors?strategy=magic`);
            setSectors(await res.json());
        } catch (e) {}
    }, []);

    useEffect(() => { fetchList(0, "ALL"); fetchSectors(); }, []);
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec); };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span></>}
            </div>

            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th><Th right>EV/EBITDA</Th>
                            <Th right>ROA(%)</Th><Th right>시가총액</Th>
                            <Th center w={80}>수익성</Th><Th center w={80}>효율</Th><Th center w={80}>마법점수</Th>
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
                                <Td right><ColorNum v={item.evToEbitda} low={10} mid={20} dec={1} /></Td>
                                <Td right>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: item.roa >= 10 ? '#1a7a4a' : item.roa >= 5 ? '#2e86ab' : '#c0392b' }}>
                                        {fmtNum(item.roa, 1)}%
                                    </span>
                                </Td>
                                <Td right muted>{fmtCap(item.marketCap)}</Td>
                                <Td center><ScoreBadge score={item.earningsScore} /></Td>
                                <Td center><ScoreBadge score={item.efficiencyScore} /></Td>
                                <Td center><ScoreBadge score={item.magicScore} /></Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

            <InfoBox>
                <strong>마법공식 (Magic Formula)</strong> — Joel Greenblatt의 전략을 S&P 500에 적용.<br />
                수익성 지표: <strong>수익률(Earnings Yield)</strong> = 1/(EV/EBITDA)×100 — 높을수록 저평가.<br />
                효율 지표: <strong>ROA(자산수익률)</strong> — 높을수록 자본 효율성 우수.<br />
                두 순위를 0~100점 환산 후 평균 → <strong>마법점수</strong> 높은 순 정렬.
                EV/EBITDA가 낮고 ROA가 높을수록 높은 점수.
            </InfoBox>
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

    const fetchList = useCallback(async (p, sec) => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/getCombinedList?page=${p}&size=${PAGE_SIZE}&sector=${encodeURIComponent(sec)}`);
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
    useEffect(() => { if (!refreshing && updatedAt) { fetchList(page, sector); fetchSectors(); } }, [updatedAt]);

    const handlePage = (p) => { setPage(p); fetchList(p, sector); window.scrollTo({ top: 0, behavior: 'smooth' }); };
    const handleSector = (sec) => { setSector(sec); setPage(0); fetchList(0, sec); };

    return (
        <>
            <div style={metaBar}>
                {status === "NO_DATA"
                    ? <span style={{ color: '#e74c3c' }}>캐시 없음 — 새로고침 버튼을 눌러주세요.</span>
                    : <><span>총 <strong>{totalCount.toLocaleString()}</strong>개</span><span>|</span><span>갱신: <strong>{updatedAt || "-"}</strong></span><span style={{ color: '#888' }}>※ 세 전략 모두 적용 가능한 종목만 표시</span></>}
            </div>

            <SectorFilter sectors={sectors} sector={sector} onChange={handleSector} />

            <ScreenTable loading={loading} items={items} status={status}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                            <Th w={55} center>순위</Th><Th>종목코드</Th><Th>기업명</Th>
                            <Th>섹터</Th><Th right>현재가</Th>
                            <Th center w={80} title="가치 투자 스크리닝 (Low PER+PBR)">가치</Th>
                            <Th center w={80} title="슈퍼 퀀트 전략 (Low PBR + GP/A·ROE)">슈퍼퀀트</Th>
                            <Th center w={80} title="마법공식 (Earnings Yield + ROA)">마법공식</Th>
                            <Th center w={90}>총합점수</Th>
                            <Th right>시가총액</Th>
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
                                <Td center><ScoreBadge score={item.superScore} /></Td>
                                <Td center><ScoreBadge score={item.magicScore} /></Td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ScreenTable>

            <Pagination page={page} totalPages={totalPages} onChange={handlePage} />

            <InfoBox>
                <strong>총합 랭킹</strong>: 세 전략에 모두 해당하는 종목만 포함 (inner join).<br />
                총합점수 = (가치점수 + 슈퍼퀀트 종합점수 + 마법점수) ÷ 3 → 0~100점.<br />
                세 전략에서 균형 있게 높은 점수를 받는 종목이 상위에 랭킹됩니다.
            </InfoBox>
        </>
    );
}

// ── 메인 페이지 ─────────────────────────────────────────────
export default function QuantPage() {
    const [activeTab,  setActiveTab]  = useState("value");
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
        { key: "value",      label: "가치 투자 스크리닝",  sub: "Low PER + Low PBR" },
        { key: "superquant", label: "슈퍼 퀀트 전략",      sub: "Low PBR + GP/A · ROE" },
        { key: "magic",      label: "마법공식",            sub: "Earnings Yield + ROA" },
        { key: "combined",   label: "총합 랭킹",           sub: "세 전략 점수 평균" },
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
            {activeTab === "value"      && <ValueTab updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "superquant" && <SuperQuantTab updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "magic"      && <MagicFormulaTab updatedAt={updatedAt} refreshing={refreshing} />}
            {activeTab === "combined"   && <CombinedTab updatedAt={updatedAt} refreshing={refreshing} />}
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
