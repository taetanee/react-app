import React, { useEffect, useState } from "react";

export default function Page02() {
    const [uuid, setUuid] = useState(""); // uuid 하나를 문자열로 저장

    useEffect(() => {
        const fetchWord = async () => {
            try {
                const response = await fetch("http://localhost:18080/test/getUuid");
                const result = await response.text(); // 문자열로 응답 받는 경우
                console.log("받은 UUID:", result);
                setUuid(result); // 상태에 저장
            } catch (error) {
                console.error("에러 발생:", error);
            }
        };

        fetchWord();
    }, []);

    return (
        <div>
            <h1>데이터 가져오기2</h1>
            <h2>받은 UUID: {uuid}</h2>
        </div>
    );
}