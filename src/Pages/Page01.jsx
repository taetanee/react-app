import React, { useEffect, useState } from "react";

export default function Page01() {
    const [dust, setDust] = useState("");       // 서울 미세먼지 데이터
    const [snp500, setSnp500] = useState("");   // S&P500 현재 지수
    const [weather, setWeather] = useState(null); // 서울 날씨 정보
    const [exchangeRate, setExchangeRate] = useState(""); // 환율 정보

    useEffect(() => {
        const fetchDust = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getMinuDustFrcstDspth");
                const result = await response.text();
                setDust(result);
            } catch (error) {
                console.error("미세먼지 정보 로딩 실패", error);
            }
        };

        const fetchSnp500 = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getSnp500CurrentPrice");
                const result = await response.text();
                setSnp500(result);
            } catch (error) {
                console.error("S&P500 정보 로딩 실패", error);
            }
        };

        const fetchWeather = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getCurrentWeather");
                const result = await response.json();
                setWeather(result);
            } catch (error) {
                console.error("날씨 정보 로딩 실패", error);
            }
        };

        const fetchExchangeRate = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getExchangeRateUSDToKRW");
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
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>[서울 미세먼지]</h1>
            <h2>{dust || "불러오는 중..."}</h2>
            <hr />

            <h1>[S&P 500 현재 지수]</h1>
            <h2>{snp500 || "불러오는 중..."}</h2>
            <hr />

            <h1>[서울 현재 날씨</h1>
            {weather ? (
                <div>
                    <p>🌡 기온: {weather.temperature.value} {weather.temperature.unit}</p>
                    <p>🌧 강수: {weather.precipitation.type} ({weather.precipitation.description})</p>
                </div>
            ) : (
                <p>날씨 정보 불러오는 중...</p>
            )}
            <hr />

            <h1>[USD/KRW 환율]</h1>
            <h2>{exchangeRate ? `${exchangeRate} 원` : "불러오는 중..."}</h2>
        </div>
    );
}
