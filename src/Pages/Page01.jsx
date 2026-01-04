import React from "react";
// 경로가 'src/Components' 아래에 있다고 가정합니다.
import TextClipboard from "../Components/TextClipboard";
import DummyFileFeature from "../Components/DummyFileFeature";

export default function Page01() {

    // 파일 업로드 성공 후 새로고침 로직이 필요 없으므로, useState, useCallback 모두 제거

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            {/* 1. 텍스트 클립보드 */}
            <TextClipboard />

            <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

            {/* 2. 더미 파일 기능 */}
            <DummyFileFeature />

        </div>
    );
}