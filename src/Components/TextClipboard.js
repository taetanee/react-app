import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { message } from './Message';

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

const getErrorMsg = (error) => {
    const data = error.response?.data;
    return data?.result_msg || data?.message || error.message;
};

const TextClipboard = ({ randomWord, refreshKey }) => {
    const [text, setText] = useState("");

    const fetchClipboardData = useCallback(async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/getContent`, { randomWord });
            const commonResult = response.data.result;
            if (commonResult) {
                setText(commonResult.data || "");
            }
        } catch (error) {
            console.error("데이터 로드 실패:", getErrorMsg(error));
        }
    }, [randomWord]);

    useEffect(() => {
        fetchClipboardData();
    }, [fetchClipboardData, refreshKey]);

    const handleSaveText = async () => {
        try {
            await axios.post(`${API_BASE_URL}/saveContent`, { randomWord, content: text });
            message('저장 완료', 'success');
        } catch (error) {
            message(`저장 실패: ${getErrorMsg(error)}`, 'error');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #007bff', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>텍스트 클립보드</h3>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
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
        </div>
    );
};

export default TextClipboard;
