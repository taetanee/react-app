import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { message } from "../Components/Message";

const API_BASE_URL = "https://api.mypad.kr/myDashboard";

// 대분류 레이블 (대시보드 / 내 종목)
const BigLabel = ({ label }) => (
    <div style={{ fontSize: '11px', fontWeight: '800', color: '#adb5bd', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px' }}>
        {label}
    </div>
);

// 패널 컨테이너 — 흰 패널(즐겨찾기) vs 회색 패널(미등록)
const Panel = ({ icon, label, accent, children, headerRight }) => (
    <div style={{
        background: accent ? '#fff' : '#e9ecef',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: accent ? '0 2px 14px rgba(0,0,0,0.08)' : 'none',
        border: accent ? 'none' : '1px solid #dee2e6',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
                <span style={{ fontSize: '12px', fontWeight: '700', color: accent ? '#2d3436' : '#868e96' }}>
                    {label}
                </span>
            </div>
            {headerRight}
        </div>
        {children}
    </div>
);

// 카드별 포인트 색상
const CARD_ACCENT = {
    weather: '#3498db',
    dust: '#636e72',
    snp500: '#00b894',
    exchange: '#f39c12',
    feargreed: '#e17055',
    vix: '#a29bfe',
    kospi: '#e63946',
    bitcoin: '#f7931a',
    dowjones: '#1a6ef7',
    nasdaq: '#7b2ff7',
};

// 카드별 아이콘
const CARD_ICON = {
    weather: '🌤️',
    dust: '🌫️',
    snp500: '📈',
    exchange: '💵',
    feargreed: '😨',
    vix: '📊',
    kospi: '🇰🇷',
    bitcoin: '₿',
    dowjones: '🏛️',
    nasdaq: '💻',
};

// 공포탐욕지수 색상
const getFearGreedColor = (value) => {
    if (value <= 25) return '#e74c3c';
    if (value <= 45) return '#e67e22';
    if (value <= 55) return '#f39c12';
    if (value <= 75) return '#2ecc71';
    return '#27ae60';
};

// 미세먼지 색상
const getDustStyle = (dust) => {
    if (!dust) return { bg: '#f8f9fa', text: '#bdc3c7', border: '#dee2e6' };
    if (dust.includes("매우 나쁨")) return { bg: '#ffeaea', text: '#c0392b', border: '#e74c3c' };
    if (dust.includes("나쁨")) return { bg: '#fff3e0', text: '#d35400', border: '#e67e22' };
    if (dust.includes("보통")) return { bg: '#eafaf1', text: '#1e8449', border: '#27ae60' };
    return { bg: '#eaf4fb', text: '#1a5276', border: '#3498db' };
};

// VIX 상태 배지
const getVixStatus = (price) => {
    const v = parseFloat(price);
    if (isNaN(v)) return null;
    if (v < 15) return { text: '안정', color: '#00b894' };
    if (v < 25) return { text: '주의', color: '#f39c12' };
    if (v < 35) return { text: '경계', color: '#e67e22' };
    return { text: '위험', color: '#e74c3c' };
};

export default function Main() {
    const { id: rawId } = useParams();
    const id = rawId?.replace(/^@/, '') ?? '';
    const [dust, setDust] = useState("");
    const [snp500, setSnp500] = useState({ price: "", change: "", percent: "", isUp: true });
    const [weather, setWeather] = useState(null);
    const [exchangeRate, setExchangeRate] = useState({ rate: "", change: "", percent: "", isUp: true });
    const [fearGreed, setFearGreed] = useState({ value: 0, rating: "", diff: 0, status: "UP" });
    const [vix, setVix] = useState({ price: "", change: "", percent: "", isUp: true, status: "" });
    const [kospi, setKospi] = useState({ price: "", change: "", percent: "", isUp: true });
    const [bitcoin, setBitcoin] = useState({ price: "", change: "", percent: "", isUp: true });
    const [dowjones, setDowjones] = useState({ price: "", change: "", percent: "", isUp: true });
    const [nasdaq, setNasdaq] = useState({ price: "", change: "", percent: "", isUp: true });
    const [weeklyWeather, setWeeklyWeather] = useState([]);

    const [bookmarks, setBookmarks] = useState(['weather', 'dust', 'snp500', 'exchange', 'feargreed', 'vix', 'kospi', 'bitcoin', 'weeklyWeather']);

    const [customStocks, setCustomStocks] = useState([]);
    const [stockHistoryData, setStockHistoryData] = useState({});
    const [stockPeriod, setStockPeriod] = useState('1d');

    // 서버에서 preferences 로드
    useEffect(() => {
        if (!id) return;
        fetch(`${API_BASE_URL}/getPreferences?randomWord=${encodeURIComponent(id)}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);
                if (Array.isArray(data.customStocks)) setCustomStocks(data.customStocks);
            })
            .catch(() => {
                try {
                    const saved = localStorage.getItem(`dashboard_bookmarks_${id}`);
                    if (saved) setBookmarks(JSON.parse(saved));
                    const savedStocks = localStorage.getItem(`custom_stocks_${id}`);
                    if (savedStocks) setCustomStocks(JSON.parse(savedStocks));
                } catch {}
            });
    }, [id]);

    const savePreferences = (newBookmarks, newStocks) => {
        fetch(`${API_BASE_URL}/savePreferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ randomWord: id, bookmarks: newBookmarks, customStocks: newStocks })
        }).catch(e => console.error('환경설정 저장 실패', e));
    };

    const [stockData, setStockData] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [addingTicker, setAddingTicker] = useState(null);

    // 기존 대시보드 데이터 fetch
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/getMinuDustFrcstDspth`);
                const text = await res.text();
                if (text && !text.includes("500")) setDust(text);
            } catch (e) { console.error("미세먼지 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getSnp500CurrentPrice`);
                const data = await res.json();
                if (data && data.result_code !== 500) setSnp500(data);
            } catch (e) { console.error("S&P500 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getCurrentWeather`);
                const data = await res.json();
                if (data && data.result_code !== 500) setWeather(data);
            } catch (e) { console.error("날씨 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getExchangeRateUSDToKRW`);
                const data = await res.json();
                if (data && data.result_code !== 500) setExchangeRate(data);
            } catch (e) { console.error("환율 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getFearAndGreedIndex`);
                const data = await res.json();
                if (data && data.result_code !== 500) setFearGreed(data);
            } catch (e) { console.error("공포탐욕 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getVixIndex`);
                const data = await res.json();
                if (data && data.result_code !== 500) setVix(data);
            } catch (e) { console.error("VIX 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getKospiIndex`);
                const data = await res.json();
                if (data && data.result_code !== 500) setKospi(data);
            } catch (e) { console.error("KOSPI 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getBitcoinPrice`);
                const data = await res.json();
                if (data && data.result_code !== 500) setBitcoin(data);
            } catch (e) { console.error("비트코인 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getDowJonesIndex`);
                const data = await res.json();
                if (data && data.result_code !== 500) setDowjones(data);
            } catch (e) { console.error("다우존스 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getNasdaqIndex`);
                const data = await res.json();
                if (data && data.result_code !== 500) setNasdaq(data);
            } catch (e) { console.error("나스닥 실패", e); }

            try {
                const res = await fetch(`${API_BASE_URL}/getWeeklyWeather`);
                const data = await res.json();
                if (Array.isArray(data)) setWeeklyWeather(data);
            } catch (e) { console.error("주간날씨 실패", e); }
        };

        fetchAll();
        const intervalId = setInterval(fetchAll, 10000);
        return () => clearInterval(intervalId);
    }, []);

    // 즐겨찾기 종목 히스토리 fetch
    useEffect(() => {
        const bookmarkedTickers = customStocks.filter(t => bookmarks.includes(`stock_${t}`));
        if (bookmarkedTickers.length === 0) return;
        setStockHistoryData({});
        bookmarkedTickers.forEach(async (ticker) => {
            try {
                const res = await fetch(`${API_BASE_URL}/getStockHistory?ticker=${encodeURIComponent(ticker)}&range=${stockPeriod}`);
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setStockHistoryData(prev => ({ ...prev, [ticker]: data }));
                }
            } catch (e) { console.error(`${ticker} 히스토리 실패`, e); }
        });
    }, [customStocks, bookmarks, stockPeriod]);

    // 개별 종목 데이터 fetch
    const fetchStocks = useCallback(async () => {
        if (customStocks.length === 0) return;
        for (const ticker of customStocks) {
            try {
                const res = await fetch(`${API_BASE_URL}/getStockPrice?ticker=${encodeURIComponent(ticker)}`);
                const data = await res.json();
                if (data && !data.error) {
                    setStockData(prev => ({ ...prev, [ticker]: data }));
                }
            } catch (e) { console.error(`${ticker} 실패`, e); }
        }
    }, [customStocks]);

    useEffect(() => {
        fetchStocks();
        const intervalId = setInterval(fetchStocks, 10000);
        return () => clearInterval(intervalId);
    }, [fetchStocks]);

    // 종목 검색
    const handleSearchStock = async () => {
        const query = searchQuery.trim();
        if (!query) return;
        setSearching(true);
        setSearchResults([]);
        try {
            const res = await fetch(`${API_BASE_URL}/searchStock?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setSearchResults(data);
            } else {
                message('검색 결과가 없습니다.', 'error');
            }
        } catch (e) {
            message('종목 검색 실패', 'error');
        } finally {
            setSearching(false);
        }
    };

    // 검색 결과에서 선택하여 추가
    const handleSelectStock = async (ticker, name) => {
        if (customStocks.includes(ticker)) {
            message('이미 추가된 종목입니다.', 'error');
            return;
        }
        setAddingTicker(ticker);
        try {
            const res = await fetch(`${API_BASE_URL}/getStockPrice?ticker=${encodeURIComponent(ticker)}`);
            const data = await res.json();
            const newStocks = [...customStocks, ticker];
            setCustomStocks(newStocks);
            if (data && !data.error) {
                setStockData(prev => ({ ...prev, [ticker]: data }));
            }
            const newBookmarks = [...bookmarks, `stock_${ticker}`];
            setBookmarks(newBookmarks);
            savePreferences(newBookmarks, newStocks);
            setSearchResults([]);
            setSearchQuery('');
            message(`${name || ticker} 추가 완료`, 'success');
        } catch (e) {
            message('종목 추가 실패', 'error');
        } finally {
            setAddingTicker(null);
        }
    };

    // 종목 삭제
    const handleRemoveStock = (ticker, e) => {
        e.preventDefault();
        e.stopPropagation();
        const newStocks = customStocks.filter(t => t !== ticker);
        setCustomStocks(newStocks);
        const newBookmarks = bookmarks.filter(b => b !== `stock_${ticker}`);
        setBookmarks(newBookmarks);
        savePreferences(newBookmarks, newStocks);
        setStockData(prev => {
            const copy = { ...prev };
            delete copy[ticker];
            return copy;
        });
        message(`${ticker} 삭제 완료`, 'success');
    };

    const toggleBookmark = (cardId, e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = bookmarks.includes(cardId)
            ? bookmarks.filter(b => b !== cardId)
            : [...bookmarks, cardId];
        setBookmarks(next);
        savePreferences(next, customStocks);
    };

    // 기본 값 스타일
    const valueStyle = {
        fontSize: "22px",
        fontWeight: "700",
        margin: "0",
        lineHeight: 1.2,
    };

    const changeStyle = (isUp) => ({
        fontSize: "12px",
        fontWeight: "600",
        color: isUp ? "#e74c3c" : "#3498db",
    });

    // 기본 카드 정의
    const staticCards = [
        {
            id: 'weeklyWeather',
            title: '이번주 날씨',
            fullWidth: true,
            link: 'https://search.naver.com/search.naver?query=%EC%9D%B4%EB%B2%88%EC%A3%BC+%EB%82%A0%EC%94%A8',
            content: () => weeklyWeather.length > 0 ? (
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {weeklyWeather.map((d, i) => (
                        <div key={i} style={{
                            flex: '1 0 0',
                            minWidth: '42px',
                            textAlign: 'center',
                            padding: '6px 4px',
                            borderRadius: '10px',
                            background: i === 0 ? '#eaf4fb' : 'transparent',
                        }}>
                            <div style={{ fontSize: '11px', fontWeight: i === 0 ? '800' : '600', color: i === 0 ? '#3498db' : '#868e96' }}>
                                {i === 0 ? '오늘' : d.day}
                            </div>
                            <div style={{ fontSize: '20px', margin: '4px 0 2px' }}>{d.emoji}</div>
                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#e74c3c' }}>{d.maxTemp}°</div>
                            <div style={{ fontSize: '11px', color: '#74b9ff' }}>{d.minTemp}°</div>
                            {d.precip > 0 && (
                                <div style={{ fontSize: '10px', color: '#74b9ff', marginTop: '2px' }}>💧{d.precip}%</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : <p style={{ fontSize: '13px', color: '#b2bec3', margin: '6px 0 0' }}>불러오는 중...</p>
        },
        {
            id: 'weather',
            title: '서울 날씨',
            link: 'https://www.google.com/search?q=%EC%98%A4%EB%8A%98%EB%82%A0%EC%94%A8',
            content: () => (
                weather && weather.temperature ? (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ ...valueStyle, color: '#3498db' }}>
                                {weather.temperature?.value ?? "0"}°C
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#636e72' }}>
                            {weather.precipitation?.description ?? "정보 없음"}
                        </p>
                    </div>
                ) : <p style={{ fontSize: "13px", color: "#bdc3c7", margin: "6px 0 0" }}>불러오는 중...</p>
            )
        },
        {
            id: 'dust',
            title: '서울 미세먼지',
            link: 'https://m.search.naver.com/search.naver?query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80',
            content: () => {
                const s = getDustStyle(dust);
                return (
                    <div style={{
                        marginTop: '6px',
                        padding: '6px 10px',
                        background: s.bg,
                        borderRadius: '8px',
                        border: `1px solid ${s.border}`,
                        display: 'inline-block',
                        minWidth: '60px',
                        textAlign: 'center',
                    }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: s.text }}>
                            {dust || "..."}
                        </span>
                    </div>
                );
            }
        },
        {
            id: 'snp500',
            title: 'S&P 500',
            link: 'https://www.google.com/search?q=snp500',
            content: () => (
                <div>
                    <p style={{ ...valueStyle, color: '#2d3436' }}>{snp500.price || "..."}</p>
                    {snp500.price && (
                        <p style={{ ...changeStyle(snp500.isUp), margin: '4px 0 0' }}>
                            {snp500.isUp ? "▲" : "▼"} {snp500.change} ({snp500.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'exchange',
            title: '달러/원 환율',
            link: 'https://kr.investing.com/currencies/usd-krw',
            content: () => (
                <div>
                    <p style={{ ...valueStyle, color: '#2d3436' }}>
                        {exchangeRate.rate ? `${exchangeRate.rate}원` : "..."}
                    </p>
                    {exchangeRate.rate && (
                        <p style={{ ...changeStyle(exchangeRate.isUp), margin: '4px 0 0' }}>
                            {exchangeRate.isUp ? "▲" : "▼"} {exchangeRate.change} ({exchangeRate.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'feargreed',
            title: '공포탐욕지수',
            link: 'https://edition.cnn.com/markets/fear-and-greed',
            content: () => {
                const fgColor = getFearGreedColor(fearGreed.value);
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ ...valueStyle, color: fgColor }}>{fearGreed.value || "0"}</span>
                            <span style={{ fontSize: "12px", fontWeight: "600", color: fearGreed.status === "UP" ? "#e74c3c" : "#3498db" }}>
                                {fearGreed.status === "UP" ? "▲" : "▼"} {Math.abs(fearGreed.diff)}
                            </span>
                        </div>
                        {/* 게이지 바 */}
                        <div style={{ height: '5px', background: '#f0f0f0', borderRadius: '3px', margin: '7px 0 5px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(fearGreed.value, 100)}%`,
                                background: `linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71)`,
                                borderRadius: '3px',
                                transition: 'width 0.6s ease',
                            }} />
                        </div>
                        <p style={{ fontSize: "11px", color: "#95a5a6", margin: "0", fontWeight: '600' }}>
                            {fearGreed.rating}
                        </p>
                    </div>
                );
            }
        },
        {
            id: 'nasdaq',
            title: '나스닥',
            link: 'https://finance.yahoo.com/quote/%5EIXIC',
            content: () => (
                <div>
                    <p style={{ ...valueStyle, color: '#2d3436' }}>{nasdaq.price || "..."}</p>
                    {nasdaq.price && (
                        <p style={{ ...changeStyle(nasdaq.isUp), margin: '4px 0 0' }}>
                            {nasdaq.isUp ? "▲" : "▼"} {nasdaq.change} ({nasdaq.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'dowjones',
            title: '다우존스',
            link: 'https://finance.yahoo.com/quote/%5EDJI',
            content: () => (
                <div>
                    <p style={{ ...valueStyle, color: '#2d3436' }}>{dowjones.price || "..."}</p>
                    {dowjones.price && (
                        <p style={{ ...changeStyle(dowjones.isUp), margin: '4px 0 0' }}>
                            {dowjones.isUp ? "▲" : "▼"} {dowjones.change} ({dowjones.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'bitcoin',
            title: '비트코인',
            link: 'https://www.google.com/search?q=%EB%B9%84%ED%8A%B8%EC%BD%94%EC%9D%B8',
            content: () => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <p style={{ ...valueStyle, color: '#2d3436' }}>{bitcoin.price ? `$${Number(bitcoin.price).toLocaleString()}` : "..."}</p>
                    </div>
                    {bitcoin.price && (
                        <p style={{ ...changeStyle(bitcoin.isUp), margin: '4px 0 0' }}>
                            {bitcoin.isUp ? "▲" : "▼"} ${Number(bitcoin.change).toLocaleString()} ({bitcoin.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'kospi',
            title: '코스피',
            link: 'https://search.naver.com/search.naver?query=%EC%BD%94%EC%8A%A4%ED%94%BC',
            content: () => (
                <div>
                    <p style={{ ...valueStyle, color: '#2d3436' }}>{kospi.price || "..."}</p>
                    {kospi.price && (
                        <p style={{ ...changeStyle(kospi.isUp), margin: '4px 0 0' }}>
                            {kospi.isUp ? "▲" : "▼"} {kospi.change} ({kospi.percent})
                        </p>
                    )}
                </div>
            )
        },
        {
            id: 'vix',
            title: 'VIX (변동성)',
            link: 'https://www.google.com/search?q=vix+index',
            content: () => {
                const status = getVixStatus(vix.price);
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ ...valueStyle, color: '#2d3436' }}>{vix.price || "..."}</span>
                            {vix.price && (
                                <span style={{ ...changeStyle(vix.isUp) }}>
                                    {vix.isUp ? "▲" : "▼"} {vix.change}
                                </span>
                            )}
                        </div>
                        {status && (
                            <span style={{
                                display: 'inline-block',
                                marginTop: '5px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: status.color,
                                background: `${status.color}18`,
                                padding: '2px 8px',
                                borderRadius: '10px',
                                border: `1px solid ${status.color}40`,
                            }}>
                                {status.text}
                            </span>
                        )}
                    </div>
                );
            }
        },
    ];

    // 개별 종목 카드 동적 생성
    const stockCards = customStocks.map(ticker => {
        const data = stockData[ticker] || {};
        return {
            id: `stock_${ticker}`,
            title: data.name || ticker,
            ticker: ticker,
            isStock: true,
            isUp: data.isUp,
            _price: data.price,
            _change: data.change,
            _percent: data.percent,
            _prevClose: data.price && data.change
                ? (data.isUp
                    ? parseFloat(data.price) - parseFloat(data.change)
                    : parseFloat(data.price) + parseFloat(data.change))
                : null,
            link: `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`,
            content: () => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ ...valueStyle, fontSize: '18px', color: '#2d3436' }}>
                            {data.price || "..."}
                        </span>
                        {data.currency && (
                            <span style={{ fontSize: '11px', color: '#95a5a6' }}>{data.currency}</span>
                        )}
                    </div>
                    {data.price && data.price !== "0.00" && (
                        <p style={{ ...changeStyle(data.isUp), margin: '4px 0 0' }}>
                            {data.isUp ? "▲" : "▼"} {data.change} ({data.percent})
                        </p>
                    )}
                </div>
            )
        };
    });

    // 즐겨찾기 분류 (북마크 배열 순서대로 정렬 — 나중에 추가한 것이 뒤에 옴)
    const bookmarkedStatic = staticCards.filter(c => bookmarks.includes(c.id)).sort((a, b) => bookmarks.indexOf(a.id) - bookmarks.indexOf(b.id));
    const nonBookmarkedStatic = staticCards.filter(c => !bookmarks.includes(c.id));
    const bookmarkedStock = stockCards.filter(c => bookmarks.includes(c.id)).sort((a, b) => bookmarks.indexOf(a.id) - bookmarks.indexOf(b.id));
    const nonBookmarkedStock = stockCards.filter(c => !bookmarks.includes(c.id));

    // 카드 렌더링
    const renderCard = (card) => {
        const accentColor = card.isStock
            ? (card.isUp !== false ? '#00b894' : '#e17055')
            : (CARD_ACCENT[card.id] || '#636e72');
        const icon = card.isStock
            ? (card.isUp !== false ? '📈' : '📉')
            : (CARD_ICON[card.id] || '📌');
        const isBookmarked = bookmarks.includes(card.id);
        const gridStyle = card.fullWidth ? { gridColumn: '1 / -1' } : {};

        return (
            <div key={card.id} style={gridStyle}>
                <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                    <div style={{
                        background: '#fff',
                        borderRadius: '14px',
                        boxShadow: '0 1px 8px rgba(0,0,0,0.07)',
                        overflow: 'hidden',
                        height: '100%',
                        boxSizing: 'border-box',
                    }}>
                        {/* 상단 컬러 바 */}
                        <div style={{ height: '3px', background: accentColor }} />
                        <div style={{ padding: '10px 12px 13px' }}>
                            {/* 헤더: 아이콘 + 제목 + 즐겨찾기 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: '7px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 1 }}>
                                    <span style={{ fontSize: '13px', flexShrink: 0 }}>{icon}</span>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#8e9aaf',
                                        fontWeight: '700',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {card.title}
                                    </span>
                                    {card.isStock && (
                                        <span style={{ fontSize: '10px', color: '#b2bec3', flexShrink: 0 }}>
                                            {card.ticker}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1px', flexShrink: 0 }}>
                                    {card.isStock && (
                                        <button
                                            onClick={(e) => handleRemoveStock(card.ticker, e)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '11px',
                                                padding: '2px 4px',
                                                color: '#e17055',
                                                lineHeight: 1,
                                            }}
                                            title="삭제"
                                        >✕</button>
                                    )}
                                    <button
                                        onClick={(e) => toggleBookmark(card.id, e)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '15px',
                                            padding: '0 2px',
                                            lineHeight: 1,
                                            color: isBookmarked ? '#f1c40f' : '#dfe6e9',
                                            transition: 'color 0.15s',
                                        }}
                                        title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                                    >
                                        {isBookmarked ? '★' : '☆'}
                                    </button>
                                </div>
                            </div>
                            {/* 콘텐츠 */}
                            {card.content()}
                        </div>
                    </div>
                </a>
            </div>
        );
    };

    // 종목 검색 카드
    const renderSearchForm = () => (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: searchResults.length > 0 ? '10px' : '0' }}>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                    placeholder="🔍 종목명 또는 코드 검색 (예: AAPL, SOXL)"
                    style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ced4da',
                        fontSize: '13px',
                        outline: 'none',
                        background: '#fff',
                        color: '#2d3436',
                    }}
                />
                <button
                    onClick={handleSearchStock}
                    disabled={searching}
                    style={{
                        padding: '9px 16px',
                        backgroundColor: searching ? '#b2bec3' : '#3498db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: searching ? 'default' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '700',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {searching ? '검색중...' : '검색'}
                </button>
            </div>

            {searchResults.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, borderRadius: '10px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
                    {searchResults.map((item, index) => {
                        const alreadyAdded = customStocks.includes(item.ticker);
                        const isAdding = addingTicker === item.ticker;
                        return (
                            <li
                                key={item.ticker}
                                onClick={() => !alreadyAdded && !isAdding && handleSelectStock(item.ticker, item.name)}
                                style={{
                                    padding: '9px 12px',
                                    cursor: alreadyAdded ? 'default' : 'pointer',
                                    backgroundColor: '#fff',
                                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    opacity: alreadyAdded ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => { if (!alreadyAdded) e.currentTarget.style.backgroundColor = '#eaf4fb'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
                            >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2d3436', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#95a5a6', marginTop: '2px' }}>
                                        {item.ticker}
                                        <span style={{ margin: '0 5px', color: '#dfe6e9' }}>|</span>
                                        {item.exchange}
                                        {item.type === 'ETF' && <span style={{ marginLeft: '5px', color: '#e67e22', fontWeight: '700' }}>ETF</span>}
                                        {item.type === 'INDEX' && <span style={{ marginLeft: '5px', color: '#8e44ad', fontWeight: '700' }}>INDEX</span>}
                                    </div>
                                </div>
                                <div style={{ marginLeft: '10px', flexShrink: 0 }}>
                                    {alreadyAdded ? (
                                        <span style={{ fontSize: '11px', color: '#b2bec3', fontWeight: '600' }}>추가됨</span>
                                    ) : isAdding ? (
                                        <span style={{ fontSize: '11px', color: '#3498db' }}>추가중...</span>
                                    ) : (
                                        <span style={{ fontSize: '11px', color: '#fff', fontWeight: '700', padding: '3px 10px', background: '#3498db', borderRadius: '6px' }}>
                                            ⭐ 추가
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );

    return (
        <div style={{
            padding: "16px 16px 40px",
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            backgroundColor: "#f4f6f8",
            minHeight: "100vh",
        }}>
            <div style={{ maxWidth: "500px", margin: "0 auto" }}>

                {/* 즐겨찾기 패널 (흰 배경) */}
                <div style={{ marginBottom: '10px' }}>
                    <Panel icon="⭐" label="즐겨찾기" accent>
                        {bookmarkedStatic.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {bookmarkedStatic.map(card => renderCard(card))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '12px', color: '#b2bec3', textAlign: 'center', padding: '14px 0', margin: 0 }}>
                                카드의 ☆을 눌러 즐겨찾기를 추가하세요
                            </p>
                        )}
                    </Panel>
                </div>

                {/* 내 종목 즐겨찾기 패널 (흰 배경) */}
                {bookmarkedStock.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                        <Panel
                            icon="📈"
                            label="내 종목 즐겨찾기"
                            accent
                            headerRight={
                                <div style={{ display: 'flex', gap: 3 }}>
                                    {[
                                        { key: '1d',  label: '1D' },
                                        { key: '5d',  label: '5D' },
                                        { key: '1mo', label: '1M' },
                                        { key: '6mo', label: '6M' },
                                    ].map(p => (
                                        <button
                                            key={p.key}
                                            onClick={() => setStockPeriod(p.key)}
                                            style={{
                                                padding: '3px 8px',
                                                borderRadius: 6,
                                                border: '1.5px solid',
                                                borderColor: stockPeriod === p.key ? '#2d3436' : '#e0e0e0',
                                                background: stockPeriod === p.key ? '#2d3436' : '#fff',
                                                color: stockPeriod === p.key ? '#fff' : '#999',
                                                fontSize: 11,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >{p.label}</button>
                                    ))}
                                </div>
                            }
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {bookmarkedStock.map(card => (
                                    <StockMiniCard
                                        key={card.id}
                                        card={card}
                                        historyData={stockHistoryData[card.ticker]}
                                        onRemove={handleRemoveStock}
                                        onToggleBookmark={toggleBookmark}
                                        isBookmarked={bookmarks.includes(card.id)}
                                        period={stockPeriod}
                                    />
                                ))}
                            </div>
                        </Panel>
                    </div>
                )}

                {/* 미등록 패널 (회색 배경) */}
                {nonBookmarkedStatic.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                        <Panel label="즐겨찾기 미등록">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {nonBookmarkedStatic.map(card => renderCard(card))}
                            </div>
                        </Panel>
                    </div>
                )}
                {nonBookmarkedStatic.length === 0 && <div style={{ marginBottom: '28px' }} />}

                {/* ── 내 종목 ── */}
                <BigLabel label="내 종목" />

                {/* 즐겨찾기 미등록 + 검색 패널 (회색 배경) */}
                <Panel label="즐겨찾기 미등록">
                    {renderSearchForm()}
                    {nonBookmarkedStock.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                            {nonBookmarkedStock.map(card => renderCard(card))}
                        </div>
                    )}
                </Panel>

            </div>
        </div>
    );
}

// ── 스파크라인 SVG ────────────────────────────────────────────
function Sparkline({ data, isUp, prevClose, period }) {
    const W = 96, H = 44;
    const color = isUp ? '#e74c3c' : '#3498db';
    const gradId = isUp ? 'spark-up' : 'spark-dn';

    if (!data || data.length < 2) {
        return <div style={{ width: W, height: H, flexShrink: 0 }} />;
    }

    const values = data.map(d => d.close);

    // 전일종가를 포함해 스케일 계산 (1D일 때 점선이 항상 보이도록)
    const showPrevLine = period === '1d' && prevClose != null;
    const allForScale = showPrevLine ? [...values, prevClose] : values;
    const min = Math.min(...allForScale);
    const max = Math.max(...allForScale);
    const range = max - min || 1;

    const gx = (i) => ((i / (values.length - 1)) * W).toFixed(1);
    const gy = (v) => (H - ((v - min) / range) * (H - 8) - 4).toFixed(1);

    const linePts = values.map((v, i) => `${gx(i)},${gy(v)}`).join(' ');
    const areaPath = [
        `M ${gx(0)},${H}`,
        ...values.map((v, i) => `L ${gx(i)},${gy(v)}`),
        `L ${W},${H} Z`,
    ].join(' ');

    const prevY = showPrevLine ? parseFloat(gy(prevClose)) : null;

    return (
        <svg width={W} height={H} style={{ display: 'block', flexShrink: 0 }}>
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.18" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* 전일종가 점선 */}
            {prevY != null && (
                <line x1={0} y1={prevY} x2={W} y2={prevY}
                    stroke="#aaa" strokeWidth={1} strokeDasharray="3 2" />
            )}
            <path d={areaPath} fill={`url(#${gradId})`} />
            <polyline points={linePts} fill="none" stroke={color} strokeWidth={1.8}
                strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
}

// ── 내 종목 즐겨찾기 미니 카드 ──────────────────────────────────
function StockMiniCard({ card, historyData, onRemove, onToggleBookmark, isBookmarked, period }) {
    const isUp = card.isUp !== false;
    const color = isUp ? '#e74c3c' : '#3498db';

    return (
        <div style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid #f0f2f5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'stretch',
        }}>
            {/* 좌측 컬러 바 */}
            <div style={{ width: 4, background: color, flexShrink: 0 }} />

            {/* 정보 영역 */}
            <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0, padding: '10px 12px', display: 'block' }}
            >
                {/* 티커 배지 + 종목명 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{
                        fontSize: 10, fontWeight: 800, color: '#fff',
                        background: color, padding: '2px 7px', borderRadius: 5,
                        letterSpacing: '0.3px', flexShrink: 0,
                    }}>{card.ticker}</span>
                    <span style={{
                        fontSize: 11, color: '#aab', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{card.title}</span>
                </div>

                {/* 가격 */}
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', lineHeight: 1, marginBottom: 4 }}>
                    {card._price || '—'}
                </div>

                {/* 등락 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: card._change ? color : '#bbb' }}>
                    {card._change
                        ? `${isUp ? '▲' : '▼'} ${card._change} (${card._percent})`
                        : '로딩 중...'}
                </div>
            </a>

            {/* 우측: 스파크라인 + 버튼 */}
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-end', justifyContent: 'space-between',
                padding: '8px 10px 8px 0',
            }}>
                <a href={card.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', lineHeight: 0 }}>
                    <Sparkline data={historyData} isUp={isUp} prevClose={card._prevClose} period={period} />
                </a>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(card.id, e); }}
                        title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 15, padding: '2px 3px', lineHeight: 1,
                            color: isBookmarked ? '#f1c40f' : '#ddd',
                        }}
                    >{isBookmarked ? '★' : '☆'}</button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(card.ticker, e); }}
                        title="종목 삭제"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 12, padding: '2px 3px', lineHeight: 1,
                            color: '#ccc',
                        }}
                    >✕</button>
                </div>
            </div>
        </div>
    );
}
