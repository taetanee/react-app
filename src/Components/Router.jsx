import React from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, Outlet } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";
import Page03 from "../Pages/Page03";
import { message } from "./Message";

function generateRandomId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function RootRedirect() {
    return <Navigate to={`/${generateRandomId()}`} replace />;
}

function Layout() {
    const { id } = useParams();

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
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(baseUrl).then(() => {
                message('URL이 복사되었습니다.', 'success');
            }).catch(() => {
                message('URL 복사에 실패했습니다.', 'error');
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = baseUrl;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                message('URL이 복사되었습니다.', 'success');
            } catch {
                message('URL 복사에 실패했습니다.', 'error');
            }
            document.body.removeChild(textarea);
        }
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
                <button
                    onClick={handleCopyURL}
                    style={{
                        marginLeft: '10px',
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
