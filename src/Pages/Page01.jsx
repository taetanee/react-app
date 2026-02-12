import React from "react";
import { useSearchParams } from "react-router-dom";
import TextClipboard from "../Components/TextClipboard";
import FileClipboard from "../Components/FileClipboard";

export default function Page01() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    return (
        <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 15px', fontFamily: 'Arial, sans-serif' }}>
            <TextClipboard randomWord={id} />

            <div style={{ margin: '25px 0' }} />

            <FileClipboard randomWord={id} />
        </div>
    );
}
