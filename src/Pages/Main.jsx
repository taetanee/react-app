import React, { useEffect, useState } from "react";

export default function Main() {
    const [dust, setDust] = useState("");
    // 1. snp500 상태를 객체 구조로 변경
    const [snp500, setSnp500] = useState({ price: "", change: "", percent: "", isUp: true });
    const [weather, setWeather] = useState(null);
    const [exchangeRate, setExchangeRate] = useState({ rate: "", change: "", percent: "", isUp: true });

    useEffect(() => {
        const fetchDust = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/myDashboard/getMinuDustFrcstDspth");
                const result = await response.text();
                setDust(result);
            } catch (error) {
                console.error("미세먼지 정보 로딩 실패", error);
            }
        };

        const fetchSnp500 = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/myDashboard/getSnp500CurrentPrice");
                // 2. .json()으로 파싱
                const result = await response.json();
                setSnp500(result);
            } catch (error) {
                console.error("S&P500 정보 로딩 실패", error);
            }
        };

        const fetchWeather = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/myDashboard/getCurrentWeather");
                const result = await response.json();
                setWeather(result);
            } catch (error) {
                console.error("날씨 정보 로딩 실패", error);
            }
        };

        const fetchExchangeRate = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/myDashboard/getExchangeRateUSDToKRW");
                const result = await response.json();
                setExchangeRate(result);
            } catch (error) {
                console.error("환율 정보 로딩 실패", error);
            }
        };

        fetchDust();
        fetchSnp500();
        fetchWeather();
        fetchExchangeRate();

        const intervalId = setInterval(() => {
            fetchSnp500();
            fetchExchangeRate();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    // 스타일 정의
    const cardStyle = {
        flex: '1 1 220px',
        backgroundColor: "#fff",
        padding: "15px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        textAlign: "center"
    };

    const titleStyle = {
        marginTop: 0,
        fontSize: "16px",
        color: "#7f8c8d",
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "8px",
        fontWeight: "600"
    };

    const valueStyle = {
        fontSize: "28px",
        fontWeight: "bold",
        margin: "10px 0 0 0"
    };

    return (
        <div style={{
            padding: "20px",
            fontFamily: "'Segoe UI', Roboto, sans-serif",
            backgroundColor: "#ebf0f1",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }}>
            <div style={{ width: "100%", maxWidth: "900px" }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '15px',
                    justifyContent: 'center'
                }}>

                    {/* 서울 날씨 */}
                    <a href="https://www.google.com/search?q=%EC%98%A4%EB%8A%98%EB%82%A0%EC%94%A8" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 220px' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>서울 날씨</h2>
                            {weather ? (
                                <div style={{ marginTop: "10px", fontSize: "14px", textAlign: "left", display: "inline-block" }}>
                                    <p style={{ margin: "3px 0" }}>🌡 기온: <span style={{ color: "#e74c3c", fontWeight: "bold" }}>{weather.temperature.value}°C</span></p>
                                    <p style={{ margin: "3px 0" }}>🌧 상태: {weather.precipitation.description}</p>
                                </div>
                            ) : (
                                <p style={{ ...valueStyle, fontSize: "14px", color: "#bdc3c7" }}>로딩 중...</p>
                            )}
                        </div>
                    </a>

                    {/* 서울 미세먼지 */}
                    <a href="https://m.search.naver.com/search.naver?query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 220px' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>서울 미세먼지</h2>
                            <p style={{ ...valueStyle, color: "#e67e22" }}>{dust || "..."}</p>
                        </div>
                    </a>

                    {/* S&P 500 */}
                    <a href="https://www.google.com/search?q=snp500" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 220px' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>S&P 500</h2>
                            {/* 3. S&P 500 출력 구조 변경 */}
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{snp500.price || "..."}</p>
                            {snp500.price && (
                                <p style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    margin: "5px 0 0 0",
                                    color: snp500.isUp ? "#e74c3c" : "#3498db" 
                                }}>
                                    {snp500.isUp ? "▲" : "▼"} {snp500.change} ({snp500.percent})
                                </p>
                            )}
                        </div>
                    </a>

                    {/* USD/KRW 환율 */}
                    <a href="https://kr.investing.com/currencies/usd-krw" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 220px' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>USD/KRW 환율</h2>
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{exchangeRate.rate ? `${exchangeRate.rate}원` : "..."}</p>
                            {exchangeRate.rate && (
                                <p style={{
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    margin: "5px 0 0 0",
                                    color: exchangeRate.isUp ? "#e74c3c" : "#3498db"
                                }}>
                                    {exchangeRate.isUp ? "▲" : "▼"} {exchangeRate.change} ({exchangeRate.percent})
                                </p>
                            )}
                        </div>
                    </a>

                </div>
            </div>
        </div>
    );
}