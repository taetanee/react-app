import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { message } from "../Components/Message";

const API_BASE_URL = "http://124.53.139.229:28080/myDashboard";

export default function Main() {
    const { id: rawId } = useParams();
    const id = rawId?.replace(/^@/, '') ?? '';
    const [dust, setDust] = useState("");
    const [snp500, setSnp500] = useState({ price: "", change: "", percent: "", isUp: true });
    const [weather, setWeather] = useState(null);
    const [exchangeRate, setExchangeRate] = useState({ rate: "", change: "", percent: "", isUp: true });
    const [fearGreed, setFearGreed] = useState({ value: 0, rating: "", diff: 0, status: "UP" });
    const [vix, setVix] = useState({ price: "", change: "", percent: "", isUp: true, status: "" });

    const bookmarksKey = `dashboard_bookmarks_${id}`;
    const customStocksKey = `custom_stocks_${id}`;

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const saved = localStorage.getItem(`dashboard_bookmarks_${id}`);
            if (saved !== null) return JSON.parse(saved);
            return ['weather', 'dust', 'snp500', 'exchange', 'feargreed', 'vix'];
        } catch {
            return ['weather', 'dust', 'snp500', 'exchange', 'feargreed', 'vix'];
        }
    });

    // 개별 종목 상태
    const [customStocks, setCustomStocks] = useState(() => {
        try {
            const saved = localStorage.getItem(`custom_stocks_${id}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
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
        };

        fetchAll();
        const intervalId = setInterval(fetchAll, 10000);
        return () => clearInterval(intervalId);
    }, []);

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

    // 종목 검색 (결과만 보여줌, 바로 추가하지 않음)
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
            localStorage.setItem(customStocksKey, JSON.stringify(newStocks));

            if (data && !data.error) {
                setStockData(prev => ({ ...prev, [ticker]: data }));
            }

            // 자동 즐겨찾기 등록
            setBookmarks(prev => {
                const next = [...prev, `stock_${ticker}`];
                localStorage.setItem(bookmarksKey, JSON.stringify(next));
                return next;
            });

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
        localStorage.setItem(customStocksKey, JSON.stringify(newStocks));

        setBookmarks(prev => {
            const next = prev.filter(id => id !== `stock_${ticker}`);
            localStorage.setItem(bookmarksKey, JSON.stringify(next));
            return next;
        });

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
        setBookmarks(prev => {
            const next = prev.includes(cardId)
                ? prev.filter(id => id !== cardId)
                : [...prev, cardId];
            localStorage.setItem(bookmarksKey, JSON.stringify(next));
            return next;
        });
    };

    const cardStyle = {
        flex: '1 1 100%',
        backgroundColor: "#fff",
        padding: "10px 15px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        textAlign: "center"
    };

    const titleStyle = {
        margin: 0,
        fontSize: "14px",
        color: "#7f8c8d",
        fontWeight: "600"
    };

    const valueStyle = {
        fontSize: "24px",
        fontWeight: "bold",
        margin: "5px 0 0 0"
    };

    // 기본 카드 정의
    const staticCards = [
        {
            id: 'weather',
            title: '서울 날씨',
            link: 'https://www.google.com/search?q=%EC%98%A4%EB%8A%98%EB%82%A0%EC%94%A8',
            content: () => (
                weather && weather.temperature ? (
                    <div style={{ ...valueStyle, fontSize: "16px", marginTop: "8px" }}>
                        <span style={{ color: "#e74c3c" }}>{weather.temperature?.value ?? "0"}°C</span>
                        <span style={{ color: "#bdc3c7", margin: "0 8px" }}>/</span>
                        {weather.precipitation?.description ?? "정보 없음"}
                    </div>
                ) : <p style={{ fontSize: "13px", color: "#bdc3c7", margin: "10px 0" }}>...</p>
            )
        },
        {
            id: 'dust',
            title: '서울 미세먼지',
            link: 'https://m.search.naver.com/search.naver?query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80',
            content: () => (
                <p style={{
                    ...valueStyle,
                    color: dust.includes("매우 나쁨") ? "#c0392b" : dust.includes("나쁨") ? "#e67e22" : dust.includes("보통") ? "#27ae60" : "#2980b9"
                }}>
                    {dust || "..."}
                </p>
            )
        },
        {
            id: 'snp500',
            title: 'S&P 500',
            link: 'https://www.google.com/search?q=snp500',
            content: () => (
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                    <p style={{ ...valueStyle, color: "#2c3e50" }}>{snp500.price || "..."}</p>
                    {snp500.price && (
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: snp500.isUp ? "#e74c3c" : "#3498db" }}>
                            {snp500.isUp ? "▲" : "▼"} {snp500.change} ({snp500.percent})
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'exchange',
            title: '달러/원 환율',
            link: 'https://kr.investing.com/currencies/usd-krw',
            content: () => (
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                    <p style={{ ...valueStyle, color: "#2c3e50" }}>{exchangeRate.rate ? `${exchangeRate.rate}원` : "..."}</p>
                    {exchangeRate.rate && (
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: exchangeRate.isUp ? "#e74c3c" : "#3498db" }}>
                            {exchangeRate.isUp ? "▲" : "▼"} {exchangeRate.change} ({exchangeRate.percent})
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'feargreed',
            title: '공포탐욕지수',
            link: 'https://edition.cnn.com/markets/fear-and-greed',
            content: () => (
                <>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                        <p style={{ ...valueStyle, color: "#2c3e50" }}>{fearGreed.value || "0"}</p>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: fearGreed.status === "UP" ? "#e74c3c" : "#3498db" }}>
                            {fearGreed.status === "UP" ? "▲" : "▼"} {Math.abs(fearGreed.diff)}
                        </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#95a5a6", margin: "3px 0 0 0" }}>
                        {fearGreed.rating}
                    </p>
                </>
            )
        },
        {
            id: 'vix',
            title: 'VIX (변동성지수)',
            link: 'https://www.google.com/search?q=vix+index',
            content: () => (
                <>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                        <p style={{ ...valueStyle, color: "#2c3e50" }}>{vix.price || "..."}</p>
                        {vix.price && (
                            <span style={{ fontSize: "13px", fontWeight: "bold", color: vix.isUp ? "#e74c3c" : "#3498db" }}>
                                {vix.isUp ? "▲" : "▼"} {vix.change} ({vix.percent})
                            </span>
                        )}
                    </div>
                    {vix.status && (
                        <p style={{ fontSize: "13px", color: "#95a5a6", margin: "3px 0 0 0" }}>
                            {vix.status}
                        </p>
                    )}
                </>
            )
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
            link: `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`,
            content: () => (
                <>
                    <p style={{ ...valueStyle, color: "#2c3e50" }}>
                        {data.price || "..."}
                        {data.currency && (
                            <span style={{ fontSize: "12px", fontWeight: "normal", color: "#95a5a6", marginLeft: "5px" }}>
                                {data.currency}
                            </span>
                        )}
                    </p>
                    {data.price && data.price !== "0.00" && (
                        <p style={{ fontSize: "13px", fontWeight: "bold", margin: "3px 0 0 0", color: data.isUp ? "#e74c3c" : "#3498db" }}>
                            {data.isUp ? "▲" : "▼"} {data.change} ({data.percent})
                        </p>
                    )}
                </>
            )
        };
    });

    // 기본 카드: 즐겨찾기 분류
    const bookmarkedStatic = staticCards.filter(c => bookmarks.includes(c.id));
    const nonBookmarkedStatic = staticCards.filter(c => !bookmarks.includes(c.id));

    // 종목 카드: 즐겨찾기 분류
    const bookmarkedStock = stockCards.filter(c => bookmarks.includes(c.id));
    const nonBookmarkedStock = stockCards.filter(c => !bookmarks.includes(c.id));

    const renderCard = (card, dimmed = false) => (
        <div key={card.id} style={{ flex: '1 1 100%', opacity: dimmed ? 0.45 : 1, transition: 'opacity 0.3s' }}>
            <a href={card.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '5px' }}>
                        <h2 style={titleStyle}>
                            {card.title}
                            {card.isStock && (
                                <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px', fontWeight: 'normal' }}>
                                    {card.ticker}
                                </span>
                            )}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {card.isStock && (
                                <button
                                    onClick={(e) => handleRemoveStock(card.ticker, e)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        padding: '0 3px',
                                        color: '#dc3545',
                                    }}
                                    title="종목 삭제"
                                >
                                    ✕
                                </button>
                            )}
                            <button
                                onClick={(e) => toggleBookmark(card.id, e)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    padding: '0 5px',
                                    color: bookmarks.includes(card.id) ? '#f1c40f' : '#ccc',
                                    transition: 'color 0.2s',
                                }}
                                title={bookmarks.includes(card.id) ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                            >
                                {bookmarks.includes(card.id) ? '\u2605' : '\u2606'}
                            </button>
                        </div>
                    </div>
                    {card.content()}
                </div>
            </a>
        </div>
    );

    // 종목 검색 카드 렌더링
    const renderSearchCard = () => (
        <div style={{ flex: '1 1 100%' }}>
            <div style={cardStyle}>
                <h2 style={{ ...titleStyle, borderBottom: '1px solid #f0f0f0', paddingBottom: '5px' }}>
                    종목 검색
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchStock()}
                        placeholder="종목명 또는 코드 (예: 삼성전자, AAPL)"
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '13px',
                            outline: 'none',
                        }}
                    />
                    <button
                        onClick={handleSearchStock}
                        disabled={searching}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: searching ? '#aaa' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: searching ? 'default' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {searching ? '검색중...' : '검색'}
                    </button>
                </div>

                {/* 검색 결과 리스트 */}
                {searchResults.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', textAlign: 'left' }}>
                        {searchResults.map((item, index) => {
                            const alreadyAdded = customStocks.includes(item.ticker);
                            const isAdding = addingTicker === item.ticker;
                            return (
                                <li
                                    key={item.ticker}
                                    onClick={() => !alreadyAdded && !isAdding && handleSelectStock(item.ticker, item.name)}
                                    style={{
                                        padding: '10px 12px',
                                        cursor: alreadyAdded ? 'default' : 'pointer',
                                        backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                                        borderBottom: '1px solid #f0f0f0',
                                        borderRadius: index === 0 ? '6px 6px 0 0' : index === searchResults.length - 1 ? '0 0 6px 6px' : '0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        opacity: alreadyAdded ? 0.5 : 1,
                                        transition: 'background-color 0.15s',
                                    }}
                                    onMouseEnter={(e) => { if (!alreadyAdded) e.currentTarget.style.backgroundColor = '#e9f5ff'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fafafa' : '#fff'; }}
                                >
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                            {item.ticker}
                                            <span style={{ margin: '0 6px', color: '#ddd' }}>|</span>
                                            {item.exchange}
                                            {item.type === 'ETF' && <span style={{ marginLeft: '6px', color: '#e67e22', fontWeight: 'bold' }}>ETF</span>}
                                            {item.type === 'INDEX' && <span style={{ marginLeft: '6px', color: '#8e44ad', fontWeight: 'bold' }}>INDEX</span>}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: '10px', flexShrink: 0 }}>
                                        {alreadyAdded ? (
                                            <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 'bold' }}>추가됨</span>
                                        ) : isAdding ? (
                                            <span style={{ fontSize: '12px', color: '#007bff' }}>추가중...</span>
                                        ) : (
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#007bff',
                                                fontWeight: 'bold',
                                                padding: '4px 10px',
                                                border: '1px solid #007bff',
                                                borderRadius: '4px',
                                            }}>
                                                + 추가
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );

    const sectionTitleStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: '#7f8c8d',
        margin: '0 0 10px 0',
        paddingBottom: '6px',
        borderBottom: '2px solid #ddd',
    };

    return (
        <div style={{
            padding: "15px",
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            backgroundColor: "#ebf0f1",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            <div style={{ width: "100%", maxWidth: "500px" }}>

                {/* 상단: 기본 대시보드 */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={sectionTitleStyle}>대시보드</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {bookmarkedStatic.map(card => renderCard(card, false))}

                        {nonBookmarkedStatic.length > 0 && bookmarkedStatic.length > 0 && (
                            <div style={{
                                width: '100%',
                                textAlign: 'center',
                                padding: '8px 0',
                                color: '#aaa',
                                fontSize: '12px',
                                letterSpacing: '2px'
                            }}>
                                ── 즐겨찾기 미등록 ──
                            </div>
                        )}

                        {nonBookmarkedStatic.map(card => renderCard(card, true))}
                    </div>
                </div>

                {/* 하단: 종목 */}
                <div>
                    <h3 style={sectionTitleStyle}>내 종목</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {renderSearchCard()}

                        {bookmarkedStock.map(card => renderCard(card, false))}

                        {nonBookmarkedStock.length > 0 && bookmarkedStock.length > 0 && (
                            <div style={{
                                width: '100%',
                                textAlign: 'center',
                                padding: '8px 0',
                                color: '#aaa',
                                fontSize: '12px',
                                letterSpacing: '2px'
                            }}>
                                ── 즐겨찾기 미등록 ──
                            </div>
                        )}

                        {nonBookmarkedStock.map(card => renderCard(card, true))}
                    </div>
                </div>

            </div>
        </div>
    );
}
