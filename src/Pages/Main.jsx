import React, { useEffect, useState } from "react";

export default function Main() {
    const [dust, setDust] = useState("");       // 서울 미세먼지 데이터
    const [snp500, setSnp500] = useState("");   // S&P500 현재 지수
    const [weather, setWeather] = useState(null); // 서울 날씨 정보
    const [exchangeRate, setExchangeRate] = useState(""); // 환율 정보

    useEffect(() => {
        const fetchDust = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/weather/getMinuDustFrcstDspth");
                const result = await response.text();
                setDust(result);
            } catch (error) {
                console.error("미세먼지 정보 로딩 실패", error);
            }
        };

        const fetchSnp500 = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/weather/getSnp500CurrentPrice");
                const result = await response.text();
                setSnp500(result);
            } catch (error) {
                console.error("S&P500 정보 로딩 실패", error);
            }
        };

        const fetchWeather = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/weather/getCurrentWeather");
                const result = await response.json();
                setWeather(result);
            } catch (error) {
                console.error("날씨 정보 로딩 실패", error);
            }
        };

        const fetchExchangeRate = async () => {
            try {
                const response = await fetch("http://124.53.139.229:28080/weather/getExchangeRateUSDToKRW");
                const result = await response.text();  // 서버가 double/string 반환 시
                setExchangeRate(result);
            } catch (error) {
                console.error("환율 정보 로딩 실패", error);
            }
        };

        // 최초 호출
        fetchDust();
        fetchSnp500();
        fetchWeather();
        fetchExchangeRate();

        // S&P500은 실시간 갱신
        const intervalId = setInterval(() => {
            fetchSnp500();
            fetchExchangeRate();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{
            padding: "30px",
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#f4f7f6", // 전체 배경색
            minHeight: "100vh"
        }}>
            <h1 style={{
                textAlign: "center",
                color: "#1f3a93",
                marginBottom: "30px",
                fontSize: "28px"
            }}>실시간 주요 정보 대시보드</h1>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap', // 화면이 좁아지면 줄 바꿈
                gap: '20px', // 카드 간격
                justifyContent: 'center'
            }}>

                {/* 1. 서울 미세먼지 카드 */}
                <div style={{
                    flex: '1 1 300px', // 유연한 너비 설정
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "10px", // 둥근 모서리
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // 은은한 그림자
                }}>
                    <h2 style={{
                        marginTop: 0,
                        color: "#546e7a",
                        borderBottom: "2px solid #e0e0e0",
                        paddingBottom: "10px"
                    }}>[서울 미세먼지]</h2>
                    <p style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        color: "#d35400" // 미세먼지 강조색
                    }}>{dust || "불러오는 중..."}</p>
                </div>

                {/* 2. S&P 500 현재 지수 카드 */}
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}>
                    <h2 style={{
                        marginTop: 0,
                        color: "#546e7a",
                        borderBottom: "2px solid #e0e0e0",
                        paddingBottom: "10px"
                    }}>[S&P 500 현재 지수]</h2>
                    <p style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        color: "#27ae60" // 주식 지수 강조색 (상승/긍정)
                    }}>{snp500 || "불러오는 중..."}</p>
                </div>

                {/* 3. 서울 현재 날씨 카드 */}
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}>
                    <h2 style={{
                        marginTop: 0,
                        color: "#546e7a",
                        borderBottom: "2px solid #e0e0e0",
                        paddingBottom: "10px"
                    }}>[서울 현재 날씨]</h2>
                    {weather ? (
                        <div style={{ fontSize: "18px" }}>
                            <p style={{ marginBottom: "10px" }}>
                                <span style={{ marginRight: "10px", fontSize: "24px" }}>🌡</span>
                                **기온:** <span style={{ fontWeight: "bold", color: "#e74c3c" }}>{weather.temperature.value} {weather.temperature.unit}</span>
                            </p>
                            <p>
                                <span style={{ marginRight: "10px", fontSize: "24px" }}>🌧</span>
                                **강수:** {weather.precipitation.type} (<span style={{ fontStyle: "italic" }}>{weather.precipitation.description}</span>)
                            </p>
                        </div>
                    ) : (
                        <p style={{ color: "#7f8c8d" }}>날씨 정보 불러오는 중...</p>
                    )}
                </div>

                {/* 4. USD/KRW 환율 카드 */}
                <div style={{
                    flex: '1 1 300px',
                    backgroundColor: "#fff",
                    padding: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                }}>
                    <h2 style={{
                        marginTop: 0,
                        color: "#546e7a",
                        borderBottom: "2px solid #e0e0e0",
                        paddingBottom: "10px"
                    }}>[USD/KRW 환율]</h2>
                    <p style={{
                        fontSize: "36px",
                        fontWeight: "bold",
                        color: "#3498db" // 환율 강조색
                    }}>{exchangeRate ? `${exchangeRate} 원` : "불러오는 중..."}</p>
                </div>

            </div>
        </div>
    );
}
