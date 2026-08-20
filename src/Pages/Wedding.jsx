import React, { useState, useEffect, useRef } from 'react';
import useDocumentMeta from '../hooks/useDocumentMeta';

const WEDDING_DATE = new Date('2026-09-13T16:40:00');

const GROOM_FULL = '김태환';
const BRIDE_FULL = '안영은';
const GROOM_SHORT = '태환';
const BRIDE_SHORT = '영은';
const VENUE_NAME = '여의도웨딩컨벤션';
const VENUE_HALL = '그랜드볼룸';
const VENUE_ADDR = '서울특별시 영등포구 여의대로 14 KT빌딩 3층';
const VENUE_LAT = 37.5250;
const VENUE_LNG = 126.9271;

const CREAM = '#fdf8f1';
const CREAM_DEEP = '#f6ece0';
const LAVENDER = '#a78bda';
const LAVENDER_DEEP = '#7c5cb5';
const TEXT_DARK = '#3d3838';
const TEXT_MUTE = '#a89fa0';

const BGM_ID = 'h-XrgiZiQgw'; // 아이유 - Love wins all

const GALLERY_IMAGES = Array.from({ length: 14 }, (_, i) => `/images/wedding${i + 1}_s.jpg`);
const GALLERY_INITIAL = 8;

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

const NAV_ITEMS = [
  { id: 'wd-hero', label: '메인' },
  { id: 'wd-greeting', label: '인사말' },
  { id: 'wd-intro', label: '소개' },
  { id: 'wd-calendar', label: '달력' },
  { id: 'wd-gallery', label: '갤러리' },
  { id: 'wd-location', label: '오시는 길' },
  { id: 'wd-account', label: '계좌번호' },
];

function useDaysLeft(target) {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const calc = () => setDays(Math.ceil((target - new Date()) / 86400000));
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [target]);
  return days;
}

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function StickyNav() {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', overflowX: 'auto', gap: 2,
      background: 'rgba(253,248,241,0.94)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      borderBottom: `1px solid ${LAVENDER}25`, padding: '0 6px',
    }}>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollToId(item.id)}
          style={{
            flex: '0 0 auto', background: 'none', border: 'none', cursor: 'pointer',
            padding: '13px 11px', fontSize: 13, color: TEXT_DARK, opacity: 0.75,
            fontFamily: "'Gowun Dodum', sans-serif", whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); })}
      style={{
        border: `1px solid ${done ? LAVENDER_DEEP : LAVENDER}70`,
        background: done ? LAVENDER_DEEP : '#fff',
        color: done ? '#fff' : TEXT_DARK,
        borderRadius: 18, padding: '6px 16px', fontSize: 13,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      {done ? '복사됨 ✓' : '복사'}
    </button>
  );
}

// 배경(div background-image)으로 렌더링해 iOS의 "사진에 저장" 팝업을 원천적으로 피하고,
// 투명 텍스트를 겹쳐 롱프레스 시 무의미한 텍스트 드래그만 되게 한다.
function ProtectedPhoto({ src, alt = '', fit = 'cover', bgColor, selectable = true, style }) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        position: 'relative',
        backgroundImage: `url(${src})`,
        backgroundSize: fit,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: bgColor,
        ...style,
      }}
    >
      {selectable && (
        <span aria-hidden="true" style={{
          position: 'absolute', inset: 0, overflow: 'hidden',
          color: 'transparent', fontSize: 13, lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          WebkitUserSelect: 'text', userSelect: 'text',
          WebkitTouchCallout: 'default',
        }}>
          {' '.repeat(2000)}
        </span>
      )}
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

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 30 }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: LAVENDER_DEEP, fontWeight: 500, marginBottom: 6, textTransform: 'uppercase' }}>{eyebrow}</div>
      <div style={{ fontSize: 21, fontWeight: 600, color: TEXT_DARK, letterSpacing: 1 }}>{title}</div>
      <div style={{ width: 26, height: 2, background: LAVENDER, margin: '14px auto 0', borderRadius: 2 }} />
    </div>
  );
}

const CAL_YEAR = 2026, CAL_MONTH = 9, CAL_DAY = 13;

function CalendarGrid() {
  const first = new Date(CAL_YEAR, CAL_MONTH - 1, 1).getDay();
  const daysInMonth = new Date(CAL_YEAR, CAL_MONTH, 0).getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: '26px 18px', border: `1px solid ${LAVENDER}30`, boxShadow: `0 4px 20px ${LAVENDER}12` }}>
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, color: TEXT_DARK, marginBottom: 18, letterSpacing: 2 }}>
        {CAL_YEAR}. {String(CAL_MONTH).padStart(2, '0')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 6 }}>
        {weekdays.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: i === 0 ? '#e08ba0' : i === 6 ? '#8ba7e0' : TEXT_MUTE, paddingBottom: 8 }}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const isWedding = d === CAL_DAY;
          const col = i % 7;
          return (
            <div key={i} style={{ textAlign: 'center', padding: '3px 0' }}>
              {d !== null && (
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%',
                  background: isWedding ? `linear-gradient(135deg, ${LAVENDER}, ${LAVENDER_DEEP})` : 'transparent',
                  boxShadow: isWedding ? `0 3px 10px ${LAVENDER}55` : 'none',
                }}>
                  <span style={{
                    fontSize: 14, fontWeight: isWedding ? 700 : 400,
                    color: isWedding ? '#fff' : col === 0 ? '#e08ba0' : col === 6 ? '#8ba7e0' : TEXT_DARK,
                  }}>
                    {d}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const MARKER_LAT_OFFSET = 0.000205;
const MARKER_LNG_OFFSET = 0.00004244;

function KakaoMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(VENUE_LAT, VENUE_LNG),
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

  return <div ref={mapRef} style={{ width: '100%', height: 210, borderRadius: 16, overflow: 'hidden', border: `1px solid ${LAVENDER}30` }} />;
}

function NavAppButtons() {
  const buttons = [
    { label: '네이버지도에서 보기', href: 'https://naver.me/FHlgBdXp' },
    { label: '카카오맵에서 보기', href: 'https://place.map.kakao.com/8011957' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18 }}>
      {buttons.map(b => (
        <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" style={{
          padding: '10px 16px', borderRadius: 20, border: `1px solid ${LAVENDER}70`,
          color: TEXT_DARK, fontSize: 13.5, textDecoration: 'none', background: '#fff',
        }}>
          {b.label}
        </a>
      ))}
    </div>
  );
}

function MusicPill({ started, muted, onStart, onToggleMute }) {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 200 }}>
      <button
        onClick={started ? onToggleMute : onStart}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.95)', border: `1.5px solid ${LAVENDER}55`,
          borderRadius: 50, padding: started ? '11px' : '11px 18px 11px 14px',
          boxShadow: `0 6px 20px ${LAVENDER}35`,
        }}
      >
        <span style={{ fontSize: 17 }}>{!started ? '🎵' : muted ? '🔇' : '🔊'}</span>
        {!started && <span style={{ fontSize: 12.5, color: TEXT_DARK, fontWeight: 500 }}>배경음악 재생</span>}
      </button>
    </div>
  );
}

export default function Wedding() {
  const daysLeft = useDaysLeft(WEDDING_DATE);
  const [galleryExpanded, setGalleryExpanded] = useState(false);
  const [bgmStarted, setBgmStarted] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);

  useDocumentMeta({
    title: `${GROOM_FULL} ♥ ${BRIDE_FULL} 결혼식에 초대합니다`,
    description: `2026년 9월 13일 일요일 오후 4시 40분 · ${VENUE_NAME} ${VENUE_HALL}`,
    ogImage: '/images/wedding1_s.jpg',
  });

  const visibleImages = galleryExpanded ? GALLERY_IMAGES : GALLERY_IMAGES.slice(0, GALLERY_INITIAL);
  const musicSrc = bgmStarted
    ? `https://www.youtube.com/embed/${BGM_ID}?autoplay=1&mute=${bgmMuted ? 1 : 0}&loop=1&playlist=${BGM_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  return (
    <div
      onContextMenu={e => e.preventDefault()}
      style={{
        maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: CREAM,
        fontFamily: "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif", color: TEXT_DARK,
        WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
      }}
    >
      <style>{`
        img { -webkit-user-drag: none; user-drag: none; }
        @keyframes wd-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes wd-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wd-fade { animation: wd-fadeUp 0.9s ease forwards; }
        .wd-gallery-item {
          position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 10px;
          background: ${CREAM_DEEP};
        }
      `}</style>

      <StickyNav />

      {/* Hero */}
      <div id="wd-hero" style={{ position: 'relative', height: 520, overflow: 'hidden' }}>
        <ProtectedPhoto src="/images/wedding1_s.jpg" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(61,56,56,0.15) 0%, rgba(61,56,56,0.05) 40%, ${CREAM} 96%)` }} />
        <div style={{ position: 'absolute', bottom: 46, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 12, letterSpacing: 5, color: TEXT_DARK, opacity: 0.85, marginBottom: 14, fontWeight: 600 }}>WEDDING INVITATION</div>
          <div style={{ fontSize: 30, fontWeight: 500, color: TEXT_DARK, letterSpacing: 3, marginBottom: 10 }}>{GROOM_SHORT} · {BRIDE_SHORT}</div>
          <div style={{ fontSize: 14, color: TEXT_DARK, opacity: 0.9, letterSpacing: 1 }}>2026년 9월 13일 일요일 오후 4시 40분</div>
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: '#fff', letterSpacing: 2, animation: 'wd-bounce 1.8s ease-in-out infinite' }}>
          SCROLL
        </div>
      </div>

      {/* 메인 정보 */}
      <div className="wd-fade" style={{ padding: '30px 24px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1 }}>{GROOM_FULL} <span style={{ color: LAVENDER, fontWeight: 400 }}>그리고</span> {BRIDE_FULL}</div>
        <div style={{ fontSize: 14, color: TEXT_MUTE, marginTop: 10, lineHeight: 1.9 }}>
          2026년 9월 13일 일요일 오후 4시 40분<br />
          {VENUE_NAME} {VENUE_HALL}
        </div>
      </div>

      {/* 인사말 */}
      <div id="wd-greeting" style={{ padding: '54px 30px 50px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: 11, letterSpacing: 3, color: LAVENDER_DEEP, marginBottom: 20, textTransform: 'uppercase' }}>Invitation</div>
          <p style={{ fontSize: 15.5, lineHeight: 2.3, color: TEXT_DARK, margin: 0 }}>
            인생에서 가장 소중한 순간을<br />
            소중한 분들과 함께하고 싶습니다.
            <br /><br />
            함께해 주셔서<br />
            저희의 시작을 축복해 주세요.
          </p>
        </Reveal>
      </div>

      {/* 소개 */}
      <div id="wd-intro" style={{ padding: '40px 24px 50px', background: '#fff' }}>
        <SectionTitle eyebrow="Groom & Bride" title="신랑 · 신부 소개" />
        <Reveal>
          <div style={{ borderRadius: 18, overflow: 'hidden', margin: '0 auto 34px', maxWidth: 260, boxShadow: `0 8px 26px ${LAVENDER}25` }}>
            <ProtectedPhoto src="/images/wedding4_s.jpg" alt="커플 사진" style={{ width: '100%', height: 260 }} />
          </div>
        </Reveal>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
          <Reveal>
            <div style={{ width: 130, textAlign: 'center' }}>
              <div style={{ borderRadius: '50%', overflow: 'hidden', width: 88, height: 88, margin: '0 auto 14px', border: `2px solid ${LAVENDER}50` }}>
                <ProtectedPhoto src="/images/wedding2_s.jpg" alt="신랑" style={{ width: '100%', height: '100%' }} />
              </div>
              <div style={{ fontSize: 12, color: TEXT_MUTE, letterSpacing: 1, marginBottom: 4 }}>GROOM</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{GROOM_FULL}</div>
              <div style={{ fontSize: 12.5, color: TEXT_MUTE, lineHeight: 1.8 }}>김세형 · 박정순의<br />장남</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ width: 130, textAlign: 'center' }}>
              <div style={{ borderRadius: '50%', overflow: 'hidden', width: 88, height: 88, margin: '0 auto 14px', border: `2px solid ${LAVENDER}50` }}>
                <ProtectedPhoto src="/images/wedding3_s.jpg" alt="신부" style={{ width: '100%', height: '100%' }} />
              </div>
              <div style={{ fontSize: 12, color: TEXT_MUTE, letterSpacing: 1, marginBottom: 4 }}>BRIDE</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{BRIDE_FULL}</div>
              <div style={{ fontSize: 12.5, color: TEXT_MUTE, lineHeight: 1.8 }}>안준범 · 박재연의<br />장녀</div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 달력 */}
      <div id="wd-calendar" style={{ padding: '54px 24px 50px' }}>
        <SectionTitle eyebrow="Calendar" title="예식 날짜" />
        <Reveal>
          <CalendarGrid />
          <div style={{ textAlign: 'center', marginTop: 22, fontSize: 14.5, color: TEXT_DARK }}>
            {GROOM_SHORT} <span style={{ color: LAVENDER }}>♥</span> {BRIDE_SHORT} 결혼식까지{' '}
            <span style={{ fontWeight: 700, color: LAVENDER_DEEP, fontSize: 17 }}>{daysLeft > 0 ? daysLeft : 0}</span>일 남았습니다
          </div>
        </Reveal>
      </div>

      {/* 갤러리 */}
      <div id="wd-gallery" style={{ padding: '10px 24px 54px' }}>
        <SectionTitle eyebrow="Gallery"/>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {visibleImages.map((src) => (
            <div key={src} className="wd-gallery-item">
              <ProtectedPhoto src={src} alt="" fit="contain" bgColor={CREAM_DEEP} style={{ width: '100%', height: '100%' }} />
            </div>
          ))}
        </div>
        {!galleryExpanded && GALLERY_IMAGES.length > GALLERY_INITIAL && (
          <button
            onClick={() => setGalleryExpanded(true)}
            style={{
              display: 'block', margin: '20px auto 0', padding: '10px 26px', borderRadius: 20,
              border: `1px solid ${LAVENDER}60`, background: '#fff', color: TEXT_DARK, fontSize: 13.5, cursor: 'pointer',
            }}
          >
            사진 더 보기
          </button>
        )}
      </div>

      {/* 오시는 길 */}
      <div id="wd-location" style={{ padding: '10px 24px 54px', background: '#fff' }}>
        <SectionTitle eyebrow="Location" title="오시는 길" />
        <Reveal>
          <div style={{ marginBottom: 16 }}>
            <KakaoMap />
          </div>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{VENUE_NAME} {VENUE_HALL}</div>
            <div style={{ fontSize: 13.5, color: TEXT_MUTE }}>{VENUE_ADDR}</div>
          </div>
          <NavAppButtons />
          <div style={{ background: CREAM_DEEP, borderRadius: 14, padding: '18px 18px', fontSize: 13.5, color: TEXT_DARK, lineHeight: 2.1, marginTop: 22 }}>
            <span style={{ fontWeight: 600 }}>지하철</span>　5·9호선 여의도역 1번 출구<br />
            <span style={{ fontWeight: 600 }}>버스</span>　한국경제인협회 정류장 하차<br />
            <span style={{ fontWeight: 600 }}>주차</span>　지하 주차장 이용 (2시간 무료)
          </div>
        </Reveal>
      </div>

      {/* 계좌번호 */}
      <div id="wd-account" style={{ padding: '54px 24px 50px' }}>
        <SectionTitle eyebrow="Gift" title="마음 전하실 곳" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {['groom', 'bride'].map(side => (
            <div key={side} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                textAlign: 'center', padding: '9px 0', borderRadius: 12,
                background: `linear-gradient(135deg, ${LAVENDER}, ${LAVENDER_DEEP})`,
                color: '#fff', fontSize: 13.5, fontWeight: 600, letterSpacing: 0.5,
              }}>
                {ACCOUNTS[side].label}
              </div>
              {ACCOUNTS[side].accounts.map((acc, i) => (
                <div key={i} style={{ background: '#fff', border: `1px solid ${LAVENDER}25`, borderRadius: 12, padding: '12px 12px' }}>
                  <div style={{ fontSize: 12, color: TEXT_MUTE, marginBottom: 4 }}>{acc.name}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, wordBreak: 'break-all', marginBottom: 8 }}>{acc.bank}<br />{acc.account}</div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <CopyBtn text={acc.account} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 포토부스 안내 */}
      <div style={{ padding: '10px 24px 70px', textAlign: 'center' }}>
        <div style={{ fontSize: 17, color: TEXT_DARK, letterSpacing: 4, marginBottom: 20 }}>📸 P H O T O B O O T H 📸</div>
        <Reveal>
          <div style={{ background: `linear-gradient(135deg, ${CREAM_DEEP} 0%, #fff 100%)`, borderRadius: 20, padding: '30px 24px', border: `1px solid ${LAVENDER}30`, boxShadow: `0 6px 22px ${LAVENDER}15` }}>
            <p style={{ fontSize: 14.5, lineHeight: 2.1, color: TEXT_DARK, margin: 0 }}>
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
        </Reveal>
      </div>

      {/* 마무리 사진 */}
      <div style={{ padding: '0 24px 50px' }}>
        <Reveal>
          <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: `0 8px 26px ${LAVENDER}25`, aspectRatio: '4 / 5' }}>
            <ProtectedPhoto src="/images/wedding15_s.jpg" alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        </Reveal>
      </div>

      <MusicPill
        started={bgmStarted}
        muted={bgmMuted}
        onStart={() => setBgmStarted(true)}
        onToggleMute={() => setBgmMuted(m => !m)}
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
