import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useNavigate, Outlet } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import Page02 from "../Pages/Page02";
import Page03 from "../Pages/Page03";
import QuantPage from "../Pages/QuantPage";
import ProposalPage from "../Pages/ProposalPage";
import MovingAveragePage from "../Pages/MovingAveragePage";
import { generateWordId, validateWordId } from "../utils/wordGenerator";
import { message } from "./Message";
import axios from "axios";

const API_BASE_URL = "https://api.mypad.kr/onlineClipboard";

function RootRedirect() {
    const saved = localStorage.getItem('my_id');
    const target = saved ?? generateWordId();
    return <Navigate to={`/@${target}`} replace />;
}

// ── 공통: 햄버거 드롭다운 ─────────────────────────────────────
function HamburgerMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dropdownLinkStyle = ({ isActive } = {}) => ({
        display: 'block',
        padding: '11px 20px',
        textDecoration: 'none',
        fontSize: '14px',
        color: isActive ? '#007bff' : '#333',
        fontWeight: isActive ? 'bold' : 'normal',
        backgroundColor: isActive ? '#e9f5ff' : 'transparent',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        transition: 'background 0.15s',
    });

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    height: 34,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: menuOpen ? '#007bff' : '#ddd',
                    background: menuOpen ? '#e9f5ff' : '#fff',
                    cursor: 'pointer',
                    padding: '0 12px',
                    fontSize: '13px',
                    color: menuOpen ? '#007bff' : '#555',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', justifyContent: 'center' }}>
                    {[0, 1, 2].map(i => (
                        <span key={i} style={{
                            display: 'block',
                            width: 16,
                            height: 2,
                            borderRadius: 2,
                            background: menuOpen ? '#007bff' : '#555',
                            transition: 'background 0.2s',
                        }} />
                    ))}
                </div>
                숨겨진 메뉴
            </button>

            {menuOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                    minWidth: 140,
                    zIndex: 999,
                    overflow: 'hidden',
                }}>
                    <NavLink style={dropdownLinkStyle} to="/moving-average" onClick={() => setMenuOpen(false)}>
                        지수 이동평균선
                    </NavLink>
                    <NavLink style={dropdownLinkStyle} to="/quant" onClick={() => setMenuOpen(false)}>
                        S&P 500 퀀트
                    </NavLink>
                    <NavLink style={dropdownLinkStyle} to="/openai" onClick={() => setMenuOpen(false)}>
                        오픈AI
                    </NavLink>
                    <span
                        onClick={() => { setMenuOpen(false); alert('비공개 상태입니다.'); }}
                        style={dropdownLinkStyle({ isActive: false })}
                    >
                        포트폴리오
                    </span>
                </div>
            )}
        </div>
    );
}

// ── Layout: /@{id} 전용 (내 URL 편집 바 포함) ────────────────
function Layout() {
    const { id: rawId } = useParams();
    const id = rawId?.replace(/^@/, '') ?? '';
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [newId, setNewId] = useState(id);
    const [migrating, setMigrating] = useState(false);

    useEffect(() => {
        if (id) localStorage.setItem('my_id', id);
    }, [id]);

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
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        navigator.clipboard.writeText(baseUrl).then(() => {
            message('URL이 복사되었습니다.', 'success');
        }).catch(() => {
            message('URL 복사에 실패했습니다.', 'error');
        });
    };

    const handleStartEdit = () => { setNewId(id); setEditing(true); };
    const handleCancelEdit = () => { setEditing(false); setNewId(id); };

    const handleConfirmEdit = async () => {
        const trimmed = newId.trim().toLowerCase();
        if (trimmed === id) { setEditing(false); return; }
        if (!trimmed) { message('ID를 입력해주세요.', 'error'); return; }
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
            const subPath = window.location.pathname.replace(`/@${id}`, '');
            navigate(`/@${trimmed}${subPath}`, { replace: true });
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
            <nav style={navStyle}>
                <HamburgerMenu />
                <NavLink style={navLinkStyle} to={`/@${id}`} end>나만의 요약</NavLink>
                <NavLink style={navLinkStyle} to={`/@${id}/clipboard`}>나만의 복붙</NavLink>
            </nav>

            {/* 내 URL 행 */}
            <div style={{
                backgroundColor: '#f0f4f8',
                borderBottom: '2px solid #e0e0e0',
                padding: '7px 16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: '700', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    내 URL
                </span>
                {editing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>mypad.kr/@</span>
                        <input
                            type="text"
                            value={newId}
                            onChange={(e) => setNewId(e.target.value.toLowerCase())}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            disabled={migrating}
                            style={{
                                padding: '4px 8px', fontSize: '13px', fontFamily: 'monospace',
                                border: '1.5px solid #007bff', borderRadius: '6px',
                                outline: 'none', width: '130px', backgroundColor: '#fff',
                            }}
                        />
                        <button onClick={handleConfirmEdit} disabled={migrating}
                            style={{
                                padding: '4px 12px',
                                backgroundColor: migrating ? '#95a5a6' : '#007bff',
                                color: 'white', border: 'none', borderRadius: '6px',
                                cursor: migrating ? 'default' : 'pointer', fontSize: '12px', fontWeight: '600',
                            }}>
                            {migrating ? '변경중...' : '변경'}
                        </button>
                        <button onClick={handleCancelEdit} disabled={migrating}
                            style={{
                                padding: '4px 10px', backgroundColor: 'transparent',
                                color: '#aaa', border: '1px solid #ddd', borderRadius: '6px',
                                cursor: 'pointer', fontSize: '12px',
                            }}>
                            취소
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', backgroundColor: '#fff',
                            border: '1px solid #ddd', borderRadius: '8px',
                            padding: '4px 4px 4px 12px', gap: '4px', cursor: 'pointer',
                        }} onClick={handleStartEdit}>
                            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#333' }}>
                                mypad.kr/@{id}
                            </span>
                            <span style={{ fontSize: '15px', color: '#888', padding: '2px 6px', opacity: 0.7 }}>
                                &#9998;
                            </span>
                        </div>
                        <button onClick={handleCopyURL}
                            style={{
                                padding: '5px 12px', backgroundColor: '#fff', color: '#555',
                                border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
                            }}>
                            복사
                        </button>
                    </div>
                )}
            </div>

            <Outlet />
        </>
    );
}

// ── SharedLayout: /openai, /quant, /portfolio 전용 (내 URL 바 없음) ──
function SharedLayout() {
    const savedId = localStorage.getItem('my_id') ?? '';

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

    return (
        <>
            <nav style={navStyle}>
                <HamburgerMenu />
                <NavLink style={navLinkStyle} to={savedId ? `/@${savedId}` : '/'} end>나만의 요약</NavLink>
                <NavLink style={navLinkStyle} to={savedId ? `/@${savedId}/clipboard` : '/'}>나만의 복붙</NavLink>
            </nav>
            <Outlet />
        </>
    );
}

const navStyle = {
    padding: '8px 16px',
    backgroundColor: '#f8f8f8',
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2px',
    position: 'relative',
};

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RootRedirect />} />

                {/* 프로포즈 페이지 */}
                <Route path="/@aye" element={<ProposalPage />} />

                {/* 고유 URL 없는 공유 페이지 */}
                <Route element={<SharedLayout />}>
                    <Route path="/openai"          element={<Page02 />} />
                    <Route path="/quant"           element={<QuantPage />} />
                    <Route path="/moving-average"  element={<MovingAveragePage />} />
                    <Route path="/portfolio"       element={<Page03 />} />
                </Route>

                {/* 개인 URL 페이지 */}
                <Route path="/:id" element={<Layout />}>
                    <Route index element={<Main />} />
                    <Route path="clipboard" element={<Page01 />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
