import React, { useState, useEffect } from 'react';

const ROSE = '#c2185b';
const DEEP_ROSE = '#880e4f';

const GROOM = '태환';
const BRIDE = '영은';
const DATE_LABEL = '2026. 9. 13';

const SLIDE_MS = 4000; // 사진 한 장당 노출 시간
const SLIDES = Array.from({ length: 14 }, (_, i) => `/images/wedding${i + 1}_s.jpg`);

// 배경음악 (임시로 채운 5곡, 추후 원하는 곡으로 교체 가능)
const SONG_IDS = [
  '2Vv-BfVoq4g', // Perfect - Ed Sheeran
  '450p7goxZqg', // All of Me - John Legend
  'rtOvBOTyX00', // A Thousand Years - Christina Perri
  'fLexgOxsZu0', // Marry You - Bruno Mars
  'h-XrgiZiQgw', // Love wins all - 아이유(IU)
];

export default function WeddingVideo() {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = '식전영상 · 태환 ♥ 영은';
    return () => { document.title = prevTitle; };
  }, []);

  useEffect(() => {
    if (!started || paused) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % SLIDES.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [started, paused]);

  const handleStart = () => {
    setStarted(true);
    setPaused(false);
  };

  const musicSrc = started
    ? `https://www.youtube.com/embed/${SONG_IDS[0]}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${SONG_IDS.join(',')}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  return (
    <div style={{
      width: '100vw', height: '100dvh', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
    }}>
    <div style={{
      // 가로형 4:3 영상 프레임 — 화면에 완전히 들어오도록 vw/vh 중 더 작은 쪽에 맞춰 크기 결정
      width: 'min(94vw, calc(94dvh * 4 / 3))',
      aspectRatio: '4 / 3',
      containerType: 'inline-size',
      position: 'relative', overflow: 'hidden', background: '#000',
      fontFamily: "'Gowun Batang', 'Apple SD Gothic Neo', serif",
    }}>
      <style>{`
        .wv-slide {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0;
          transition: opacity 1.3s ease;
        }
        /* 뒷배경: 사진을 꽉 채워 확대(crop)하고 70% 불투명도로 어둡게 깔아준다 */
        .wv-slide-bg { object-fit: cover; animation: wv-breathe 9s ease-in-out infinite; }
        .wv-slide-bg-active { opacity: 0.7; }
        /* 앞면: 원본 비율 그대로, 잘리지 않게 프레임 안에 전체가 보이도록 */
        .wv-slide-fg { object-fit: contain; }
        .wv-slide-fg-active { opacity: 1; }
        @keyframes wv-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .wv-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.4);
          transition: width 0.3s ease, background 0.3s ease;
        }
        .wv-dot-active { width: 18px; border-radius: 4px; background: #fff; }
        @keyframes wv-pulseHeart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>

      {/* 사진 슬라이드 */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {SLIDES.map((src, i) => {
          const isActive = started && i === index;
          return (
            <React.Fragment key={src}>
              {/* 뒷배경용: 화면을 꽉 채우도록 확대(crop), 70% 불투명도 */}
              <img src={src} alt="" className={`wv-slide wv-slide-bg${isActive ? ' wv-slide-bg-active' : ''}`} />
              {/* 앞면용: 원본 그대로 잘리지 않게 표시 */}
              <img src={src} alt="" className={`wv-slide wv-slide-fg${isActive ? ' wv-slide-fg-active' : ''}`} />
            </React.Fragment>
          );
        })}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 76%, rgba(0,0,0,0.6) 100%)',
        }} />
      </div>

      {/* 상단 바 */}
      <div style={{ position: 'absolute', top: '3%', left: '3%', right: '3%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <a href="/wedding" style={{ color: '#fff', fontSize: 'clamp(9px, 2.4cqw, 13px)', textDecoration: 'none', opacity: 0.85, background: 'rgba(0,0,0,0.28)', padding: '0.5cqw 1.6cqw', borderRadius: 20, whiteSpace: 'nowrap' }}>
          ← 청첩장
        </a>
        <div style={{ color: '#fff', fontSize: 'clamp(9px, 2.4cqw, 13px)', letterSpacing: 2, opacity: 0.85, background: 'rgba(0,0,0,0.28)', padding: '0.5cqw 1.6cqw', borderRadius: 20, whiteSpace: 'nowrap' }}>
          {GROOM} ♥ {BRIDE}
        </div>
      </div>

      {/* 진행 상태 점 */}
      {started && (
        <div style={{ position: 'absolute', top: '13%', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20 }}>
          {SLIDES.map((_, i) => (
            <span key={i} className={`wv-dot${i === index ? ' wv-dot-active' : ''}`} />
          ))}
        </div>
      )}

      {!started ? (
        <button
          onClick={handleStart}
          style={{
            position: 'absolute', inset: 0, zIndex: 30, width: '100%', height: '100%',
            border: 'none', cursor: 'pointer',
            background: 'linear-gradient(160deg, rgba(194,24,91,0.55), rgba(0,0,0,0.65))',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2.5cqw',
          }}
        >
          <div style={{ fontSize: 'clamp(11px, 3cqw, 22px)', letterSpacing: 4, color: '#fff', opacity: 0.9 }}>PRE - WEDDING FILM</div>
          <div style={{ fontSize: 'clamp(24px, 7.5cqw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: 2 }}>{GROOM} ♥ {BRIDE}</div>
          <div style={{ fontSize: 'clamp(10px, 2.4cqw, 16px)', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>{DATE_LABEL}</div>
          <div style={{
            marginTop: '1cqw', width: 'clamp(42px, 11cqw, 72px)', height: 'clamp(42px, 11cqw, 72px)', borderRadius: '50%',
            background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'wv-pulseHeart 1.8s ease-in-out infinite',
          }}>
            <div style={{
              width: 0, height: 0, marginLeft: '0.6cqw',
              borderTop: 'clamp(8px, 2.1cqw, 14px) solid transparent',
              borderBottom: 'clamp(8px, 2.1cqw, 14px) solid transparent',
              borderLeft: 'clamp(13px, 3.4cqw, 22px) solid #fff',
            }} />
          </div>
          <div style={{ fontSize: 'clamp(9px, 2cqw, 13px)', color: 'rgba(255,255,255,0.75)' }}>탭하여 식전영상 시작하기</div>
        </button>
      ) : (
        <div style={{
          position: 'absolute', bottom: '3%', left: '3%', right: '3%', zIndex: 20,
          display: 'flex', alignItems: 'center', gap: '1.5cqw',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          borderRadius: 50, padding: '1cqw 1.2cqw 1cqw 1cqw', border: '1px solid rgba(255,255,255,0.25)',
        }}>
          <button
            onClick={() => setPaused(p => !p)}
            style={{
              width: 'clamp(26px, 6.5cqw, 40px)', height: 'clamp(26px, 6.5cqw, 40px)', borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})`,
              border: 'none', color: '#fff', fontSize: 'clamp(10px, 2.5cqw, 16px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <div style={{ flex: 1, color: '#fff', fontSize: 'clamp(9px, 2.2cqw, 13px)', textAlign: 'center' }}>
            {index + 1} / {SLIDES.length}
          </div>
          <button
            onClick={() => setMuted(m => !m)}
            aria-label="배경음악 음소거"
            style={{
              width: 'clamp(22px, 5.5cqw, 34px)', height: 'clamp(22px, 5.5cqw, 34px)', borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff', fontSize: 'clamp(9px, 2.2cqw, 14px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}

      {musicSrc && (
        <iframe
          key={muted ? 'm' : 'u'}
          title="배경음악"
          src={musicSrc}
          allow="autoplay; encrypted-media"
          style={{ position: 'absolute', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' }}
        />
      )}
    </div>
    </div>
  );
}
