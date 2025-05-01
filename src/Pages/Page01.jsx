import React, { useEffect, useState } from "react";

export default function Page01() {
    const [dust, setDust] = useState("");      // 서울 미세먼지 데이터
    const [snp500, setSnp500] = useState("");    // S&P500 현재 지수

    useEffect(() => {
        // 미세먼지 데이터를 가져오는 함수
        const fetchDust = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getMinuDustFrcstDspth");
                const result = await response.text(); // 문자열 응답
                setDust(result);
            } catch (error) {
                console.error("미세먼지 정보 로딩 실패", error);
            }
        };

        // S&P 500 데이터를 가져오는 함수
        const fetchSnp500 = async () => {
            try {
                const response = await fetch("http://localhost:18080/weather/getSnp500CurrentPrice");
                const result = await response.text(); // 문자열 응답
                setSnp500(result);
            } catch (error) {
                console.error("S&P500 정보 로딩 실패", error);
            }
        };

        // 최초 호출
        fetchDust();
        fetchSnp500();

        // 10초마다 주기적으로 업데이트 (10000ms)
        const intervalId = setInterval(() => {
            fetchDust();
            fetchSnp500();
        }, 1000);

        // 컴포넌트 unmount시 타이머 정리
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <h1>서울 미세먼지 :</h1>
            <h2>{dust || "불러오는 중..."}</h2>
            <hr />

            <h1>S&P 500 현재 지수 :</h1>
            <h2>{snp500 || "불러오는 중..."}</h2>
        </div>
    );
}