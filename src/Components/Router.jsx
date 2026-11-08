import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MyPageLogin from "../Pages/wedding-platform/MyPageLogin";
import MyPageDashboard from "../Pages/wedding-platform/MyPageDashboard";
import InvitationView from "../Pages/wedding-platform/InvitationView";
import InvitationVideoView from "../Pages/wedding-platform/InvitationVideoView";
import DolInvitationView from "../Pages/wedding-platform/DolInvitationView";
import AdminCustomerCreate from "../Pages/wedding-platform/AdminCustomerCreate";
import { RouteMeta } from "../utils/pageMeta";

// 예전 고정 청첩장(/wedding, /weddingvideo)은 플랫폼 고객 청첩장으로 이전됨. 이미 공유된 링크를 위해 리다이렉트만 남긴다.
const LEGACY_WEDDING_SLUG = "h6rxjh334n";

export default function Router() {
    return (
        <BrowserRouter>
            <RouteMeta />
            <Routes>
                {/* 고객 마이페이지 */}
                <Route path="/mypage/login" element={<MyPageLogin />} />
                <Route path="/mypage" element={<MyPageDashboard />} />

                {/* 공개 청첩장 / 식전영상 / 돌잔치 (고객별 slug) */}
                <Route path="/invite/:slug" element={<InvitationView />} />
                <Route path="/invite/:slug/video" element={<InvitationVideoView />} />
                <Route path="/dol/:slug" element={<DolInvitationView />} />

                {/* 관리자 계정 발급 */}
                <Route path="/admin/wedding" element={<AdminCustomerCreate />} />

                {/* 예전 링크 */}
                <Route path="/wedding" element={<Navigate to={`/invite/${LEGACY_WEDDING_SLUG}`} replace />} />
                <Route path="/wedding2" element={<Navigate to={`/invite/${LEGACY_WEDDING_SLUG}`} replace />} />
                <Route path="/weddingvideo" element={<Navigate to={`/invite/${LEGACY_WEDDING_SLUG}/video`} replace />} />

                <Route path="*" element={<Navigate to="/mypage/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
