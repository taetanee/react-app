import React from "react";
import { useParams } from "react-router-dom";
import TextClipboard from "../Components/TextClipboard";
import FileClipboard from "../Components/FileClipboard";
import { message } from "../Components/Message";

export default function Page01() {
    const { id } = useParams();

    const handleShareURL = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            message('URL이 복사되었습니다.', 'success');
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                    <span style={{ fontSize: '13px', color: '#555', fontFamily: 'monospace' }}>{id}</span>
                    <button
                        onClick={handleShareURL}
                        style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                        URL 복사
                    </button>
                </div>
            </div>

            <TextClipboard randomWord={id} />

            <hr style={{ margin: '30px 0', borderColor: '#eee' }} />

            <FileClipboard randomWord={id} />
        </div>
    );
}
