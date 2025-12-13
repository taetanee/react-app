// src/components/DummyFileFeature.js
import React from 'react';

const DummyFileFeature = () => {

    const handleAlert = (feature) => {
        alert(`${feature} 기능은 현재 준비 중입니다.`);
    };

    return (
        <div style={{ padding: '20px', border: '1px dashed #dc3545', borderRadius: '8px', marginTop: '20px' }}>

            {/* 파일 업로드 영역 */}
            <div style={{ marginBottom: '20px' }}>
                <h3>⬆️ 파일 업로드</h3>
                <button
                    onClick={() => handleAlert("파일 업로드")}
                    style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    파일 선택 (준비 중)
                </button>
            </div>

            <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

            {/* 파일 다운로드 영역 */}
            <div>
                <h3>⬇️ 파일 다운로드</h3>
                <button
                    onClick={() => handleAlert("파일 다운로드")}
                    style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                    다운로드 버튼 (준비 중)
                </button>
            </div>
        </div>
    );
};

export default DummyFileFeature;