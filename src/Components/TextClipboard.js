import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { message } from './Message';

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

const getErrorMsg = (error) => {
    const data = error.response?.data;
    return data?.result_msg || data?.message || error.message;
};

const TextClipboard = ({ randomWord, refreshKey }) => {
    const [text, setText] = useState("");
    const [loaded, setLoaded] = useState(false);
    const timerRef = useRef(null);

    const fetchClipboardData = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/getContent`, { randomWord });
            const commonResult = response.data.result;
            if (commonResult) {
                setText(commonResult.data || "");
            }
        } catch (error) {
            console.error("데이터 로드 실패:", getErrorMsg(error));
        } finally {
            setLoaded(true);
        }
    }, [randomWord]);

    useEffect(() => {
        fetchClipboardData();
    }, [fetchClipboardData, refreshKey]);

    const saveText = useCallback(async (content) => {
        try {
            await axios.post(`${API_BASE_URL}/saveContent`, { randomWord, content });
            message('저장 완료', 'success');
        } catch (error) {
            message(`저장 실패: ${getErrorMsg(error)}`, 'error');
        }
    }, [randomWord]);

    const handleChange = (e) => {
        const value = e.target.value;
        setText(value);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            saveText(value);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    if (!loaded) return null;

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>텍스트</h3>
            </div>
            <textarea
                value={text}
                onChange={handleChange}
                placeholder="여기에 텍스트를 입력하세요. 같은 URL로 접속하면 언제든 확인할 수 있습니다."
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
