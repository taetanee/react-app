import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TextClipboard from "../Components/TextClipboard";
import DummyFileFeature from "../Components/DummyFileFeature";

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

export default function Page01() {
    const { randomWord } = useParams();
    const navigate = useNavigate();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!randomWord) {
            // randomWord가 없으면 서버에서 생성 후 해당 URL로 리다이렉트
            axios.post(`${API_BASE_URL}/getRandomWord`)
                .then((response) => {
                    const newWord = response.data.result;
                    navigate(`/page01/${newWord}`, { replace: true });
                })
                .catch((error) => {
                    console.error("randomWord 생성 실패:", error);
                });
        } else {
            setIsReady(true);
        }
    }, [randomWord, navigate]);

    if (!isReady) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>클립보드 준비 중...</div>;
    }

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            {/* 1. 텍스트 클립보드 */}
            <TextClipboard randomWord={randomWord} />

            <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

            {/* 2. 더미 파일 기능 */}
            <DummyFileFeature />

        </div>
    );
}