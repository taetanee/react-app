import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvitePublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';

const CREAM = '#fdf8f1';
const CREAM_DEEP = '#f6ece0';
const TEXT_DARK = '#3d3838';
const TEXT_MUTE = '#a89fa0';

function useDaysLeft(target) {
  const [days, setDays] = useState(0);
  useEffect(() => {
    if (!target) return;
    const calc = () => setDays(Math.ceil((target - new Date()) / 86400000));
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [target]);
  return days;
}

function CopyBtn({ text, accent }) {
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
      {done ? '복사됨 ✓' : '복사'}
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

function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, accent }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 30 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase' }}>{eyebrow}</div>
      {title && <div style={{ fontSize: 21, fontWeight: 600, color: TEXT_DARK, letterSpacing: 1 }}>{title}</div>}
      <div style={{ width: 26, height: 2, background: accent.base, margin: '14px auto 0', borderRadius: 2 }} />
    </div>
  );
}

function MusicPill({ started, muted, onStart, onToggleMute, accent }) {
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

function hexToAccent(hex) {
  const base = hex && /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : '#a78bda';
  // 단순 보정: 딥 컬러는 같은 색을 약간 더 어둡게
  const darken = (h) => {
    const n = parseInt(h.slice(1), 16);
    const r = Math.max(0, (n >> 16) - 40);
    const g = Math.max(0, ((n >> 8) & 0xff) - 30);
    const b = Math.max(0, (n & 0xff) - 20);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  return { base, deep: darken(base) };
}

export default function InvitationView() {
  const { slug } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [bgmStarted, setBgmStarted] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);

  useEffect(() => {
    getInvitePublic(slug).then(setInvite).catch(err => setError(err.message));
  }, [slug]);

  useEffect(() => {
    if (!invite) return;
    setPageMeta({
      title: `${invite.groomShort} ♥ ${invite.brideShort} 결혼식에 초대합니다`,
      description: [invite.venueName, invite.venueHall].filter(Boolean).join(' ') || '모바일 청첩장',
    });
  }, [invite]);

  const weddingDate = invite?.weddingDate ? new Date(invite.weddingDate) : null;
  const daysLeft = useDaysLeft(weddingDate);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gowun Dodum', sans-serif", color: TEXT_MUTE }}>
        청첩장을 찾을 수 없습니다.
      </div>
    );
  }
  if (!invite) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gowun Dodum', sans-serif", color: TEXT_MUTE }}>
        불러오는 중...
      </div>
    );
  }

  const accent = hexToAccent(invite.accentColor);
  const gallery = invite.gallery ?? [];
  const GALLERY_INITIAL = 8;
  const visibleImages = galleryExpanded ? gallery : gallery.slice(0, GALLERY_INITIAL);
  const accounts = invite.accounts ?? { groom: [], bride: [] };

  const musicSrc = bgmStarted && invite.bgmYoutubeId
    ? `https://www.youtube.com/embed/${invite.bgmYoutubeId}?autoplay=1&mute=${bgmMuted ? 1 : 0}&loop=1&playlist=${invite.bgmYoutubeId}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  const dateLabel = weddingDate
    ? `${weddingDate.getFullYear()}년 ${weddingDate.getMonth() + 1}월 ${weddingDate.getDate()}일 ${['일','월','화','수','목','금','토'][weddingDate.getDay()]}요일 ${weddingDate.getHours() < 12 ? '오전' : '오후'} ${((weddingDate.getHours() + 11) % 12) + 1}시${weddingDate.getMinutes() ? ` ${weddingDate.getMinutes()}분` : ''}`
    : '';

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: CREAM,
      fontFamily: "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif", color: TEXT_DARK,
    }}>
      <style>{`
        @keyframes iv-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .iv-fade { animation: iv-fadeUp 0.9s ease forwards; }
        .iv-gallery-item { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 10px; background: ${CREAM_DEEP}; }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', height: gallery[0] ? 460 : 260, overflow: 'hidden', background: accent.base }}>
        {gallery[0] && (
          <img src={gallery[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(61,56,56,0.15) 0%, rgba(61,56,56,0.05) 40%, ${CREAM} 96%)` }} />
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: 5, color: TEXT_DARK, opacity: 0.85, marginBottom: 14, fontWeight: 600 }}>WEDDING INVITATION</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: TEXT_DARK, letterSpacing: 3, marginBottom: 10 }}>{invite.groomShort} · {invite.brideShort}</div>
          <div style={{ fontSize: 13.5, color: TEXT_DARK, opacity: 0.9, letterSpacing: 1 }}>{dateLabel}</div>
        </div>
      </div>

      {/* 오시는 길 */}
      <div style={{ padding: '44px 24px 44px', background: '#fff' }}>
        <SectionTitle eyebrow="Location" title="오시는 길" accent={accent} />
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{invite.venueName} {invite.venueHall}</div>
            <div style={{ fontSize: 13.5, color: TEXT_MUTE }}>{invite.venueAddr}</div>
          </div>
        </Reveal>
      </div>

      {/* 메인 정보 */}
      <div className="iv-fade" style={{ padding: '30px 24px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>{invite.groomFull} <span style={{ color: accent.base, fontWeight: 400 }}>그리고</span> {invite.brideFull}</div>
        <div style={{ fontSize: 14, color: TEXT_MUTE, marginTop: 10, lineHeight: 1.9 }}>
          {dateLabel}<br />
          {invite.venueName} {invite.venueHall}
        </div>
      </div>

      {/* 인사말 */}
      {invite.greeting && (
        <div style={{ padding: '44px 30px 46px', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, marginBottom: 20, textTransform: 'uppercase' }}>Invitation</div>
            <p style={{ fontSize: 15.5, lineHeight: 2.3, color: TEXT_DARK, margin: 0, whiteSpace: 'pre-line' }}>
              {invite.greeting}
            </p>
          </Reveal>
        </div>
      )}

      {/* 달력/디데이 */}
      {weddingDate && (
        <div style={{ padding: '10px 24px 46px' }}>
          <Reveal>
            <div style={{ textAlign: 'center', fontSize: 14.5, color: TEXT_DARK }}>
              {invite.groomShort} <span style={{ color: accent.base }}>♥</span> {invite.brideShort} 결혼식까지{' '}
              <span style={{ fontWeight: 700, color: accent.deep, fontSize: 17 }}>{daysLeft > 0 ? daysLeft : 0}</span>일 남았습니다
            </div>
          </Reveal>
        </div>
      )}

      {/* 갤러리 */}
      {gallery.length > 0 && (
        <div style={{ padding: '10px 24px 46px' }}>
          <SectionTitle eyebrow="Gallery" accent={accent} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {visibleImages.map((src) => (
              <div key={src} className="iv-gallery-item">
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          {!galleryExpanded && gallery.length > GALLERY_INITIAL && (
            <button
              onClick={() => setGalleryExpanded(true)}
              style={{
                display: 'block', margin: '20px auto 0', padding: '10px 26px', borderRadius: 20,
                border: `1px solid ${accent.base}60`, background: '#fff', color: TEXT_DARK, fontSize: 13.5, cursor: 'pointer',
              }}
            >
              사진 더 보기
            </button>
          )}
        </div>
      )}

      {/* 계좌번호 */}
      {(accounts.groom?.length > 0 || accounts.bride?.length > 0) && (
        <div style={{ padding: '10px 24px 50px' }}>
          <SectionTitle eyebrow="Gift" title="마음 전하실 곳" accent={accent} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['groom', 'bride'].map(side => (
              <div key={side} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  textAlign: 'center', padding: '9px 0', borderRadius: 12,
                  background: `linear-gradient(135deg, ${accent.base}, ${accent.deep})`,
                  color: '#fff', fontSize: 13.5, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  {side === 'groom' ? '신랑측' : '신부측'}
                </div>
                {(accounts[side] ?? []).map((acc, i) => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${accent.base}25`, borderRadius: 12, padding: '12px 12px' }}>
                    <div style={{ fontSize: 12, color: TEXT_MUTE, marginBottom: 4 }}>{acc.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, wordBreak: 'break-all', marginBottom: 8 }}>{acc.bank}<br />{acc.account}</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <CopyBtn text={acc.account} accent={accent} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <Link to={`/invite/${slug}/video`} style={{ fontSize: 13, color: accent.deep, textDecoration: 'none' }}>
          🎬 식전영상 보기
        </Link>
      </div>

      <MusicPill
        started={bgmStarted}
        muted={bgmMuted}
        onStart={() => setBgmStarted(true)}
        onToggleMute={() => setBgmMuted(m => !m)}
        accent={accent}
      />
      {musicSrc && (
        <iframe
          key={bgmMuted ? 'm' : 'u'}
          title="배경음악"
          src={musicSrc}
          allow="autoplay; encrypted-media"
          style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}
