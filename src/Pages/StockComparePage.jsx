import React, { useState, useEffect, useRef } from "react";
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { message } from "../Components/Message";

const API = "https://api.mypad.kr/quantInvest";

const STOCK_COLORS = ['#2e86ab', '#e07b39', '#1a7a4a', '#c0392b', '#8e44ad', '#f39c12'];

const METRICS = [
    { key: 'pe',                 label: 'PER',          lowerIsBetter: true,  desc: '낮을수록 이익 대비 주가가 싸다' },
    { key: 'pb',                 label: 'PBR',          lowerIsBetter: true,  desc: '낮을수록 자산 대비 주가가 싸다' },
    { key: 'roe',                label: 'ROE (%)',       lowerIsBetter: false, desc: '높을수록 자기자본 대비 이익이 크다' },
    { key: 'gpa',                label: 'GP/A (%)',      lowerIsBetter: false, desc: '높을수록 사업 경쟁력이 강하다' },
    { key: 'fiftyTwoWeekChange', label: '52주 수익률(%)', lowerIsBetter: false, desc: '최근 1년 주가 상승률' },
    { key: 'revenueGrowth',      label: '매출 성장률(%)', lowerIsBetter: false, desc: '높을수록 빠르게 성장 중' },
];

// ── 숫자/가격 포맷 ───────────────────────────────────────────
function fmtPrice(stock) {
    if (!stock || !stock.price) return '-';
    const curr = stock.currency || 'USD';
    if (curr === 'KRW') return `₩${Math.round(stock.price).toLocaleString()}`;
    if (curr === 'USD') return `$${stock.price.toFixed(2)}`;
    return `${curr} ${stock.price.toFixed(2)}`;
}

function fmtCap(v, currency = 'USD') {
    if (!v) return '-';
    if (currency === 'KRW') {
        if (v >= 1e12) return `₩${(v / 1e12).toFixed(1)}조`;
        if (v >= 1e8)  return `₩${(v / 1e8).toFixed(0)}억`;
        return `₩${v.toLocaleString()}`;
    }
    if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
    if (v >= 1e9)  return `$${(v / 1e9).toFixed(1)}B`;
    if (v >= 1e6)  return `$${(v / 1e6).toFixed(1)}M`;
    return `$${v}`;
}

function getBest(stocks, key, lowerIsBetter) {
    const vals = stocks.map(s => s[key]).filter(v => typeof v === 'number' && v !== 0);
    if (!vals.length) return null;
    return lowerIsBetter ? Math.min(...vals) : Math.max(...vals);
}

// 거래소 → 한국어 표시
function exchLabel(s) {
    const ex = s.exchange || '';
    const map = {
        'KSC': 'KOSPI', 'KOE': 'KOSDAQ', 'KSE': 'KOSPI',
        'NMS': 'NASDAQ', 'NGM': 'NASDAQ', 'NCM': 'NASDAQ',
        'NYQ': 'NYSE', 'NYS': 'NYSE',
        'PCX': 'NYSE Arca', 'BTS': 'OTC',
    };
    return map[ex] || ex;
}

// ── 자동완성 검색창 ──────────────────────────────────────────
function StockSearchInput({ onAdd, disabled }) {
    const [query, setQuery]             = useState('');
    const [results, setResults]         = useState([]);
    const [searching, setSearching]     = useState(false);
    const [open, setOpen]               = useState(false);
    const wrapperRef                    = useRef(null);
    const debounceRef                   = useRef(null);

    // 바깥 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handle = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    // 입력값 변경 시 검색 (디바운스 350ms)
    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (!query.trim()) { setResults([]); setOpen(false); return; }
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res  = await fetch(`${API}/searchStock?q=${encodeURIComponent(query.trim())}`);
                const data = await res.json();
                setResults(Array.isArray(data) ? data : []);
                setOpen(true);
            } catch (_) {
                setResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);
    }, [query]);

    const select = (symbol) => {
        setQuery('');
        setOpen(false);
        setResults([]);
        onAdd(symbol);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (results.length > 0 && open) select(results[0].symbol);
            else if (query.trim())          select(query.trim().toUpperCase());
        }
        if (e.key === 'Escape') setOpen(false);
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'relative' }}>
                <span style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 15, color: '#bbb', pointerEvents: 'none',
                }}>&#128269;</span>
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0) setOpen(true); }}
                    placeholder="종목코드 6자리 (예: 005930) 또는 영문 티커·회사명 (예: AAPL, Apple)"
                    disabled={disabled}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '11px 36px 11px 38px', fontSize: 14,
                        border: '1.5px solid #e0e0e0', borderRadius: 10,
                        outline: 'none', background: '#fafafa',
                        fontFamily: 'inherit',
                    }}
                    onFocus={e => e.target.style.borderColor = '#2e86ab'}
                    onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
                {query && (
                    <button onClick={() => { setQuery(''); setOpen(false); }} style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 16, color: '#bbb', padding: '0 4px', lineHeight: 1,
                    }}>✕</button>
                )}
            </div>

            {/* 드롭다운 */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: '#fff', border: '1px solid #e0e0e0', borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden',
                }}>
                    {searching && (
                        <div style={{ padding: '12px 16px', color: '#aaa', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <SpinIcon color="#aaa" /> 검색 중...
                        </div>
                    )}
                    {!searching && results.length === 0 && (
                        <div style={{ padding: '12px 16px', color: '#aaa', fontSize: 13 }}>
                            검색 결과 없음 — Enter를 누르면 입력한 코드로 직접 조회합니다
                        </div>
                    )}
                    {!searching && results.map((r, i) => {
                        const sym  = r.symbol || '';
                        const isKr = ['KOSPI', 'KOSDAQ', '코스피', '코스닥'].includes(r.exchange);
                        return (
                            <div key={sym} onClick={() => select(sym)} style={{
                                padding: '10px 16px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 10,
                                borderBottom: i < results.length - 1 ? '1px solid #f5f5f5' : 'none',
                                background: '#fff', transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                                <span style={{ fontWeight: 700, fontSize: 13, color: '#2e86ab', minWidth: 100, fontFamily: 'monospace' }}>
                                    {sym}
                                </span>
                                <span style={{ fontSize: 12, color: '#333', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {r.name || '-'}
                                </span>
                                <span style={{
                                    fontSize: 11, background: isKr ? '#fff3cd' : '#f0f0f0',
                                    color: isKr ? '#856404' : '#888',
                                    padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, fontWeight: 600,
                                }}>
                                    {r.exchange}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── 비교 테이블 ──────────────────────────────────────────────
function CompareTable({ stocks, colors }) {
    const sections = [
        {
            title: '기본 정보',
            rows: [
                {
                    label: '기업명',
                    render: s => <span style={{ fontSize: 12, fontWeight: 600, wordBreak: 'keep-all' }}>{s.name || '-'}</span>,
                    key: null,
                },
                {
                    label: '거래소',
                    render: s => {
                        const ex = exchLabel(s);
                        const isKr = ['KOSPI', 'KOSDAQ'].includes(ex);
                        return (
                            <span style={{
                                fontSize: 11, padding: '2px 8px', borderRadius: 10,
                                background: isKr ? '#fff3cd' : '#f0f0f0',
                                color: isKr ? '#856404' : '#555', fontWeight: 600,
                            }}>{ex || '-'}</span>
                        );
                    },
                    key: null,
                },
                {
                    label: '섹터',
                    render: s => <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f0f0f0', color: '#555' }}>{s.sector || '-'}</span>,
                    key: null,
                },
                { label: '현재가',   render: s => fmtPrice(s),                              key: null },
                { label: '시가총액', render: s => fmtCap(s.marketCap, s.currency || 'USD'), key: null },
            ],
        },
        {
            title: '가치 지표 — 낮을수록 저평가',
            rows: [
                {
                    label: 'PER', key: 'pe', lowerIsBetter: true,
                    render: s => typeof s.pe === 'number' && s.pe > 0 ? s.pe.toFixed(1) + '배' : '-',
                },
                {
                    label: 'PBR', key: 'pb', lowerIsBetter: true,
                    render: s => typeof s.pb === 'number' && s.pb > 0 ? s.pb.toFixed(2) + '배' : '-',
                },
                {
                    label: 'EPS', key: 'eps', lowerIsBetter: false,
                    render: s => {
                        if (!s.eps || s.eps === 0) return '-';
                        const curr = s.currency || 'USD';
                        if (curr === 'KRW') return `₩${Math.round(s.eps).toLocaleString()}`;
                        return `$${s.eps.toFixed(2)}`;
                    },
                },
                {
                    label: 'BPS', key: 'bps', lowerIsBetter: false,
                    render: s => {
                        if (!s.bps || s.bps === 0) return '-';
                        const curr = s.currency || 'USD';
                        if (curr === 'KRW') return `₩${Math.round(s.bps).toLocaleString()}`;
                        return `$${s.bps.toFixed(2)}`;
                    },
                },
            ],
        },
        {
            title: '수익성 지표 — 높을수록 우량',
            rows: [
                {
                    label: 'ROE (%)', key: 'roe', lowerIsBetter: false,
                    render: s => typeof s.roe === 'number' && s.roe !== 0 ? (
                        <span style={{ color: s.roe >= 20 ? '#1a7a4a' : s.roe >= 10 ? '#2e86ab' : '#c0392b', fontWeight: 600 }}>
                            {s.roe.toFixed(1)}%
                        </span>
                    ) : '-',
                },
                {
                    label: 'GP/A (%)', key: 'gpa', lowerIsBetter: false,
                    render: s => typeof s.gpa === 'number' && s.gpa > 0 ? (
                        <span style={{ color: s.gpa >= 30 ? '#1a7a4a' : s.gpa >= 15 ? '#2e86ab' : '#888', fontWeight: 600 }}>
                            {s.gpa.toFixed(1)}%
                        </span>
                    ) : '-',
                },
            ],
        },
        {
            title: '배당 정보',
            rows: [
                {
                    label: '배당수익률', key: 'divYield', lowerIsBetter: false,
                    render: s => s.divYield && s.divYield > 0
                        ? <span style={{ color: '#1a7a4a', fontWeight: 600 }}>{s.divYield.toFixed(2)}%</span>
                        : '-',
                },
                {
                    label: '주당배당금', key: 'divPerShare', lowerIsBetter: false,
                    render: s => {
                        if (!s.divPerShare || s.divPerShare === 0) return '-';
                        const curr = s.currency || 'USD';
                        if (curr === 'KRW') return `₩${Math.round(s.divPerShare).toLocaleString()}`;
                        return `$${s.divPerShare.toFixed(2)}`;
                    },
                },
            ],
        },
        {
            title: '성장 지표',
            rows: [
                {
                    label: '52주 수익률', key: 'fiftyTwoWeekChange', lowerIsBetter: false,
                    render: s => {
                        const v = s.fiftyTwoWeekChange;
                        if (!v && v !== 0) return '-';
                        return <span style={{ color: v >= 0 ? '#1a7a4a' : '#c0392b', fontWeight: 600 }}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</span>;
                    },
                },
                {
                    label: '매출 성장률', key: 'revenueGrowth', lowerIsBetter: false,
                    render: s => {
                        const v = s.revenueGrowth;
                        if (!v && v !== 0) return '-';
                        return <span style={{ color: v >= 0 ? '#1a7a4a' : '#c0392b', fontWeight: 600 }}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</span>;
                    },
                },
            ],
        },
    ];

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                    <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#555', width: 120, whiteSpace: 'nowrap' }}>지표</th>
                        {stocks.map((s, i) => (
                            <th key={s.symbol} style={{ padding: '12px 16px', textAlign: 'center', minWidth: 110 }}>
                                <a href={`https://finance.yahoo.com/quote/${s.symbol}`} target="_blank" rel="noreferrer"
                                    style={{ color: colors[i], textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
                                    {s.symbol}
                                </a>
                                <div style={{ fontSize: 10, color: colors[i], opacity: 0.65, fontWeight: 400, marginTop: 2 }}>
                                    {exchLabel(s)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sections.map(section => (
                        <React.Fragment key={section.title}>
                            <tr>
                                <td colSpan={stocks.length + 1} style={{
                                    padding: '9px 16px 5px', fontSize: 11, fontWeight: 700, color: '#888',
                                    background: '#f4f6f8', letterSpacing: '0.4px',
                                }}>
                                    {section.title}
                                </td>
                            </tr>
                            {section.rows.map((row, ri) => {
                                const best = row.key ? getBest(stocks, row.key, row.lowerIsBetter) : null;
                                return (
                                    <tr key={row.label} style={{ borderBottom: '1px solid #f3f3f3', background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#666', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                            {row.label}
                                        </td>
                                        {stocks.map((s, i) => {
                                            const raw    = row.key ? s[row.key] : null;
                                            const isBest = best !== null && raw === best;
                                            return (
                                                <td key={s.symbol} style={{
                                                    padding: '10px 16px', textAlign: 'center', fontSize: 13,
                                                    background: isBest ? colors[i] + '15' : 'inherit',
                                                    borderLeft: isBest ? `3px solid ${colors[i]}` : '3px solid transparent',
                                                    fontWeight: isBest ? 700 : 400,
                                                }}>
                                                    {row.render(s)}
                                                    {isBest && <span style={{ marginLeft: 3, fontSize: 10, color: colors[i] }}>★</span>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
            <div style={{ marginTop: 10, fontSize: 11, color: '#bbb', padding: '0 4px' }}>
                ★ 해당 지표 최우수 종목 | 국내주식: Naver Finance · 해외주식: Yahoo Finance
            </div>
        </div>
    );
}

// ── 비교 차트 ────────────────────────────────────────────────
function CompareChart({ stocks, colors }) {
    const chartH = Math.max(80, stocks.length * 46);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {METRICS.map(m => {
                const data = stocks.map((s, i) => ({
                    symbol: s.symbol,
                    value:  typeof s[m.key] === 'number' ? s[m.key] : 0,
                    color:  colors[i],
                }));
                if (!data.some(d => d.value !== 0)) return null;

                const best = getBest(stocks, m.key, m.lowerIsBetter);

                return (
                    <div key={m.key} style={{
                        background: '#fff', borderRadius: 12, border: '1px solid #eee',
                        padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{m.label}</span>
                            <span style={{ fontSize: 11, color: '#bbb' }}>{m.desc}</span>
                        </div>
                        <ResponsiveContainer width="100%" height={chartH}>
                            <BarChart data={data} layout="vertical" margin={{ top: 2, right: 55, left: 4, bottom: 0 }}>
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="symbol" width={70} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <Tooltip formatter={(v) => typeof v === 'number' ? v.toFixed(2) : v} />
                                <Bar dataKey="value" radius={[0, 6, 6, 0]}
                                    label={{ position: 'right', fontSize: 11, formatter: v => typeof v === 'number' && v !== 0 ? v.toFixed(1) : '' }}>
                                    {data.map((entry, idx) => (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={entry.value === best ? entry.color : entry.color + '80'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            })}
        </div>
    );
}

// ── 메인 페이지 ─────────────────────────────────────────────
export default function StockComparePage() {
    const [stocks, setStocks]           = useState([]);
    const [addingSymbol, setAddingSymbol] = useState('');
    const [viewMode, setViewMode]       = useState('table');

    const addStock = async (rawSymbol) => {
        const symbol = rawSymbol.trim().toUpperCase();
        if (!symbol) return;
        if (stocks.some(s => s.symbol === symbol)) {
            message(`${symbol}은 이미 추가되어 있습니다.`, 'error');
            return;
        }
        if (stocks.length >= 6) {
            message('최대 6종목까지 비교할 수 있습니다.', 'error');
            return;
        }

        setAddingSymbol(symbol);
        try {
            const res  = await fetch(`${API}/getStockDetails?symbols=${encodeURIComponent(symbol)}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                const stock = data[0];
                if (stock.error) message(`${symbol}: ${stock.error}`, 'error');
                else             setStocks(prev => [...prev, stock]);
            } else {
                message(`${symbol} 데이터를 찾을 수 없습니다.`, 'error');
            }
        } catch (e) {
            message('조회 실패: ' + e.message, 'error');
        } finally {
            setAddingSymbol('');
        }
    };

    const removeStock = (symbol) => setStocks(prev => prev.filter(s => s.symbol !== symbol));

    const QUICK_STOCKS = [
        { symbol: '005930.KS', label: '삼성전자' },
        { symbol: '000660.KS', label: 'SK하이닉스' },
        { symbol: 'AAPL',      label: 'Apple' },
        { symbol: 'MSFT',      label: 'Microsoft' },
        { symbol: 'NVDA',      label: 'NVIDIA' },
        { symbol: 'TSLA',      label: 'Tesla' },
    ];

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px', fontFamily: 'sans-serif' }}>

            {/* 헤더 */}
            <div style={{ marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>주식 종목 비교</h2>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#888' }}>
                    한글 회사명 또는 종목코드로 검색해 ROE, PER, PBR 등 핵심 지표를 비교하세요. 국내·해외 종목 모두 지원합니다. (최대 6종목)
                </p>
            </div>

            {/* 검색창 + 추가 버튼 */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <StockSearchInput onAdd={addStock} disabled={!!addingSymbol} />
                <div style={{
                    padding: '11px 16px', borderRadius: 10,
                    background: addingSymbol ? '#2e86ab' : '#f0f4f8',
                    color: addingSymbol ? '#fff' : '#aaa',
                    fontSize: 13, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                    minWidth: 110, justifyContent: 'center',
                    border: `1px solid ${addingSymbol ? '#2e86ab' : '#e0e0e0'}`,
                }}>
                    {addingSymbol
                        ? <><SpinIcon color="#fff" />{addingSymbol} 조회 중</>
                        : '선택하면 자동 추가'}
                </div>
            </div>

            {/* 빠른 예시 */}
            {stocks.length === 0 && !addingSymbol && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    <span style={{ fontSize: 12, color: '#bbb', alignSelf: 'center', marginRight: 2 }}>예시 종목:</span>
                    {QUICK_STOCKS.map(q => (
                        <button key={q.symbol} onClick={() => addStock(q.symbol)} style={{
                            padding: '5px 12px', borderRadius: 16, border: '1px solid #e0e0e0',
                            background: '#fff', color: '#555', fontSize: 12, cursor: 'pointer', fontWeight: 500,
                        }}>
                            {q.label}
                        </button>
                    ))}
                </div>
            )}

            {/* 추가된 종목 태그 */}
            {stocks.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {stocks.map((s, i) => (
                        <div key={s.symbol} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 20,
                            background: STOCK_COLORS[i] + '18',
                            border: `1.5px solid ${STOCK_COLORS[i]}`,
                            fontSize: 13, fontWeight: 700, color: STOCK_COLORS[i],
                        }}>
                            <span>{s.symbol}</span>
                            {exchLabel(s) && (
                                <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{exchLabel(s)}</span>
                            )}
                            <button onClick={() => removeStock(s.symbol)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: STOCK_COLORS[i], fontSize: 13, padding: 0, lineHeight: 1, opacity: 0.75,
                            }}>✕</button>
                        </div>
                    ))}
                    {stocks.length > 1 && (
                        <button onClick={() => setStocks([])} style={{
                            padding: '5px 12px', borderRadius: 20, border: '1px solid #e0e0e0',
                            background: '#fff', color: '#aaa', fontSize: 12, cursor: 'pointer',
                        }}>전체 삭제</button>
                    )}
                </div>
            )}

            {/* 빈 상태 */}
            {stocks.length === 0 && !addingSymbol && (
                <div style={{
                    padding: '60px 20px', textAlign: 'center',
                    background: '#f8f9fb', borderRadius: 16,
                    color: '#bbb', fontSize: 14, border: '2px dashed #e0e0e0', marginTop: 4,
                }}>
                    <div style={{ fontSize: 42, marginBottom: 12 }}>📊</div>
                    <div style={{ fontWeight: 600, color: '#aaa' }}>종목을 추가하면 비교 분석이 시작됩니다</div>
                    <div style={{ fontSize: 12, marginTop: 6, color: '#ccc' }}>
                        국내 주식은 <strong>종목코드 6자리</strong> (005930), 해외 주식은 <strong>영문 티커</strong> (AAPL)로 검색하세요
                    </div>
                </div>
            )}

            {/* 탭 + 비교 내용 */}
            {stocks.length > 0 && (
                <>
                    <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #eee' }}>
                        {[{ key: 'table', label: '표로 비교' }, { key: 'chart', label: '차트로 비교' }].map(tab => (
                            <button key={tab.key} onClick={() => setViewMode(tab.key)} style={{
                                padding: '10px 22px', border: 'none', background: 'none', cursor: 'pointer',
                                borderBottom: viewMode === tab.key ? '2px solid #2e86ab' : '2px solid transparent',
                                marginBottom: -2,
                                color: viewMode === tab.key ? '#2e86ab' : '#888',
                                fontWeight: viewMode === tab.key ? 700 : 400, fontSize: 14,
                            }}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {viewMode === 'table' && (
                        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            <CompareTable stocks={stocks} colors={STOCK_COLORS} />
                        </div>
                    )}
                    {viewMode === 'chart' && <CompareChart stocks={stocks} colors={STOCK_COLORS} />}
                </>
            )}
        </div>
    );
}

function SpinIcon({ color = '#2e86ab' }) {
    return (
        <span style={{
            display: 'inline-block', width: 13, height: 13, flexShrink: 0,
            border: `2px solid ${color}40`,
            borderTopColor: color, borderRadius: '50%',
            animation: 'stockSpin 0.7s linear infinite',
        }} />
    );
}

if (typeof document !== 'undefined' && !document.getElementById('stock-spin-kf')) {
    const s = document.createElement('style'); s.id = 'stock-spin-kf';
    s.textContent = '@keyframes stockSpin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
}
