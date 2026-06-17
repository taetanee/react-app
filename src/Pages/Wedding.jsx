import React, { useState, useEffect, useRef } from 'react';

const WEDDING_DATE = new Date('2026-09-13T16:40:00');
const ROSE = '#c2185b';
const DEEP_ROSE = '#880e4f';
const PINK = '#f48fb1';
const BLUSH = '#fce4ec';

const MUSIC_VIDEO_ID = 'h-XrgiZiQgw';

const ACCOUNTS = [
  { who: '신랑 김태환', bank: '국민은행', account: '123-456-789012' },
  { who: '신부 안영은', bank: '신한은행', account: '987-654-321098' },
  { who: '신랑 아버지 김영철', bank: '우리은행', account: '111-222-333444' },
  { who: '신부 아버지 안상훈', bank: '하나은행', account: '555-666-777888' },
];

const EVENT_DETAILS = [
  { label: 'DATE', value: '2026년 9월 13일 일요일' },
  { label: 'TIME', value: '오후 4시 40분' },
  { label: 'VENUE', value: '여의도웨딩컨벤션' },
  { label: 'HALL', value: '그랜드볼룸' },
  { label: 'ADDRESS', value: '영등포구 국제금융로8길 17' },
];

function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); })}
      style={{
        border: `1px solid ${done ? ROSE : PINK}`,
        background: done ? ROSE : 'transparent',
        color: done ? '#fff' : ROSE,
        borderRadius: 20,
        padding: '5px 14px',
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {done ? '복사됨 ✓' : '복사'}
    </button>
  );
}

const YT_PLAYER_ID = 'yt-wedding-bg-player';

function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled || playerRef.current) return;
      playerRef.current = new window.YT.Player(YT_PLAYER_ID, {
        videoId: MUSIC_VIDEO_ID,
        playerVars: { autoplay: 1, controls: 0, loop: 1, playlist: MUSIC_VIDEO_ID, rel: 0 },
        events: {
          onReady: (e) => { if (!cancelled) { e.target.playVideo(); setReady(true); } },
          onStateChange: (e) => { if (!cancelled) setPlaying(e.data === window.YT.PlayerState.PLAYING); },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); createPlayer(); };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
      setReady(false);
      setPlaying(false);
    };
  }, []);

  const toggle = () => {
    if (!ready || !playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 300 }}>
      <div id={YT_PLAYER_ID} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }} />
      <div style={{
        background: 'rgba(255,255,255,0.93)',
        borderRadius: 50,
        boxShadow: `0 6px 28px ${ROSE}22`,
        padding: '10px 16px 10px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: `1.5px solid ${PINK}55`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <button
          onClick={toggle}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})`,
            border: 'none', color: '#fff', fontSize: 15,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: `0 3px 12px ${ROSE}45`,
          }}
        >
          {!ready ? '♪' : playing ? '⏸' : '▶'}
        </button>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: DEEP_ROSE, letterSpacing: 0.3 }}>love wins all</div>
          <div style={{ fontSize: 10, color: ROSE, opacity: 0.7, marginTop: 2 }}>아이유 (IU)</div>
        </div>
        {playing && (
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
            {[5, 9, 6, 12, 7].map((h, i) => (
              <div key={i} style={{
                width: 3, backgroundColor: ROSE, borderRadius: 2,
                height: `${h}px`, transformOrigin: 'bottom',
                animation: `wr-mbar 0.65s ease-in-out ${i * 0.12}s infinite alternate`,
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SeptemberCalendar() {
  // 2026년 9월 1일 = 화요일(2), 13일 = 일요일
  const firstDayOfWeek = 2; // getDay() of Sep 1, 2026
  const daysInMonth = 30;
  const weddingDay = 13;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px 16px', border: `1.5px solid ${PINK}50`, marginBottom: 16, boxShadow: `0 2px 12px ${ROSE}10` }}>
      <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: DEEP_ROSE, marginBottom: 14, letterSpacing: 3 }}>
        2026 . 09
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
        {weekdays.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? ROSE : i === 6 ? '#1565c0' : '#bbb', paddingBottom: 10 }}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const isWedding = d === weddingDay;
          const col = i % 7;
          const isSun = col === 0;
          const isSat = col === 6;
          return (
            <div key={i} style={{ textAlign: 'center', paddingTop: 2, paddingBottom: 2 }}>
              {d !== null && (
                <div style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: isWedding ? `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})` : 'transparent',
                  boxShadow: isWedding ? `0 3px 10px ${ROSE}50` : 'none',
                }}>
                  <span style={{
                    fontSize: isWedding ? 13 : 13,
                    fontWeight: isWedding ? 800 : 400,
                    color: isWedding ? '#fff' : isSun ? ROSE : isSat ? '#1565c0' : '#5a3040',
                    lineHeight: 1,
                  }}>
                    {d}
                  </span>
                  {isWedding && (
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.9)', lineHeight: 1, marginTop: 1 }}>♥</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Divider({ icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 32px 32px' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${PINK})` }} />
      <div style={{ fontSize: 16, color: ROSE }}>{icon}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${PINK})` }} />
    </div>
  );
}

export default function Wedding() {
  const t = useCountdown(WEDDING_DATE);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = '태환 ♥ 영은 결혼식에 초대합니다';

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el._prevContent = el.getAttribute('content');
      el.setAttribute('content', content);
      return el;
    };

    const desc = '2026년 9월 13일 일요일 오후 4시 40분 · 여의도웨딩컨벤션 그랜드볼룸';
    const metas = [
      setMeta('description', desc),
      setMeta('og:title', '태환 ♥ 영은 결혼식에 초대합니다', true),
      setMeta('og:description', desc, true),
      setMeta('og:type', 'website', true),
    ];

    return () => {
      document.title = prevTitle;
      metas.forEach(el => {
        if (el._prevContent !== undefined) el.setAttribute('content', el._prevContent);
      });
    };
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', backgroundColor: '#fff9f5', fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      <style>{`
        @keyframes wr-float {
          0%, 100% { transform: translateY(0) rotate(-6deg); opacity: 0.25; }
          50% { transform: translateY(-14px) rotate(4deg); opacity: 0.45; }
        }
        @keyframes wr-float2 {
          0%, 100% { transform: translateY(0) rotate(4deg); opacity: 0.2; }
          50% { transform: translateY(-10px) rotate(-4deg); opacity: 0.35; }
        }
        @keyframes wr-fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wr-mbar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1.2); }
        }
        .wr-fade { animation: wr-fadeUp 0.9s ease forwards; }
      `}</style>

      <MusicPlayer />

      {/* Hero */}
      <div style={{ position: 'relative', height: 600, overflow: 'hidden', background: `linear-gradient(160deg, ${BLUSH} 0%, #ffd6e4 50%, #fff9f5 100%)` }}>
        <img
          src="https://picsum.photos/seed/wedding-romantic-hero/480/600"
          alt="웨딩 대표사진"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
        />
        <div style={{ position: 'absolute', top: 80, left: 36, fontSize: 30, color: ROSE, animation: 'wr-float 3.5s ease-in-out infinite', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 160, right: 44, fontSize: 18, color: PINK, animation: 'wr-float2 4s ease-in-out infinite 0.7s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 240, left: 70, fontSize: 12, color: ROSE, animation: 'wr-float 5s ease-in-out infinite 1.4s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 310, right: 80, fontSize: 22, color: PINK, animation: 'wr-float2 4.5s ease-in-out infinite 0.3s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '48px 32px', textAlign: 'center', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,249,245,0.88) 100%)' }}>
          <div style={{ fontSize: 13, letterSpacing: 5, color: ROSE, marginBottom: 16, opacity: 0.8 }}>🌹 Wedding Invitation 🌹</div>
          <div style={{ fontSize: 14, color: '#c06080', marginBottom: 12, letterSpacing: 1 }}>두 사람이 하나가 되는 날</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: DEEP_ROSE, letterSpacing: 3, marginBottom: 12, lineHeight: 1.1 }}>태환 ♥ 영은</div>
          <div style={{ fontSize: 13, color: '#c06080', letterSpacing: 2 }}>2026년 9월 13일 일요일</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 32px 24px' }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${PINK})` }} />
        <div style={{ fontSize: 18, color: ROSE }}>💕</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${PINK})` }} />
      </div>

      {/* Greeting */}
      <div className="wr-fade" style={{ padding: '0 32px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, color: PINK, marginBottom: 14, opacity: 0.6 }}>❝</div>
        <p style={{ fontSize: 15, lineHeight: 2.4, color: '#9a6070', margin: 0 }}>
          우리 두 사람의 사랑이 영원히<br />
          빛나는 날, 함께해 주세요.<br />
          <br />
          귀한 걸음 해주신다면<br />
          더없는 기쁨이 되겠습니다.
        </p>
        <div style={{ fontSize: 22, color: PINK, marginTop: 14, opacity: 0.6 }}>❞</div>
      </div>

      {/* Couple Photos */}
      <div style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderRadius: '50%', overflow: 'hidden', width: 110, height: 110, border: `3px solid ${PINK}`, boxShadow: `0 4px 16px ${ROSE}30`, margin: '0 auto 12px' }}>
              <img src="https://picsum.photos/seed/groom-rom/220/220" alt="신랑"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 10, color: '#ccc', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>신랑</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DEEP_ROSE, letterSpacing: 1, marginBottom: 6 }}>김태환</div>
            <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.8 }}>김영철 · 박선희의 장남</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
            <div style={{ fontSize: 24, color: ROSE }}>♥</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderRadius: '50%', overflow: 'hidden', width: 110, height: 110, border: `3px solid ${PINK}`, boxShadow: `0 4px 16px ${ROSE}30`, margin: '0 auto 12px' }}>
              <img src="https://picsum.photos/seed/bride-rom/220/220" alt="신부"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: 10, color: '#ccc', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>신부</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DEEP_ROSE, letterSpacing: 1, marginBottom: 6 }}>안영은</div>
            <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.8 }}>안상훈 · 이미란의 장녀</div>
          </div>
        </div>
      </div>

      <Divider icon="🌸" />

      {/* Date & Venue Card */}
      <div style={{ margin: '0 20px 40px', borderRadius: 20, background: `linear-gradient(135deg, ${BLUSH} 0%, #fff5f8 100%)`, padding: '32px 28px', border: `1.5px solid ${PINK}60`, textAlign: 'center', boxShadow: `0 6px 24px ${ROSE}18` }}>
        <div style={{ fontSize: 20, marginBottom: 16 }}>🌸</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: DEEP_ROSE, marginBottom: 6, letterSpacing: 2 }}>2026. 9. 13</div>
        <div style={{ fontSize: 14, color: ROSE, marginBottom: 22, opacity: 0.7 }}>일요일 오후 4시 40분</div>
        <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${PINK}, transparent)`, margin: '0 auto 22px' }} />
        <div style={{ fontSize: 17, fontWeight: 700, color: DEEP_ROSE, marginBottom: 6 }}>여의도웨딩컨벤션</div>
        <div style={{ fontSize: 13, color: '#c06080', marginBottom: 4 }}>그랜드볼룸</div>
        <div style={{ fontSize: 12, color: '#bbb' }}>서울특별시 영등포구 국제금융로8길 17</div>
      </div>

      {/* Event Details */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 20 }}>📋 E V E N T D E T A I L S 📋</div>
        <SeptemberCalendar />
        <div style={{ background: BLUSH, borderRadius: 16, padding: '24px 20px', border: `1.5px solid ${PINK}50` }}>
          {EVENT_DETAILS.map(({ label, value }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < EVENT_DETAILS.length - 1 ? 16 : 0 }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: ROSE, fontWeight: 700, minWidth: 60, flexShrink: 0 }}>{label}</div>
              <div style={{ flex: 1, borderTop: `1px dotted ${PINK}` }} />
              <div style={{ fontSize: 13, color: DEEP_ROSE, fontWeight: 600, textAlign: 'right' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Countdown */}
      <div style={{ padding: '0 20px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 24 }}>💕 D - D A Y 💕</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          {[['일', t.d], ['시간', t.h], ['분', t.m], ['초', t.s]].map(([label, val], i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{ fontSize: 18, color: PINK, paddingBottom: 20 }}>·</div>}
              <div style={{ background: `linear-gradient(145deg, ${ROSE} 0%, ${DEEP_ROSE} 100%)`, borderRadius: 16, padding: '16px 12px 12px', minWidth: 62, textAlign: 'center', boxShadow: `0 6px 18px ${ROSE}40` }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 6, letterSpacing: 1 }}>{label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Couple Full Photo */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 20 }}>🌹 우리의 이야기 🌹</div>
        <img
          src="https://picsum.photos/seed/romantic-couple/440/520"
          alt="커플 사진"
          style={{ width: '100%', height: 460, objectFit: 'cover', borderRadius: 20, display: 'block', border: `2px solid ${PINK}50`, boxShadow: `0 8px 32px ${ROSE}20` }}
        />
      </div>

      {/* Gallery */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 20 }}>🌸 G A L L E R Y 🌸</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {[...Array(4)].map((_, i) => (
            <img key={i} src={`https://picsum.photos/seed/rom-gallery-${i + 1}/300/300`} alt=""
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 14, border: `1.5px solid ${PINK}50` }} />
          ))}
        </div>
        <img src="https://picsum.photos/seed/rom-gallery-wide/600/300" alt=""
          style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 14, display: 'block', border: `1.5px solid ${PINK}50` }} />
      </div>

      <Divider icon="💕" />

      {/* Location */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 20 }}>🗺️ 오 시 는 길 🗺️</div>
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 14, border: `1.5px solid ${PINK}50` }}>
          <img src="https://picsum.photos/seed/romantic-map/440/180" alt="지도"
            style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: DEEP_ROSE, marginBottom: 4 }}>여의도웨딩컨벤션 그랜드볼룸</div>
          <div style={{ fontSize: 12, color: '#bbb' }}>서울특별시 영등포구 국제금융로8길 17</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {['카카오맵', '네이버지도', '구글맵'].map(label => (
            <button key={label} style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${PINK}`, background: 'transparent', color: ROSE, fontSize: 12, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ background: BLUSH, borderRadius: 14, padding: '20px', fontSize: 13, color: '#9a6070', lineHeight: 2.1 }}>
          <span style={{ fontWeight: 700, color: ROSE }}>지하철</span>　5·9호선 여의도역 3번 출구 도보 5분<br />
          <span style={{ fontWeight: 700, color: ROSE }}>버스</span>　여의도역(KBS별관) 정류장 하차 후 도보 3분<br />
          <span style={{ fontWeight: 700, color: ROSE }}>주차</span>　지하 주차장 이용 (3시간 무료)
        </div>
      </div>

      <Divider icon="🌹" />

      {/* 마음 전하기 */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: ROSE, letterSpacing: 4, marginBottom: 24 }}>💌 마 음 전 하 기 💌</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACCOUNTS.map(a => (
            <div key={a.who} style={{ background: BLUSH, borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1.5px solid ${PINK}60` }}>
              <div>
                <div style={{ fontSize: 11, color: '#c06080', marginBottom: 5 }}>{a.who}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: DEEP_ROSE }}>{a.bank} {a.account}</div>
              </div>
              <CopyBtn text={a.account} />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: `linear-gradient(135deg, ${DEEP_ROSE} 0%, ${ROSE} 100%)`, padding: '48px 32px 80px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.3)', letterSpacing: 8, marginBottom: 20 }}>♥ ♥ ♥</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: 3, marginBottom: 10 }}>태환 ♥ 영은</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 3 }}>2026년 9월 13일 일요일</div>
      </div>
    </div>
  );
}
