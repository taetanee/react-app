import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getInvitePublic, getVideoPublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';

const INK = '#0d0b0a';
const IVORY = '#f5efe6';
const GOLD = '#c9a96e';
const FADE_MS = 1600;

const SERIF = "'Gowun Batang', 'Apple SD Gothic Neo', serif";
const LATIN = "'Cormorant Garamond', 'Gowun Batang', serif";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');

  .ivv-root { position: fixed; inset: 0; background: ${INK}; overflow: hidden; color: ${IVORY}; font-family: ${SERIF}; }
  .ivv-layer { position: absolute; inset: 0; opacity: 0; transition: opacity ${FADE_MS}ms ease; }
  .ivv-layer.on { opacity: 1; }
  .ivv-bg { position: absolute; inset: -6%; width: 112%; height: 112%; object-fit: cover; filter: blur(34px) brightness(0.42) saturate(0.9); }
  .ivv-fg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; transform-origin: center; }
  .ivv-fg.kb.in  { animation: ivv-kb-in  var(--dur) ease-out forwards; }
  .ivv-fg.kb.out { animation: ivv-kb-out var(--dur) ease-out forwards; }
  .ivv-paused .ivv-fg, .ivv-paused .ivv-fill { animation-play-state: paused !important; }
  @keyframes ivv-kb-in  { from { transform: scale(1); }    to { transform: scale(1.07); } }
  @keyframes ivv-kb-out { from { transform: scale(1.07); } to { transform: scale(1); } }

  .ivv-vignette { position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%),
                linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 18%, transparent 70%, rgba(0,0,0,0.7) 100%); }

  .ivv-bars { position: absolute; top: max(14px, env(safe-area-inset-top)); left: 4vmin; right: 4vmin; display: flex; gap: 4px; z-index: 5; }
  .ivv-bar { flex: 1; height: 2px; background: rgba(245,239,230,0.22); border-radius: 2px; overflow: hidden; }
  .ivv-fill { height: 100%; background: ${IVORY}; transform-origin: left; transform: scaleX(0); }
  .ivv-fill.done { transform: scaleX(1); }
  .ivv-fill.run { animation: ivv-fill var(--dur) linear forwards; }
  @keyframes ivv-fill { to { transform: scaleX(1); } }

  .ivv-chrome { transition: opacity 0.6s ease; }
  .ivv-chrome.hide { opacity: 0; pointer-events: none; }

  .ivv-btn { width: 44px; height: 44px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
    background: rgba(13,11,10,0.35); border: 1px solid rgba(245,239,230,0.35); color: ${IVORY}; cursor: pointer;
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: background 0.2s, border-color 0.2s; }
  .ivv-btn:hover { background: rgba(13,11,10,0.6); border-color: ${GOLD}; }
  .ivv-btn:focus-visible, .ivv-play:focus-visible, .ivv-back:focus-visible { outline: 2px solid ${GOLD}; outline-offset: 3px; }

  .ivv-back { color: ${IVORY}; text-decoration: none; font-size: 13px; letter-spacing: 0.08em; opacity: 0.75; transition: opacity 0.2s; }
  .ivv-back:hover { opacity: 1; }

  .ivv-intro > * { opacity: 0; animation: ivv-rise 1.4s ease forwards; }
  @keyframes ivv-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

  .ivv-play { width: 76px; height: 76px; border-radius: 50%; border: 1px solid rgba(201,169,110,0.8); background: transparent;
    display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; color: ${IVORY}; }
  .ivv-play::after { content: ''; position: absolute; inset: -9px; border-radius: 50%; border: 1px solid rgba(201,169,110,0.35);
    animation: ivv-ring 2.4s ease-out infinite; }
  @keyframes ivv-ring { from { transform: scale(0.9); opacity: 1; } to { transform: scale(1.25); opacity: 0; } }

  @media (prefers-reduced-motion: reduce) {
    .ivv-fg.kb, .ivv-play::after { animation: none; }
  }
`;

const Icon = {
  play: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>,
  pause: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11" rx="0.5" /><rect x="9.5" y="2.5" width="3" height="11" rx="0.5" /></svg>,
  sound: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h3l4-3.5v11L6 11H3z" fill="currentColor" stroke="none" /><path d="M12.5 6.5a3.5 3.5 0 0 1 0 5M14.5 4.5a6.5 6.5 0 0 1 0 9" /></svg>,
  mute: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M3 7h3l4-3.5v11L6 11H3z" fill="currentColor" stroke="none" /><path d="M12.5 7l4 4M16.5 7l-4 4" /></svg>,
};

function Message({ children }) {
  return (
    <div className="ivv-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <style>{STYLES}</style>
      <div style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(245,239,230,0.75)', letterSpacing: '0.04em' }}>{children}</div>
    </div>
  );
}

export default function InvitationVideoView() {
  const { slug } = useParams();
  const [slides, setSlides] = useState([]);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState('');
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimer = useRef(null);

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

  // 진행 바 애니메이션이 끝나면 다음 사진으로 (일시정지하면 바와 함께 멈춤)
  const next = useCallback(() => {
    setIndex(i => (i + 1) % slides.length);
    setTick(t => t + 1);
  }, [slides.length]);

  // 재생 중에는 3초간 움직임이 없으면 버튼 숨김
  const wake = useCallback(() => {
    setChromeVisible(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setChromeVisible(false), 3000);
  }, []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const handleStart = () => { setStarted(true); setPaused(false); wake(); };

  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      if (e.key === ' ') { e.preventDefault(); setPaused(p => !p); wake(); }
      if (e.key === 'm' || e.key === 'M') { setMuted(m => !m); wake(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, wake]);

  const musicSrc = started && songIds.length > 0
    ? `https://www.youtube.com/embed/${songIds[0]}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${songIds.join(',')}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  if (error) return <Message>영상을 찾을 수 없습니다.</Message>;
  if (!video) return <Message>불러오는 중</Message>;
  if (slides.length === 0) {
    return <Message>등록된 사진이 없습니다.<br />마이페이지에서 갤러리 사진을 먼저 추가해주세요.</Message>;
  }

  const names = (
    <>
      {video.titleLine1}
      <span style={{ fontFamily: LATIN, fontStyle: 'italic', color: GOLD, margin: '0 0.35em', fontWeight: 400 }}>&amp;</span>
      {video.titleLine2}
    </>
  );
  const showChrome = !started || paused || chromeVisible;

  return (
    <div
      className={`ivv-root${paused ? ' ivv-paused' : ''}`}
      style={{ '--dur': `${slideMs}ms` }}
      onMouseMove={started ? wake : undefined}
      onTouchStart={started ? wake : undefined}
    >
      <style>{STYLES}</style>

      {/* 사진 */}
      {slides.map((src, i) => {
        const on = started ? i === index : i === 0;
        // 사라지는 사진도 줌이 이어지도록 직전 사진의 애니메이션은 유지
        const prev = started && tick > 0 && slides.length > 1 && i === (index - 1 + slides.length) % slides.length;
        const kbKey = !started ? 'idle' : i === index ? tick : prev ? tick - 1 : 'idle';
        return (
          <div key={src} className={`ivv-layer${on ? ' on' : ''}`} aria-hidden={!on}>
            <img src={src} alt="" className="ivv-bg" />
            <img
              key={kbKey}
              src={src} alt=""
              className={`ivv-fg ${i % 2 === 0 ? 'in' : 'out'}${kbKey !== 'idle' ? ' kb' : ''}`}
              style={{ '--dur': `${slideMs + FADE_MS}ms` }}
            />
          </div>
        );
      })}
      <div className="ivv-vignette" />

      {!started ? (
        // 시작 화면
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'rgba(13,11,10,0.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
        }}>
          <a href={`/invite/${slug}`} className="ivv-back" style={{ position: 'absolute', top: 'max(20px, env(safe-area-inset-top))', left: 22 }}>
            ← 청첩장으로
          </a>
          <div className="ivv-intro" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontFamily: LATIN, fontSize: 'clamp(12px, 1.6vmin + 6px, 17px)', letterSpacing: '0.42em', color: GOLD, animationDelay: '0.1s', textIndent: '0.42em' }}>
              PRE-WEDDING FILM
            </div>
            <div style={{ width: 40, height: 1, background: GOLD, opacity: 0.6, margin: '22px 0 26px', animationDelay: '0.3s' }} />
            <div style={{ fontSize: 'clamp(30px, 6vmin + 10px, 64px)', letterSpacing: '0.12em', lineHeight: 1.2, animationDelay: '0.5s' }}>
              {names}
            </div>
            {video.dateLabel && (
              <div style={{ marginTop: 18, fontSize: 'clamp(13px, 1.4vmin + 8px, 18px)', letterSpacing: '0.16em', color: 'rgba(245,239,230,0.7)', animationDelay: '0.7s' }}>
                {video.dateLabel}
              </div>
            )}
            <button className="ivv-play" onClick={handleStart} aria-label="식전영상 재생" style={{ marginTop: 48, animationDelay: '1s' }}>
              <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: 3 }}><path d="M4 2.5v11l9-5.5z" /></svg>
            </button>
            <div style={{ marginTop: 18, fontSize: 12, letterSpacing: '0.2em', color: 'rgba(245,239,230,0.55)', animationDelay: '1.1s' }}>
              눌러서 재생
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* 진행 바 */}
          <div className="ivv-bars">
            {slides.map((_, i) => (
              <div key={i} className="ivv-bar">
                <div
                  key={i === index ? tick : 'static'}
                  className={`ivv-fill${i < index ? ' done' : i === index ? ' run' : ''}`}
                  onAnimationEnd={i === index ? next : undefined}
                />
              </div>
            ))}
          </div>

          {/* 하단 자막 + 컨트롤 */}
          <div className={`ivv-chrome${showChrome ? '' : ' hide'}`} style={{
            position: 'absolute', left: '4vmin', right: '4vmin', bottom: 'max(4vmin, env(safe-area-inset-bottom))', zIndex: 5,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 'clamp(18px, 2.4vmin + 8px, 30px)', letterSpacing: '0.1em' }}>{names}</div>
              {video.dateLabel && (
                <div style={{ marginTop: 6, fontSize: 'clamp(11px, 1vmin + 7px, 14px)', letterSpacing: '0.14em', color: 'rgba(245,239,230,0.65)' }}>
                  {video.dateLabel}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button className="ivv-btn" onClick={() => { setPaused(p => !p); wake(); }} aria-label={paused ? '재생' : '일시정지'}>
                {paused ? Icon.play : Icon.pause}
              </button>
              {songIds.length > 0 && (
                <button className="ivv-btn" onClick={() => { setMuted(m => !m); wake(); }} aria-label={muted ? '소리 켜기' : '음소거'}>
                  {muted ? Icon.mute : Icon.sound}
                </button>
              )}
            </div>
          </div>

          <a href={`/invite/${slug}`} className={`ivv-back ivv-chrome${showChrome ? '' : ' hide'}`}
            style={{ position: 'absolute', top: 'calc(max(14px, env(safe-area-inset-top)) + 16px)', left: '4vmin', zIndex: 5 }}>
            ← 청첩장으로
          </a>
        </>
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
  );
}
