import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { message } from './Message';

const API_BASE_URL = "https://api.mypad.kr/onlineClipboard";
const WS_BASE_URL = "wss://api.mypad.kr/ws/clipboard";

const RECONNECT_DELAY = 3000;

const TextClipboard = ({ randomWord }) => {
    const [text, setText] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef(null);
    const timerRef = useRef(null);
    const reconnectRef = useRef(null);
    const unmountedRef = useRef(false);

    // 초기 텍스트 REST로 로드
    useEffect(() => {
        axios.post(`${API_BASE_URL}/getContent`, { randomWord })
            .then(res => {
                const result = res.data.result;
                if (result) setText(result.data || "");
            })
            .catch(err => console.error("텍스트 초기 로드 실패:", err))
            .finally(() => setLoaded(true));
    }, [randomWord]);

    // WebSocket 연결 (자동 재연결 포함)
    useEffect(() => {
        unmountedRef.current = false;

        const connect = () => {
            if (unmountedRef.current) return;

            const ws = new WebSocket(`${WS_BASE_URL}?randomWord=${encodeURIComponent(randomWord)}`);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                if (reconnectRef.current) {
                    clearTimeout(reconnectRef.current);
                    reconnectRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "TEXT_UPDATE") {
                        setText(data.content);
                    }
                } catch (e) {}
            };

            ws.onclose = () => {
                setConnected(false);
                if (!unmountedRef.current) {
                    reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
                }
            };

            ws.onerror = () => {
                ws.close();
            };
        };

        connect();

        return () => {
            unmountedRef.current = true;
            if (timerRef.current) clearTimeout(timerRef.current);
            if (reconnectRef.current) clearTimeout(reconnectRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [randomWord]);

    const handleCopy = () => {
        if (!text) {
            message("복사할 텍스트가 없습니다.", "info");
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => message("텍스트가 복사되었습니다.", "success"))
            .catch(() => message("복사에 실패했습니다.", "error"));
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setText(value);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "TEXT_UPDATE", content: value }));
            }
        }, 300);
    };

    if (!loaded) return null;

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>텍스트</h3>
                    <span style={{
                        fontSize: '11px',
                        color: connected ? '#27ae60' : '#e74c3c',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <span style={{
                            width: '7px', height: '7px', borderRadius: '50%',
                            backgroundColor: connected ? '#27ae60' : '#e74c3c',
                            display: 'inline-block',
                        }} />
                        {connected ? '실시간 연결됨' : '연결 중...'}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    style={{
                        padding: '5px 12px',
                        fontSize: '13px',
                        backgroundColor: '#3498db',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    텍스트 복사하기
                </button>
            </div>
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="텍스트를 입력하세요"
                style={{
                    width: '100%',
                    minHeight: '150px',
                    padding: '12px',
                    fontSize: '15px',
                    boxSizing: 'border-box',
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    outline: 'none',
                    resize: 'vertical',
                    lineHeight: '1.6',
                }}
            />
        </div>
    );
};

export default TextClipboard;
