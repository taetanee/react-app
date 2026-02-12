import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useNavigate, Outlet } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";
import Page03 from "../Pages/Page03";
import { generateWordId, validateWordId } from "../utils/wordGenerator";
import { message } from "./Message";
import axios from "axios";

const API_BASE_URL = "http://124.53.139.229:28080/onlineClipboard";

function RootRedirect() {
    return <Navigate to={`/${generateWordId()}`} replace />;
}

function Layout() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [newId, setNewId] = useState(id);
    const [migrating, setMigrating] = useState(false);

    const navLinkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: isActive ? '#007bff' : '#333',
        fontWeight: isActive ? 'bold' : 'normal',
        padding: '8px 15px',
        margin: '0 5px',
        borderRadius: '4px',
        transition: 'all 0.3s ease-in-out',
        backgroundColor: isActive ? '#e9f5ff' : 'transparent',
    });

    const handleCopyURL = () => {
        const baseUrl = `${window.location.origin}/${id}`;
        navigator.clipboard.writeText(baseUrl).then(() => {
            message('URL이 복사되었습니다.', 'success');
        }).catch(() => {
            message('URL 복사에 실패했습니다.', 'error');
        });
    };

    const handleStartEdit = () => {
        setNewId(id);
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setNewId(id);
    };

    const handleConfirmEdit = async () => {
        const trimmed = newId.trim().toLowerCase();
        if (trimmed === id) {
            setEditing(false);
            return;
        }
        if (!trimmed) {
            message('ID를 입력해주세요.', 'error');
            return;
        }
        if (!validateWordId(trimmed)) {
            message('영문 소문자, 숫자, 하이픈만 사용 가능합니다. (2~30자)', 'error');
            return;
        }

        setMigrating(true);
        try {
            await axios.post(`${API_BASE_URL}/migrateData`, {
                oldRandomWord: id,
                newRandomWord: trimmed,
            });
            message('URL이 변경되었습니다.', 'success');
            setEditing(false);
            // 현재 하위 경로 유지하면서 새 ID로 이동
            const subPath = window.location.pathname.replace(`/${id}`, '');
            navigate(`/${trimmed}${subPath}`, { replace: true });
        } catch (error) {
            const msg = error.response?.data?.result_msg || error.response?.data?.message || error.message;
            message(`URL 변경 실패: ${msg}`, 'error');
        } finally {
            setMigrating(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleConfirmEdit();
        if (e.key === 'Escape') handleCancelEdit();
    };

    return (
        <>
            <nav style={{
                padding: '10px 0',
                backgroundColor: '#f8f8f8',
                borderBottom: '2px solid #eee',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2px'
            }}>
                <NavLink style={navLinkStyle} to={`/${id}`} end>
                    나만의 요약
                </NavLink>
                <NavLink style={navLinkStyle} to={`/${id}/clipboard`}>
                    나만의 온라인 클립보드
                </NavLink>
                <NavLink style={navLinkStyle} to={`/${id}/openai`}>
                    오픈AI
                </NavLink>
                <NavLink style={navLinkStyle} to={`/${id}/portfolio`}>
                    포트폴리오
                </NavLink>
                <div style={{
                    marginLeft: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    {editing ? (
                        <>
                            <input
                                type="text"
                                value={newId}
                                onChange={(e) => setNewId(e.target.value.toLowerCase())}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                disabled={migrating}
                                style={{
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    border: '1px solid #007bff',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    width: '120px',
                                }}
                            />
                            <button
                                onClick={handleConfirmEdit}
                                disabled={migrating}
                                style={{
                                    padding: '5px 8px',
                                    backgroundColor: migrating ? '#95a5a6' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: migrating ? 'default' : 'pointer',
                                    fontSize: '11px',
                                }}
                            >
                                {migrating ? '...' : '확인'}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={migrating}
                                style={{
                                    padding: '5px 8px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                }}
                            >
                                취소
                            </button>
                        </>
                    ) : (
                        <>
                            <span
                                onClick={handleStartEdit}
                                style={{
                                    fontSize: '12px',
                                    fontFamily: 'monospace',
                                    color: '#555',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    borderBottom: '1px dashed #aaa',
                                    transition: 'border-color 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                                title="클릭하여 URL 변경"
                            >
                                <span style={{ fontSize: '15px', opacity: 0.7 }}>&#9998;</span>
                                {id}
                            </span>
                            <button
                                onClick={handleCopyURL}
                                style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                }}
                                title="현재 URL 복사"
                            >
                                URL 복사
                            </button>
                        </>
                    )}
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/:id" element={<Layout />}>
                    <Route index element={<Main />} />
                    <Route path="clipboard" element={<Page01 />} />
                    <Route path="openai" element={<Page02 />} />
                    <Route path="portfolio" element={<Page03 />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
