import React, { useState, useEffect, useRef } from 'react';

const WEDDING_DATE = new Date('2026-09-13T16:40:00');
const ROSE = '#c2185b';
const DEEP_ROSE = '#880e4f';
const PINK = '#f48fb1';
const BLUSH = '#fce4ec';
const TEXT_BLACK = '#222';

const MUSIC_VIDEO_ID = 'h-XrgiZiQgw';

const ACCOUNTS = {
  groom: {
    label: '신랑측',
    accounts: [
      { name: '김태환', bank: '토스뱅크', account: '1000-0416-8007' },
      { name: '아버지 김세형', bank: '하나은행', account: '153-910095-12507' },
      { name: '어머니 박정순', bank: '신한은행', account: '110-319-925258' },
    ],
  },
  bride: {
    label: '신부측',
    accounts: [
      { name: '안영은', bank: '신한은행', account: '110-292-341321' },
      { name: '아버지 안준범', bank: '제일은행', account: '363-20-077414' },
      { name: '어머니 박재연', bank: '농협', account: '356-0462-3160-63' },
    ],
  },
};

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
        color: done ? '#fff' : TEXT_BLACK,
        borderRadius: 20,
        padding: '7px 20px',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {done ? '복사됨 ✓' : '복사'}
    </button>
  );
}

function HeartEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const colors = ['#f48fb1', '#c2185b', '#f06292', '#e91e63', '#ffb7c5'];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawHeart = (s) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.bezierCurveTo(-s * 0.04, s * 0.15, -s * 0.5, s * 0.02, -s * 0.5, -s * 0.1);
      ctx.bezierCurveTo(-s * 0.5, -s * 0.45, 0, -s * 0.6, 0, -s * 0.35);
      ctx.bezierCurveTo(0, -s * 0.6, s * 0.5, -s * 0.45, s * 0.5, -s * 0.1);
      ctx.bezierCurveTo(s * 0.5, s * 0.02, s * 0.04, s * 0.15, 0, s * 0.35);
      ctx.fill();
    };

    class Heart {
      constructor(initial = false) { this.reset(initial); }
      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : -20;
        this.size = Math.random() * 10 + 6;
        this.speed = Math.random() * 0.7 + 0.3;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.25 + 0.07;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.sway = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.02 + 0.01;
      }
      update() {
        this.y += this.speed;
        this.sway += this.swaySpeed;
        this.x += Math.sin(this.sway) * 0.5;
        this.rot += this.rotSpeed;
        if (this.y > canvas.height + 20) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        drawHeart(this.size);
        ctx.restore();
      }
    }

    const hearts = Array.from({ length: 25 }, () => new Heart(true));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach(h => { h.update(); h.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />
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
        playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: MUSIC_VIDEO_ID, rel: 0 },
        events: {
          onReady: (e) => { if (!cancelled) { e.target.pauseVideo(); setReady(true); } },
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
        padding: '10px 18px 10px 10px',
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
            width: 44, height: 44, borderRadius: '50%',
            background: `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})`,
            border: 'none', color: '#fff', fontSize: 18,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: `0 3px 12px ${ROSE}45`,
          }}
        >
          {!ready ? '♪' : playing ? '⏸' : '▶'}
        </button>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_BLACK, letterSpacing: 0.3 }}>love wins all</div>
          <div style={{ fontSize: 14, color: TEXT_BLACK, opacity: 0.7, marginTop: 2 }}>아이유 (IU)</div>
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
  const firstDayOfWeek = 2;
  const daysInMonth = 30;
  const weddingDay = 13;
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '22px 16px', border: `1.5px solid ${PINK}50`, marginBottom: 16, boxShadow: `0 2px 12px ${ROSE}10` }}>
      <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, color: TEXT_BLACK, marginBottom: 14, letterSpacing: 3 }}>
        2026 . 09
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 4 }}>
        {weekdays.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: i === 0 ? TEXT_BLACK : i === 6 ? '#1565c0' : '#bbb', paddingBottom: 10 }}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const isWedding = d === weddingDay;
          const col = i % 7;
          const isSun = col === 0;
          const isSat = col === 6;
          return (
            <div key={i} style={{ textAlign: 'center', paddingTop: 3, paddingBottom: 3 }}>
              {d !== null && (
                <div style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isWedding ? `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})` : 'transparent',
                  boxShadow: isWedding ? `0 3px 10px ${ROSE}50` : 'none',
                }}>
                  <span style={{
                    fontSize: 17,
                    fontWeight: isWedding ? 800 : 400,
                    color: isWedding ? '#fff' : isSun ? TEXT_BLACK : isSat ? '#1565c0' : '#5a3040',
                    lineHeight: 1,
                  }}>
                    {d}
                  </span>
                  {isWedding && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.9)', lineHeight: 1, marginTop: 1 }}>♥</span>
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

const MARKER_LAT_OFFSET = 0.000205; // +면 위(북)로, -면 아래(남)로 이동
const MARKER_LNG_OFFSET = 0.00004244; // +면 오른쪽(동)으로, -면 왼쪽(서)으로 이동

function KakaoMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(37.5250, 126.9271),
        level: 4,
      });

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch('서울특별시 영등포구 여의대로 14', (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = Number(result[0].y) + MARKER_LAT_OFFSET;
          const lng = Number(result[0].x) + MARKER_LNG_OFFSET;
          const coords = new window.kakao.maps.LatLng(lat, lng);
          new window.kakao.maps.Marker({ map, position: coords });
          map.setCenter(coords);
        }
      });
    };

    const tryInit = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(initMap);
      } else {
        const t = setInterval(() => {
          if (window.kakao && window.kakao.maps) {
            clearInterval(t);
            window.kakao.maps.load(initMap);
          }
        }, 50);
        return () => clearInterval(t);
      }
    };

    return tryInit();
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${PINK}50` }} />
  );
}

function MoneySection() {
  return (
    <div style={{ padding: '0 20px 40px' }}>
      <div style={{ textAlign: 'center', fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 24 }}>💌 마 음 전 하 기 💌</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {['groom', 'bride'].map(side => {
          const a = ACCOUNTS[side];
          const isGroom = side === 'groom';
          return (
            <div key={side} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 14,
                background: `linear-gradient(135deg, ${ROSE}, ${DEEP_ROSE})`,
                color: '#fff',
                fontSize: 17,
                fontWeight: 700,
                textAlign: 'center',
                letterSpacing: 1,
              }}>
                {a.label}
              </div>
              {a.accounts.map((acc, i) => (
                <div key={i} style={{ background: BLUSH, borderRadius: 14, padding: '16px 14px', border: `1.5px solid ${PINK}60`, textAlign: isGroom ? 'left' : 'right' }}>
                  <div style={{ fontSize: 14, color: TEXT_BLACK, marginBottom: 6, fontWeight: 600 }}>{acc.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_BLACK, marginBottom: 10, wordBreak: 'break-all' }}>{acc.bank}<br />{acc.account}</div>
                  <div style={{ display: 'flex', justifyContent: isGroom ? 'flex-start' : 'flex-end' }}>
                    <CopyBtn text={acc.account} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhotoBoothSection() {
  return (
    <div style={{ padding: '0 20px 48px', textAlign: 'center' }}>
      <div style={{ fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 20 }}>📸 P H O T O B O O T H 📸</div>
      <div style={{ background: `linear-gradient(135deg, ${BLUSH} 0%, #fff5f8 100%)`, borderRadius: 20, padding: '32px 26px', border: `1.5px solid ${PINK}60`, boxShadow: `0 6px 24px ${ROSE}18` }}>
        <p style={{ fontSize: 18, lineHeight: 2.2, color: TEXT_BLACK, margin: 0 }}>
          감사의 마음으로 결혼식장에<br />
          포토부스를 준비했습니다.
          <br /><br />
          멋지고 예쁜 모습 사진으로 남기고<br />
          선물로 한 장씩 가져가세요.
          <br /><br />
          축복해주신 마음들 소중히 간직하고<br />
          잘 살겠습니다.
        </p>
      </div>
    </div>
  );
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.unobserve(el);
      }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0) scale(1)' : 'translateY(26px) scale(0.96)',
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const GALLERY_IMAGES = Array.from({ length: 10 }, (_, i) => `/images/wedding${i + 5}_s.jpg`);
const CAROUSEL_CARD_SIZE = 140;

function PhotoCarousel({ images, onActiveChange }) {
  const ringRef = useRef(null);
  const rotationRef = useRef(0);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const activeRef = useRef(0);

  const n = images.length;
  const angleStep = 360 / n;
  const radius = Math.round((CAROUSEL_CARD_SIZE / 2) / Math.tan(Math.PI / n) * 1.15);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (!draggingRef.current) rotationRef.current += 0.015;
      if (ringRef.current) ringRef.current.style.transform = `rotateY(${rotationRef.current}deg)`;
      const nearest = ((Math.round(-rotationRef.current / angleStep) % n) + n) % n;
      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        if (onActiveChange) onActiveChange(nearest);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [angleStep, n, onActiveChange]);

  const startDrag = (clientX) => {
    draggingRef.current = true;
    lastXRef.current = clientX;
  };
  const moveDrag = (clientX) => {
    if (!draggingRef.current) return;
    const dx = clientX - lastXRef.current;
    lastXRef.current = clientX;
    rotationRef.current += dx * 0.4;
  };
  const endDrag = () => { draggingRef.current = false; };

  return (
    <div
      style={{ perspective: 1100, height: CAROUSEL_CARD_SIZE + 100, display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'pan-y', userSelect: 'none' }}
      onPointerDown={(e) => startDrag(e.clientX)}
      onPointerMove={(e) => moveDrag(e.clientX)}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        ref={ringRef}
        style={{ position: 'relative', width: CAROUSEL_CARD_SIZE, height: CAROUSEL_CARD_SIZE, transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="wr-carousel-card"
            style={{
              position: 'absolute', inset: 0,
              transform: `rotateY(${i * angleStep}deg) translateZ(${radius}px)`,
            }}
          >
            <img src={src} alt="" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Divider({ icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 32px 32px' }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${PINK})` }} />
      <div style={{ fontSize: 22, color: TEXT_BLACK }}>{icon}</div>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${PINK})` }} />
    </div>
  );
}

export default function Wedding() {
  const t = useCountdown(WEDDING_DATE);
  const [activeIndex, setActiveIndex] = useState(0);

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
      setMeta('og:image', '/images/wedding1_s.jpg', true),
      setMeta('og:image:width', '600', true),
      setMeta('og:image:height', '315', true),
    ];

    return () => {
      document.title = prevTitle;
      metas.forEach(el => {
        if (el._prevContent !== undefined) el.setAttribute('content', el._prevContent);
      });
    };
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', backgroundColor: '#fff9f5', fontFamily: "'Gowun Batang', 'Apple SD Gothic Neo', serif" }}>
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
        .wr-carousel-card {
          border-radius: 14px;
          overflow: hidden;
          border: 2px solid ${PINK}80;
          box-shadow: 0 10px 28px ${ROSE}35;
          cursor: grab;
          background: #fff;
          backface-visibility: hidden;
        }
        .wr-carousel-card:active { cursor: grabbing; }
        .wr-carousel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .wr-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${PINK}70;
          transition: width 0.3s ease, background 0.3s ease;
        }
        .wr-dot-active {
          width: 18px;
          border-radius: 4px;
          background: ${ROSE};
        }
      `}</style>

      <HeartEffect />
      <MusicPlayer />

      {/* Hero */}
      <div style={{ position: 'relative', height: 600, overflow: 'hidden', background: `linear-gradient(160deg, ${BLUSH} 0%, #ffd6e4 50%, #fff9f5 100%)` }}>
        <img
          src="/images/wedding1_s.jpg"
          alt="웨딩 대표사진"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
        />
        <div style={{ position: 'absolute', top: 80, left: 36, fontSize: 30, color: TEXT_BLACK, animation: 'wr-float 3.5s ease-in-out infinite', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 160, right: 44, fontSize: 18, color: PINK, animation: 'wr-float2 4s ease-in-out infinite 0.7s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 240, left: 70, fontSize: 12, color: TEXT_BLACK, animation: 'wr-float 5s ease-in-out infinite 1.4s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', top: 310, right: 80, fontSize: 22, color: PINK, animation: 'wr-float2 4.5s ease-in-out infinite 0.3s', pointerEvents: 'none' }}>♥</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '48px 32px', textAlign: 'center', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,249,245,0.88) 100%)' }}>
          <div style={{ fontSize: 25, letterSpacing: 5, color: TEXT_BLACK, marginBottom: 16, opacity: 0.8 }}>🌹 Wedding Invitation 🌹</div>
          <div style={{ fontSize: 20, color: TEXT_BLACK, marginBottom: 12, letterSpacing: 1 }}>두 사람이 하나가 되는 날</div>
          <div style={{ fontSize: 54, fontWeight: 800, color: TEXT_BLACK, letterSpacing: 3, marginBottom: 12, lineHeight: 1.1 }}>태환 ♥ 영은</div>
          <div style={{ fontSize: 19, color: TEXT_BLACK, letterSpacing: 2 }}>2026년 9월 13일 일요일 16시 40분</div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 32px 24px' }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${PINK})` }} />
        <div style={{ fontSize: 24, color: TEXT_BLACK }}>💕</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${PINK})` }} />
      </div>

      {/* Greeting */}
      <div className="wr-fade" style={{ padding: '0 32px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: PINK, marginBottom: 14, opacity: 0.6 }}>❝</div>
        <p style={{ fontSize: 20, lineHeight: 2.4, color: TEXT_BLACK, margin: 0 }}>
          우리 두 사람의 사랑이 영원히<br />
          빛나는 날, 함께해 주세요.<br />
          <br />
          귀한 걸음 해주신다면<br />
          더없는 기쁨이 되겠습니다.
        </p>
        <div style={{ fontSize: 28, color: PINK, marginTop: 14, opacity: 0.6 }}>❞</div>
      </div>

      {/* Couple Photos */}
      <div style={{ padding: '0 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
          <Reveal>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ borderRadius: '50%', overflow: 'hidden', width: 110, height: 110, border: `3px solid ${PINK}`, boxShadow: `0 4px 16px ${ROSE}30`, margin: '0 auto 12px' }}
              >
                <img src="/images/wedding2_s.jpg" alt="신랑"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 14, color: '#ccc', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>신랑</div>
              <div style={{ fontSize: 23, fontWeight: 700, color: TEXT_BLACK, letterSpacing: 1, marginBottom: 6 }}>김태환</div>
              <div style={{ fontSize: 15, color: '#bbb', lineHeight: 1.8 }}>김세형 박정순의 장남</div>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
            <div style={{ fontSize: 30, color: TEXT_BLACK }}>♥</div>
          </div>
          <Reveal delay={0.12}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{ borderRadius: '50%', overflow: 'hidden', width: 110, height: 110, border: `3px solid ${PINK}`, boxShadow: `0 4px 16px ${ROSE}30`, margin: '0 auto 12px' }}
              >
                <img src="/images/wedding3_s.jpg" alt="신부"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: 14, color: '#ccc', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>신부</div>
              <div style={{ fontSize: 23, fontWeight: 700, color: TEXT_BLACK, letterSpacing: 1, marginBottom: 6 }}>안영은</div>
              <div style={{ fontSize: 15, color: '#bbb', lineHeight: 1.8 }}>안준범 박재연의 장녀</div>
            </div>
          </Reveal>
        </div>
      </div>

      <Divider icon="🌸" />

      {/* Date & Venue Card */}
      <div style={{ margin: '0 20px 40px', borderRadius: 20, background: `linear-gradient(135deg, ${BLUSH} 0%, #fff5f8 100%)`, padding: '32px 28px', border: `1.5px solid ${PINK}60`, textAlign: 'center', boxShadow: `0 6px 24px ${ROSE}18` }}>
        <div style={{ fontSize: 26, marginBottom: 16 }}>🌸</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: TEXT_BLACK, marginBottom: 6, letterSpacing: 2 }}>2026. 9. 13</div>
        <div style={{ fontSize: 20, color: TEXT_BLACK, marginBottom: 22, opacity: 0.7 }}>일요일 오후 4시 40분</div>
        <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${PINK}, transparent)`, margin: '0 auto 22px' }} />
        <div style={{ fontSize: 23, fontWeight: 700, color: TEXT_BLACK, marginBottom: 6 }}>여의도웨딩컨벤션</div>
        <div style={{ fontSize: 19, color: TEXT_BLACK, marginBottom: 4 }}>그랜드볼룸</div>
        <div style={{ fontSize: 16, color: '#bbb' }}>서울특별시 영등포구 여의대로 14 KT빌딩 3층</div>
      </div>

      {/* 달력 */}
      <div style={{ padding: '0 20px 40px' }}>
        <SeptemberCalendar />
      </div>

      {/* Countdown */}
      <div style={{ padding: '0 20px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 24 }}>💕 D - D A Y 💕</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          {[['일', t.d], ['시간', t.h], ['분', t.m], ['초', t.s]].map(([label, val], i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{ fontSize: 24, color: PINK, paddingBottom: 20 }}>·</div>}
              <div style={{ background: `linear-gradient(145deg, ${ROSE} 0%, ${DEEP_ROSE} 100%)`, borderRadius: 16, padding: '16px 12px 12px', minWidth: 70, textAlign: 'center', boxShadow: `0 6px 18px ${ROSE}40` }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                  {String(val).padStart(2, '0')}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6, letterSpacing: 1 }}>{label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Couple Full Photo */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 20 }}>🌹 우리의 이야기 🌹</div>
        <Reveal>
          <div
            style={{ borderRadius: 20, overflow: 'hidden', border: `2px solid ${PINK}50`, boxShadow: `0 8px 32px ${ROSE}20` }}
          >
            <img
              src="/images/wedding4_s.jpg"
              alt="커플 사진"
              style={{ width: '100%', height: 460, objectFit: 'cover' }}
            />
          </div>
        </Reveal>
      </div>

      {/* Gallery */}
      <div style={{ padding: '0 0 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 20 }}>🌸 G A L L E R Y 🌸</div>
        <PhotoCarousel images={GALLERY_IMAGES} onActiveChange={setActiveIndex} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {GALLERY_IMAGES.map((_, i) => (
            <span key={i} className={`wr-dot${i === activeIndex ? ' wr-dot-active' : ''}`} />
          ))}
        </div>
      </div>

      <Divider icon="💕" />

      {/* Location */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{ textAlign: 'center', fontSize: 19, color: TEXT_BLACK, letterSpacing: 4, marginBottom: 20 }}>🗺️ 오 시 는 길 🗺️</div>
        <div style={{ marginBottom: 14 }}>
          <KakaoMap />
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_BLACK, marginBottom: 4 }}>여의도웨딩컨벤션 그랜드볼룸</div>
          <div style={{ fontSize: 16, color: '#bbb' }}>서울특별시 영등포구 여의대로 14 KT빌딩 3층</div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {[
            { label: '네이버지도에서 보기', url: 'https://naver.me/FHlgBdXp' },
            { label: '카카오맵에서 보기', url: 'https://place.map.kakao.com/8011957' },
          ].map(({ label, url }) => (
            <a key={label} href={url} target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 18px', borderRadius: 20, border: `1.5px solid ${PINK}`, color: TEXT_BLACK, fontSize: 16, cursor: 'pointer', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
        <div style={{ background: BLUSH, borderRadius: 14, padding: '20px', fontSize: 17, color: TEXT_BLACK, lineHeight: 2.1 }}>
          <span style={{ fontWeight: 700, color: TEXT_BLACK }}>지하철</span>　5·9호선 여의도역 1번 출구<br />
          <span style={{ fontWeight: 700, color: TEXT_BLACK }}>버스</span>　한국경제인협회 정류장 하차<br />
          <span style={{ fontWeight: 700, color: TEXT_BLACK }}>주차</span>　지하 주차장 이용 (2시간 무료)
        </div>
      </div>

      <Divider icon="🌹" />

      {/* 마음 전하기 */}
      <MoneySection />

      <Divider icon="📸" />

      {/* 포토부스 안내 */}
      <PhotoBoothSection />

    </div>
  );
}
