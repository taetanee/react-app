import React, { useState, useCallback, useRef } from 'react';

let showMessageFn = () => {};

export const message = (text, type = 'info') => {
    showMessageFn(text, type);
};

const Message = () => {
    const [current, setCurrent] = useState(null);
    const timerRef = useRef(null);

    showMessageFn = useCallback((text, type) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setCurrent({ text, type });
        timerRef.current = setTimeout(() => {
            setCurrent(null);
        }, 2500);
    }, []);

    const bgColor = (type) => {
        if (type === 'success') return '#28a745';
        if (type === 'error') return '#dc3545';
        return '#333';
    };

    if (!current) return null;

    return (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999 }}>
            <div style={{
                backgroundColor: bgColor(current.type),
                color: 'white',
                padding: '12px 30px',
                borderRadius: '6px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                textAlign: 'center',
                whiteSpace: 'nowrap'
            }}>
                {current.text}
            </div>
        </div>
    );
};

export default Message;