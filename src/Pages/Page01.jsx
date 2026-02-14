import React from "react";
import { useParams } from "react-router-dom";
import TextClipboard from "../Components/TextClipboard";
import FileClipboard from "../Components/FileClipboard";

export default function Page01() {
    const { id: rawId } = useParams();
    const id = rawId?.replace(/^@/, '') ?? '';

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 15px', fontFamily: 'Arial, sans-serif' }}>
            <TextClipboard randomWord={id} />

            <div style={{ margin: '25px 0' }} />

            <FileClipboard randomWord={id} />
        </div>
    );
}
