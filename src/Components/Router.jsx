import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import IntroPage from "../Pages/wedding-platform/IntroPage";
import MyPageLogin from "../Pages/wedding-platform/MyPageLogin";
import MyPageDashboard from "../Pages/wedding-platform/MyPageDashboard";
import InvitationView from "../Pages/wedding-platform/InvitationView";
import InvitationVideoView from "../Pages/wedding-platform/InvitationVideoView";
import DolInvitationView from "../Pages/wedding-platform/DolInvitationView";
import AdminCustomerCreate from "../Pages/wedding-platform/AdminCustomerCreate";
import { RouteMeta } from "../utils/pageMeta";

export default function Router() {
    return (
        <BrowserRouter>
            <RouteMeta />
            <Routes>
                {/* 서비스 소개 */}
                <Route path="/" element={<IntroPage />} />

                {/* 고객 마이페이지 */}
                <Route path="/mypage/login" element={<MyPageLogin />} />
                <Route path="/mypage" element={<MyPageDashboard />} />

                {/* 공개 청첩장 / 식전영상 / 돌잔치 (고객별 slug) */}
                <Route path="/invite/:slug" element={<InvitationView />} />
                <Route path="/invite/:slug/video" element={<InvitationVideoView />} />
                <Route path="/dol/:slug" element={<DolInvitationView />} />

                {/* 관리자 계정 발급 */}
                <Route path="/admin/wedding" element={<AdminCustomerCreate />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
