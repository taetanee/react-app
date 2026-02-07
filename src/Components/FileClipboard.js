import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { message } from './Message';

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

const getErrorMsg = (error) => {
    const data = error.response?.data;
    return data?.result_msg || data?.message || error.message;
};

const FileClipboard = ({ randomWord }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchFileList = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fileList`, {
                params: { randomWord }
            });
            const result = response.data.result ?? response.data ?? [];
            const files = Array.isArray(result)
                ? result.map(item =>
                    typeof item === 'string' ? item : (item.fileName || item.name || String(item))
                )
                : [];
            setFileList(files);
        } catch (error) {
            message(`파일 목록 로드 실패: ${getErrorMsg(error)}`, 'error');
        }
    }, [randomWord]);

    useEffect(() => {
        fetchFileList();
    }, [fetchFileList]);

    const handleUpload = async () => {
        const files = fileInputRef.current?.files;
        if (!files || files.length === 0) {
            message('파일을 선택해주세요.', 'info');
            return;
        }

        setUploading(true);

        try {
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);
                formData.append("randomWord", randomWord);
                await axios.post(`${API_BASE_URL}/upload`, formData);
            }
            message(`${files.length}개 파일 업로드 성공`, 'success');
            fileInputRef.current.value = "";
            fetchFileList();
        } catch (error) {
            message(`업로드 실패: ${getErrorMsg(error)}`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/download`, {
                params: { randomWord, fileName },
                responseType: 'blob'
            });
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            message(`${fileName} 다운로드 완료`, 'success');
        } catch (error) {
            message(`다운로드 실패: ${getErrorMsg(error)}`, 'error');
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #28a745', borderRadius: '8px', marginTop: '20px' }}>

            {/* 업로드 영역 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>파일 업로드</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        style={{ flex: 1 }}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: uploading ? '#aaa' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {uploading ? '업로드 중...' : '업로드'}
                    </button>
                </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

            {/* 다운로드 영역 */}
            <div>
                <h3 style={{ margin: '0 0 10px 0' }}>파일 다운로드</h3>
                {fileList.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {fileList.map((fileName, index) => (
                            <li key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                                borderRadius: '4px',
                                marginBottom: '4px'
                            }}>
                                <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px' }}>
                                    {fileName}
                                </span>
                                <button
                                    onClick={() => handleDownload(fileName)}
                                    style={{
                                        padding: '4px 12px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    다운로드
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>업로드된 파일이 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default FileClipboard;
