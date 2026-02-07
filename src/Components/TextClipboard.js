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
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>텍스트</h3>
            <textarea
                value={text}
                onChange={handleChange}
                style={{ width: '100%', minHeight: '150px', padding: '10px', fontSize: '16px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ddd' }}
            />
        </div>
    );
};

export default TextClipboard;
