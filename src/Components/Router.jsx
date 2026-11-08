import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useParams, useNavigate, Outlet } from "react-router-dom";
import Main from "../Pages/Main";
import Page01 from "../Pages/Page01";
import ProposalPage from "../Pages/ProposalPage";
import Wedding from "../Pages/Wedding";
import Wedding2 from "../Pages/Wedding2";
import WeddingVideo from "../Pages/WeddingVideo";
import MyPageLogin from "../Pages/wedding-platform/MyPageLogin";
import MyPageDashboard from "../Pages/wedding-platform/MyPageDashboard";
import InvitationView from "../Pages/wedding-platform/InvitationView";
import InvitationVideoView from "../Pages/wedding-platform/InvitationVideoView";
import DolInvitationView from "../Pages/wedding-platform/DolInvitationView";
import AdminCustomerCreate from "../Pages/wedding-platform/AdminCustomerCreate";
import { generateWordId, validateWordId } from "../utils/wordGenerator";
import { RouteMeta } from "../utils/pageMeta";
import { message } from "./Message";
import axios from "axios";

const API_BASE_URL = "https://api.mypad.kr/onlineClipboard";

function RootRedirect() {
    const saved = localStorage.getItem('my_id');
    const target = saved ?? generateWordId();
    return <Navigate to={`/@${target}`} replace />;
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
            <RouteMeta />
            <Routes>
                <Route path="/" element={<RootRedirect />} />

                {/* 프로포즈 페이지 */}
                <Route path="/@aye" element={<ProposalPage />} />

                {/* 모바일 청첩장 */}
                <Route path="/wedding" element={<Wedding />} />
                <Route path="/wedding2" element={<Wedding2 />} />

                {/* 식전영상 */}
                <Route path="/weddingvideo" element={<WeddingVideo />} />

                {/* 웨딩 플랫폼: 고객 마이페이지 */}
                <Route path="/mypage/login" element={<MyPageLogin />} />
                <Route path="/mypage" element={<MyPageDashboard />} />

                {/* 웨딩 플랫폼: 공개 청첩장 / 식전영상 (고객별 slug) */}
                <Route path="/invite/:slug" element={<InvitationView />} />
                <Route path="/invite/:slug/video" element={<InvitationVideoView />} />
                <Route path="/dol/:slug" element={<DolInvitationView />} />

                {/* 웨딩 플랫폼: 관리자 계정 발급 */}
                <Route path="/admin/wedding" element={<AdminCustomerCreate />} />

                {/* 개인 URL 페이지 */}
                <Route path="/:id" element={<Layout />}>
                    <Route index element={<Main />} />
                    <Route path="clipboard"        element={<Page01 />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
