import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TextClipboard from "../Components/TextClipboard";
import FileClipboard from "../Components/FileClipboard";
import { message } from "../Components/Message";

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

    const handleShareURL = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            message('URL이 복사되었습니다.', 'success');
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                    <span style={{ fontSize: '13px', color: '#555', fontFamily: 'monospace' }}>{randomWord}</span>
                    <button
                        onClick={handleShareURL}
                        style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        URL 공유
                    </button>
                </div>
            </div>

            <TextClipboard randomWord={randomWord} />

            <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

            <FileClipboard randomWord={randomWord} />
        </div>
    );
}