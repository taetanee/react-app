import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getInvitePublic, getVideoPublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';

const ROSE = '#c2185b';
const DEEP_ROSE = '#880e4f';

export default function InvitationVideoView() {
  const { slug } = useParams();
  const [slides, setSlides] = useState([]);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    Promise.all([getInvitePublic(slug), getVideoPublic(slug)])
      .then(([invite, videoCfg]) => {
        setSlides(invite.gallery ?? []);
        setPageMeta({
          title: `${invite.groomShort} ♥ ${invite.brideShort} 식전영상`,
          description: '저희의 이야기를 영상으로 담았습니다',
        });
        setVideo(videoCfg);
      })
      .catch(err => setError(err.message));
  }, [slug]);

  const slideMs = video?.slideMs || 4000;
  const songIds = (video?.songIds || '').split(',').map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    if (!started || paused || slides.length === 0) return;
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, slideMs);
    return () => clearInterval(timer);
  }, [started, paused, slides.length, slideMs]);

  const handleStart = () => { setStarted(true); setPaused(false); };

  const musicSrc = started && songIds.length > 0
    ? `https://www.youtube.com/embed/${songIds[0]}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${songIds.join(',')}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  if (error) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>영상을 찾을 수 없습니다.</div>;
  }
  if (!video) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>불러오는 중...</div>;
  }
  if (slides.length === 0) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', textAlign: 'center', padding: 20 }}>등록된 사진이 없습니다.<br />마이페이지에서 갤러리 사진을 먼저 추가해주세요.</div>;
  }

  return (
    <div style={{
      width: '100vw', height: '100dvh', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000',
    }}>
      <div style={{
        width: 'min(94vw, calc(94dvh * 4 / 3))',
        aspectRatio: '4 / 3',
        containerType: 'inline-size',
        position: 'relative', overflow: 'hidden', background: '#000',
        fontFamily: "'Gowun Batang', 'Apple SD Gothic Neo', serif",
      }}>
        <style>{`
          .ivv-slide { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1.3s ease; }
          .ivv-slide-bg { object-fit: cover; animation: ivv-breathe 9s ease-in-out infinite; }
          .ivv-slide-bg-active { opacity: 0.7; }
          .ivv-slide-fg { object-fit: contain; }
          .ivv-slide-fg-active { opacity: 1; }
          @keyframes ivv-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
          .ivv-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); transition: width 0.3s ease, background 0.3s ease; }
          .ivv-dot-active { width: 18px; border-radius: 4px; background: #fff; }
          @keyframes ivv-pulseHeart { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        `}</style>

        <div style={{ position: 'absolute', inset: 0 }}>
          {slides.map((src, i) => {
            const isActive = started && i === index;
            return (
              <React.Fragment key={src}>
                <img src={src} alt="" className={`ivv-slide ivv-slide-bg${isActive ? ' ivv-slide-bg-active' : ''}`} />
                <img src={src} alt="" className={`ivv-slide ivv-slide-fg${isActive ? ' ivv-slide-fg-active' : ''}`} />
              </React.Fragment>
            );
          })}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 76%, rgba(0,0,0,0.6) 100%)',
          }} />
        </div>

        <div style={{ position: 'absolute', top: '3%', left: '3%', right: '3%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
          <a href={`/invite/${slug}`} style={{ color: '#fff', fontSize: 'clamp(9px, 2.4cqw, 13px)', textDecoration: 'none', opacity: 0.85, background: 'rgba(0,0,0,0.28)', padding: '0.5cqw 1.6cqw', borderRadius: 20, whiteSpace: 'nowrap' }}>
            ← 청첩장
          </a>
          <div style={{ color: '#fff', fontSize: 'clamp(9px, 2.4cqw, 13px)', letterSpacing: 2, opacity: 0.85, background: 'rgba(0,0,0,0.28)', padding: '0.5cqw 1.6cqw', borderRadius: 20, whiteSpace: 'nowrap' }}>
            {video.titleLine1} ♥ {video.titleLine2}
          </div>
        </div>

        {started && (
          <div style={{ position: 'absolute', top: '13%', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 20 }}>
            {slides.map((_, i) => (
              <span key={i} className={`ivv-dot${i === index ? ' ivv-dot-active' : ''}`} />
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
            <div style={{ fontSize: 'clamp(24px, 7.5cqw, 48px)', fontWeight: 800, color: '#fff', letterSpacing: 2 }}>{video.titleLine1} ♥ {video.titleLine2}</div>
            <div style={{ fontSize: 'clamp(10px, 2.4cqw, 16px)', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>{video.dateLabel}</div>
            <div style={{
              marginTop: '1cqw', width: 'clamp(42px, 11cqw, 72px)', height: 'clamp(42px, 11cqw, 72px)', borderRadius: '50%',
              background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'ivv-pulseHeart 1.8s ease-in-out infinite',
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
              {index + 1} / {slides.length}
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
