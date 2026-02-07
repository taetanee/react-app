// src/components/TextClipboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

const TextClipboard = ({ randomWord, refreshKey }) => {
    const [text, setText] = useState("");
    const [status, setStatus] = useState("준비됨");

    const fetchClipboardData = useCallback(async () => {
        setStatus("데이터 로딩 중...");
        try {
            const response = await axios.post(`${API_BASE_URL}/getContent`, { randomWord });
            const commonResult = response.data.result;

            if (commonResult) {
                const newText = commonResult.data || "";
                setText(newText);
                setStatus("데이터 로드 완료");
            } else {
                setStatus("데이터 로드 실패: 응답 형식 오류");
            }
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            setStatus(`데이터 로드 실패: ${error.message}`);
        }
    }, [randomWord]);

    useEffect(() => {
        fetchClipboardData();
    }, [fetchClipboardData, refreshKey]);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSaveText = async () => {
        setStatus("텍스트 저장 중...");
        try {
            await axios.post(`${API_BASE_URL}/saveContent`, { randomWord, content: text });
            setStatus("텍스트 저장 성공");
        } catch (error) {
            console.error("텍스트 저장 실패:", error);
            setStatus(`텍스트 저장 실패: ${error.message}`);
        }
    };

    const handleShareURL = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setStatus("URL 복사 완료");
        });
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>텍스트 클립보드</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#888', fontFamily: 'monospace' }}>{randomWord}</span>
                    <button
                        onClick={handleShareURL}
                        style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        URL 공유
                    </button>
                </div>
            </div>
            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="여기에 텍스트를 입력하세요. 저장 버튼을 눌러야 반영됩니다."
                style={{ width: '100%', minHeight: '150px', padding: '10px', fontSize: '16px', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                    onClick={handleSaveText}
                    style={{ padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    텍스트 저장
                </button>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: status.includes('성공') || status.includes('완료') ? 'green' : status.includes('실패') ? 'red' : '#555' }}>
                상태: {status}
            </p>
        </div>
    );
};

export default TextClipboard;