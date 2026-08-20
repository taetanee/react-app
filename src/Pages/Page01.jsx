import React from "react";
import { useParams } from "react-router-dom";
import TextClipboard from "../Components/TextClipboard";
import FileClipboard from "../Components/FileClipboard";
import useDocumentMeta from "../hooks/useDocumentMeta";

export default function Page01() {
    const { id: rawId } = useParams();
    const id = rawId?.replace(/^@/, '') ?? '';

    useDocumentMeta({
        title: "나만의 복붙 · MyPad",
        description: "텍스트와 파일을 간편하게 저장하고 여러 기기에서 공유하세요",
    });

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 15px', fontFamily: 'Arial, sans-serif' }}>
            <TextClipboard randomWord={id} />

            <div style={{ margin: '25px 0' }} />

            <FileClipboard randomWord={id} />
        </div>
    );
}
