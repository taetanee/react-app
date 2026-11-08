// 모바일 청첩장 화면에서 같이 쓰는 작은 부품과 유틸
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export const TEXT_DARK = '#3d3838';
export const TEXT_MUTE = '#a89fa0';

export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 편집기 미리보기 안에서 렌더링 중인지 (애니메이션·고정 위치 요소를 끄는 데 사용)
export const PreviewContext = createContext(false);
export const useIsPreview = () => useContext(PreviewContext);

export function formatDateTime(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일 ${d.getHours() < 12 ? '오전' : '오후'} ${((d.getHours() + 11) % 12) + 1}시${d.getMinutes() ? ` ${d.getMinutes()}분` : ''}`;
}

export function formatDate(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function useDaysLeft(target) {
  const [days, setDays] = useState(0);
  const time = target ? target.getTime() : null;
  useEffect(() => {
    if (time == null) return;
    const calc = () => setDays(Math.ceil((time - Date.now()) / 86400000));
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [time]);
  return days;
}

export function hexToAccent(hex, fallback = '#a78bda') {
  const base = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : fallback;
  // 단순 보정: 딥 컬러는 같은 색을 약간 더 어둡게
  const n = parseInt(base.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 40);
  const g = Math.max(0, ((n >> 8) & 0xff) - 30);
  const b = Math.max(0, (n & 0xff) - 20);
  return { base, deep: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}` };
}

export function CopyBtn({ text, accent, label = '복사' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); })}
      style={{
        border: `1px solid ${done ? accent.deep : accent.base}70`,
        background: done ? accent.deep : '#fff',
        color: done ? '#fff' : TEXT_DARK,
        borderRadius: 18, padding: '6px 16px', fontSize: 13,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      {done ? '복사됨 ✓' : label}
    </button>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.unobserve(el); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export function Reveal({ children, delay = 0 }) {
  const preview = useIsPreview();
  const [ref, inView] = useInView();
  const shown = preview || inView;
  return (
    <div ref={ref} style={{
      opacity: shown ? 1 : 0,
      transform: shown ? 'translateY(0)' : 'translateY(20px)',
      transition: preview ? 'none' : `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, accent }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 30 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase' }}>{eyebrow}</div>
      {title && <div style={{ fontSize: 21, fontWeight: 600, color: TEXT_DARK, letterSpacing: 1 }}>{title}</div>}
      <div style={{ width: 26, height: 2, background: accent.base, margin: '14px auto 0', borderRadius: 2 }} />
    </div>
  );
}

export function MusicPill({ started, muted, onStart, onToggleMute, accent }) {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 200 }}>
      <button
        onClick={started ? onToggleMute : onStart}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.95)', border: `1.5px solid ${accent.base}55`,
          borderRadius: 50, padding: started ? '11px' : '11px 18px 11px 14px',
          boxShadow: `0 6px 20px ${accent.base}35`,
        }}
      >
        <span style={{ fontSize: 17 }}>{!started ? '🎵' : muted ? '🔇' : '🔊'}</span>
        {!started && <span style={{ fontSize: 12.5, color: TEXT_DARK, fontWeight: 500 }}>배경음악 재생</span>}
      </button>
    </div>
  );
}

export function CenterMessage({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gowun Dodum', sans-serif", color: TEXT_MUTE }}>
      {children}
    </div>
  );
}
