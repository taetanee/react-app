// src/components/TextClipboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

const TextClipboard = ({ refreshKey }) => {
    const [text, setText] = useState("");
    const [status, setStatus] = useState("준비됨");

    // --- 데이터 가져오기 (getContent API) ---
    // 새로고침 버튼이 없으므로, 컴포넌트 마운트 시 최초 데이터 로드 기능만 남깁니다.
    const fetchClipboardData = useCallback(async () => {
        setStatus("데이터 로딩 중...");
        try {
            const response = await axios.post(`${API_BASE_URL}/getContent`, {});
            const commonResult = response.data.result;

            if (commonResult) {
                // 텍스트는 "data" 키로 반환된다고 가정
                const newText = commonResult.data || "";
                setText(newText);
                setStatus("✅ 데이터 로드 완료");
            } else {
                setStatus("데이터 로드 실패: 응답 형식 오류");
            }
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            setStatus(`❌ 데이터 로드 실패: ${error.message}`);
        }
    }, []);

    useEffect(() => {
        fetchClipboardData();
        // 외부에서 refreshKey를 통해 강제 새로고침을 시도할 때만 다시 로드합니다.
    }, [fetchClipboardData, refreshKey]);

    // --- 텍스트 저장 (saveContent API) ---
    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSaveText = async () => {
        setStatus("텍스트 저장 중...");
        try {
            // 텍스트를 "content" 키로 전송
            await axios.post(`${API_BASE_URL}/saveContent`, { content: text });
            setStatus("✅ 텍스트 저장 성공");
        } catch (error) {
            console.error("텍스트 저장 실패:", error);
            setStatus(`❌ 텍스트 저장 실패: ${error.message}`);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>📝 텍스트 클립보드</h3>
            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="여기에 텍스트를 입력하세요. 저장 버튼을 눌러야 반영됩니다."
                style={{ width: '100%', minHeight: '150px', padding: '10px', fontSize: '16px', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                {/* 🚨 변경된 부분: 텍스트 저장 버튼만 남기고 우측 정렬 (justifyContent: 'flex-end') */}
                <button
                    onClick={handleSaveText}
                    style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    텍스트 저장
                </button>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: status.includes('성공') ? 'green' : status.includes('실패') ? 'red' : '#555' }}>
                상태: {status}
            </p>
        </div>
    );
};

export default TextClipboard;