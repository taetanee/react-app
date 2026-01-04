import React, { useEffect, useState } from "react";

export default function Main() {
    const [dust, setDust] = useState("");
    const [snp500, setSnp500] = useState({ price: "", change: "", percent: "", isUp: true });
    const [weather, setWeather] = useState(null);
    const [exchangeRate, setExchangeRate] = useState({ rate: "", change: "", percent: "", isUp: true });
    const [fearGreed, setFearGreed] = useState({ value: 0, rating: "", diff: 0, status: "UP" });
    const [vix, setVix] = useState({ price: "", change: "", percent: "", isUp: true, status: "" });

    useEffect(() => {
        const fetchAll = async () => {
            // 1. 미세먼지 (텍스트 응답)
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getMinuDustFrcstDspth");
                const text = await res.text();
                // 미세먼지는 텍스트에 에러 코드가 포함되어 있는지 확인하거나 빈 값 체크
                if (text && !text.includes("500")) setDust(text);
            } catch (e) { console.error("미세먼지 실패", e); }

            // 2. S&P 500 (JSON 응답)
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getSnp500CurrentPrice");
                const data = await res.json();
                // result_code가 500이 아닐 때만 업데이트
                if (data && data.result_code !== 500) setSnp500(data);
            } catch (e) { console.error("S&P500 실패", e); }

            // 3. 날씨
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getCurrentWeather");
                const data = await res.json();
                if (data && data.result_code !== 500) setWeather(data);
            } catch (e) { console.error("날씨 실패", e); }

            // 4. 환율
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getExchangeRateUSDToKRW");
                const data = await res.json();
                if (data && data.result_code !== 500) setExchangeRate(data);
            } catch (e) { console.error("환율 실패", e); }

            // 5. 공포탐욕지수
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getFearAndGreedIndex");
                const data = await res.json();
                if (data && data.result_code !== 500) setFearGreed(data);
            } catch (e) { console.error("공포탐욕 실패", e); }

            // 6. VIX
            try {
                const res = await fetch("http://124.53.139.229:28080/myDashboard/getVixIndex");
                const data = await res.json();
                if (data && data.result_code !== 500) setVix(data);
            } catch (e) { console.error("VIX 실패", e); }
        };

        fetchAll();
        const intervalId = setInterval(fetchAll, 10000);
        return () => clearInterval(intervalId);
    }, []);

    // [수정] 높이를 줄이고 한 줄에 하나(100%)씩 나오도록 변경
    const cardStyle = {
        flex: '1 1 100%', // 한 줄에 한 칸씩 꽉 차게
        backgroundColor: "#fff",
        padding: "10px 15px", // 상하 패딩을 15px -> 10px로 축소
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
        textAlign: "center"
    };

    const titleStyle = {
        marginTop: 0,
        fontSize: "14px", // 16px -> 14px 축소
        color: "#7f8c8d",
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "5px", // 간격 축소
        fontWeight: "600"
    };

    const valueStyle = {
        fontSize: "24px", // 28px -> 24px 축소
        fontWeight: "bold",
        margin: "5px 0 0 0" // 위 간격 축소
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>

                    {/* 서울 날씨 */}
                    <a href="https://www.google.com/search?q=%EC%98%A4%EB%8A%98%EB%82%A0%EC%94%A8" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>서울 날씨</h2>
                            {weather && weather.temperature ? (
                                <div style={{ ...valueStyle, fontSize: "16px", marginTop: "8px" }}>
                                    🌡 <span style={{ color: "#e74c3c" }}>{weather.temperature?.value ?? "0"}°C</span>
                                    <span style={{ color: "#bdc3c7", margin: "0 8px" }}>/</span>
                                    🌧 {weather.precipitation?.description ?? "정보 없음"}
                                </div>
                            ) : (
                                <p style={{ fontSize: "13px", color: "#bdc3c7", margin: "10px 0" }}>...</p>
                            )}
                        </div>
                    </a>

                    {/* 서울 미세먼지 */}
                    <a href="https://m.search.naver.com/search.naver?query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>서울 미세먼지</h2>
                            <p style={{ 
                                ...valueStyle, 
                                color: dust.includes("매우 나쁨") ? "#c0392b" : dust.includes("나쁨") ? "#e67e22" : dust.includes("보통") ? "#27ae60" : "#2980b9"
                            }}>
                                {dust || "..."}
                            </p>
                        </div>
                    </a>

                    {/* S&P 500 */}
                    <a href="https://www.google.com/search?q=snp500" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>S&P 500</h2>
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{snp500.price || "..."}</p>
                            {snp500.price && (
                                <p style={{ fontSize: "13px", fontWeight: "bold", margin: "3px 0 0 0", color: snp500.isUp ? "#e74c3c" : "#3498db" }}>
                                    {snp500.isUp ? "▲" : "▼"} {snp500.change} ({snp500.percent})
                                </p>
                            )}
                        </div>
                    </a>

                    {/* 환율 */}
                    <a href="https://www.google.com/search?q=%ED%99%98%EC%9C%A8" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>달러/원 환율</h2>
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{exchangeRate.rate ? `${exchangeRate.rate}원` : "..."}</p>
                            {exchangeRate.rate && (
                                <p style={{ fontSize: "13px", fontWeight: "bold", margin: "3px 0 0 0", color: exchangeRate.isUp ? "#e74c3c" : "#3498db" }}>
                                    {exchangeRate.isUp ? "▲" : "▼"} {exchangeRate.change}
                                </p>
                            )}
                        </div>
                    </a>

                    {/* 공포탐욕지수 - diff 추가 */}
                    <a href="https://edition.cnn.com/markets/fear-and-greed" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>공포탐욕지수</h2>
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{fearGreed.value || "0"}</p>
                            <p style={{ fontSize: "13px", fontWeight: "bold", margin: "3px 0 0 0", color: fearGreed.status === "UP" ? "#e74c3c" : "#3498db" }}>
                                {fearGreed.diff} ({fearGreed.rating})
                            </p>
                        </div>
                    </a>

                    {/* VIX */}
                    <a href="https://www.google.com/search?q=vix+index" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', flex: '1 1 100%' }}>
                        <div style={cardStyle}>
                            <h2 style={titleStyle}>VIX (변동성지수)</h2>
                            <p style={{ ...valueStyle, color: "#2c3e50" }}>{vix.price || "..."}</p>
                            {vix.price && (
                                <p style={{ fontSize: "13px", fontWeight: "bold", margin: "3px 0 0 0", color: vix.isUp ? "#e74c3c" : "#3498db" }}>
                                    {vix.isUp ? "▲" : "▼"} {vix.percent}
                                </p>
                            )}
                        </div>
                    </a>

                </div>
            </div>
        </div>
    );
}