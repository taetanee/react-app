import React, { useEffect, useState } from "react";

export default function Page01() {
    const [dust, setDust] = useState(""); // 서울 미세먼지
    const [snp500, setSnp500] = useState(""); // S&P 500 지수

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

        fetchDust();
        fetchSnp500();
    }, []);

    return (
        <div>
            <h1>서울 미세먼지 :</h1>
            <h2>{dust || "불러오는 중..."}</h2>

            <h1>S&P 500 현재 지수 :</h1>
            <h2>{snp500 || "불러오는 중..."}</h2>
        </div>);
}