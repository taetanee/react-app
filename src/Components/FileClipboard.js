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

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

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

    const handleDelete = async (fileName) => {
        try {
            await axios.delete(`${API_BASE_URL}/deleteFile`, {
                params: { randomWord, fileName }
            });
            message(`${fileName} 삭제 완료`, 'success');
            fetchFileList();
        } catch (error) {
            message(`삭제 실패: ${getErrorMsg(error)}`, 'error');
        }
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#2c3e50' }}>파일</h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        padding: '7px 16px',
                        backgroundColor: uploading ? '#aaa' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                    }}
                >
                    {uploading ? '업로드 중...' : '+ 파일 추가'}
                </button>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* 파일 목록 또는 빈 상태 */}
            {fileList.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {fileList.map((fileName, index) => (
                        <li key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px 12px',
                            backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                            borderRadius: '6px',
                            marginBottom: '4px'
                        }}>
                            <span style={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '10px' }}>
                                {fileName}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    onClick={() => handleDownload(fileName)}
                                    style={{
                                        padding: '5px 12px', backgroundColor: '#007bff', color: 'white',
                                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'
                                    }}
                                >
                                    다운로드
                                </button>
                                <button
                                    onClick={() => handleDelete(fileName)}
                                    style={{
                                        padding: '5px 12px', backgroundColor: '#dc3545', color: 'white',
                                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'
                                    }}
                                >
                                    삭제
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div style={{
                    padding: '30px 20px',
                    textAlign: 'center',
                    color: '#bbb',
                    border: '2px dashed #e0e0e0',
                    borderRadius: '8px',
                }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>
                        업로드된 파일이 없습니다
                    </p>
                    <p style={{ margin: 0, fontSize: '12px' }}>
                        위의 "파일 추가" 버튼으로 파일을 업로드하세요
                    </p>
                </div>
            )}
        </div>
    );
};

export default FileClipboard;
