// 모바일 청첩장 본문.
// 실제 공개 페이지(InvitationView)와 마이페이지 실시간 미리보기가 같이 쓴다.
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TEXT_DARK, TEXT_MUTE, DAYS, PreviewContext, useIsPreview,
  formatDateTime, parseDate, useDaysLeft, hexToAccent,
  CopyBtn, Reveal, SectionTitle, MusicPill,
} from './inviteParts';
import { resolveOrder, isHidden } from './inviteSections';

const PALETTE = { cream: '#fdf8f1', creamDeep: '#f6ece0', accent: '#a78bda' };

const nonEmpty = (list) => (Array.isArray(list) ? list.filter(i => (i?.title || '').trim() || (i?.desc || '').trim()) : []);
const parentName = (name, deceased) => (name ? `${deceased ? '故 ' : ''}${name}` : '');

// ───────────────────────── 공통 섹션 ─────────────────────────

function Block({ children, white, pad = '46px 24px' }) {
  return <div style={{ padding: pad, background: white ? '#fff' : 'transparent' }}>{children}</div>;
}

function Greeting({ text, accent }) {
  if (!text) return null;
  return (
    <Block pad="44px 30px 46px">
      <Reveal>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, marginBottom: 20, textTransform: 'uppercase' }}>Invitation</div>
          <p style={{ fontSize: 15.5, lineHeight: 2.2, color: TEXT_DARK, margin: 0, whiteSpace: 'pre-line' }}>{text}</p>
        </div>
      </Reveal>
    </Block>
  );
}

function MonthCalendar({ date, accent }) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div style={{ maxWidth: 320, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 600, marginBottom: 14, letterSpacing: 1 }}>{year}. {month + 1}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 8, textAlign: 'center', fontSize: 13.5 }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{ fontSize: 12, color: i === 0 ? '#d4766f' : TEXT_MUTE, paddingBottom: 6 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          const active = day === date.getDate();
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{
                width: 32, height: 32, lineHeight: '32px', borderRadius: '50%',
                background: active ? accent.base : 'transparent',
                color: active ? '#fff' : i % 7 === 0 ? '#d4766f' : TEXT_DARK,
                fontWeight: active ? 700 : 400,
              }}>{day ?? ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarSection({ date, accent, title, ddayText }) {
  const daysLeft = useDaysLeft(date);
  if (!date) return null;
  return (
    <Block white>
      <SectionTitle eyebrow="Calendar" title={title} accent={accent} />
      <Reveal>
        <div style={{ textAlign: 'center', fontSize: 14.5, marginTop: -12, marginBottom: 22 }}>{formatDateTime(date)}</div>
        <MonthCalendar date={date} accent={accent} />
        {daysLeft > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14.5 }}>
            {ddayText}{' '}
            <span style={{ fontWeight: 700, color: accent.deep, fontSize: 17 }}>{daysLeft}</span>일 남았습니다
          </div>
        )}
      </Reveal>
    </Block>
  );
}

function Lightbox({ images, index, onClose, onMove }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onMove]);
  const navBtn = { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 26, width: 44, height: 44, borderRadius: '50%', cursor: 'pointer' };
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={images[index]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '100%', maxHeight: '86vh', objectFit: 'contain' }} />
      <div style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 13 }}>{index + 1} / {images.length}</div>
      <button onClick={onClose} style={{ ...navBtn, top: 30, right: 16, transform: 'none', fontSize: 20 }} aria-label="닫기">✕</button>
      {images.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); onMove(-1); }} style={{ ...navBtn, left: 12 }} aria-label="이전">‹</button>
        <button onClick={e => { e.stopPropagation(); onMove(1); }} style={{ ...navBtn, right: 12 }} aria-label="다음">›</button>
      </>}
    </div>
  );
}

function Gallery({ images, accent, eyebrow, title, creamDeep }) {
  const preview = useIsPreview();
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(null);
  if (images.length === 0) return null;
  const INITIAL = 8;
  const visible = expanded ? images : images.slice(0, INITIAL);
  return (
    <Block>
      <SectionTitle eyebrow={eyebrow} title={title} accent={accent} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {visible.map((src, i) => (
          <div key={src + i} onClick={() => !preview && setOpen(i)} style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 12, background: creamDeep, cursor: preview ? 'default' : 'zoom-in' }}>
            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
      {!expanded && images.length > INITIAL && (
        <button onClick={() => setExpanded(true)} style={{
          display: 'block', margin: '20px auto 0', padding: '10px 26px', borderRadius: 20,
          border: `1px solid ${accent.base}60`, background: '#fff', color: TEXT_DARK, fontSize: 13.5, cursor: 'pointer',
        }}>사진 더 보기</button>
      )}
      {open != null && (
        <Lightbox
          images={images}
          index={open}
          onClose={() => setOpen(null)}
          onMove={(d) => setOpen(i => (i + d + images.length) % images.length)}
        />
      )}
    </Block>
  );
}

// 카카오 지도 (index.html 에서 SDK 를 autoload=false 로 불러온다). 실패하면 조용히 숨긴다.
function KakaoMap({ address, keyword }) {
  const ref = useRef(null);
  const [state, setState] = useState('loading');
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps || (!address && !keyword)) { setState('failed'); return undefined; }
    let cancelled = false;
    setState('loading');
    const timer = setTimeout(() => kakao.maps.load(() => {
      const show = (y, x) => {
        if (cancelled || !ref.current) return;
        const pos = new kakao.maps.LatLng(y, x);
        const map = new kakao.maps.Map(ref.current, { center: pos, level: 4 });
        map.setZoomable(false);
        new kakao.maps.Marker({ map, position: pos });
        setState('ok');
      };
      const byKeyword = () => {
        if (!keyword) { if (!cancelled) setState('failed'); return; }
        new kakao.maps.services.Places().keywordSearch(keyword, (res, status) => {
          if (status === kakao.maps.services.Status.OK && res[0]) show(res[0].y, res[0].x);
          else if (!cancelled) setState('failed');
        });
      };
      if (!address) { byKeyword(); return; }
      new kakao.maps.services.Geocoder().addressSearch(address, (res, status) => {
        if (status === kakao.maps.services.Status.OK && res[0]) show(res[0].y, res[0].x);
        else byKeyword();
      });
    }), 600); // 편집 중 타이핑마다 검색하지 않도록 잠깐 기다린다
    return () => { cancelled = true; clearTimeout(timer); };
  }, [address, keyword]);
  return (
    <div ref={ref} style={{
      height: state === 'failed' ? 0 : 220, borderRadius: 14, overflow: 'hidden', marginTop: state === 'failed' ? 0 : 18,
      background: '#eee', transition: 'height 0.2s',
    }} />
  );
}

function Location({ invite, accent }) {
  const transport = nonEmpty(invite.transport);
  const name = [invite.venueName, invite.venueHall].filter(Boolean).join(' ');
  if (!name && !invite.venueAddr) return null;
  const q = encodeURIComponent(invite.venueAddr || invite.venueName || '');
  const links = [
    ['네이버 지도', `https://map.naver.com/p/search/${q}`],
    ['카카오맵', `https://map.kakao.com/link/search/${q}`],
  ];
  return (
    <Block white>
      <SectionTitle eyebrow="Location" title="오시는 길" accent={accent} />
      <Reveal>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 13.5, color: TEXT_MUTE }}>{invite.venueAddr}</div>
        </div>
        <KakaoMap address={invite.venueAddr} keyword={invite.venueName} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {links.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 13, color: TEXT_DARK, textDecoration: 'none', padding: '7px 16px', borderRadius: 18, border: `1px solid ${accent.base}70`, background: '#fff',
            }}>{label}</a>
          ))}
          {invite.venueAddr && <CopyBtn text={invite.venueAddr} accent={accent} label="주소 복사" />}
        </div>
        {transport.length > 0 && (
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {transport.map((t, i) => (
              <div key={i} style={{ borderTop: i === 0 ? `1px solid ${accent.base}30` : 'none', paddingTop: i === 0 ? 20 : 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: accent.deep, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </Block>
  );
}

function Contact({ groups, accent }) {
  const visible = groups.map(g => ({ ...g, people: g.people.filter(p => (p.phone || '').trim()) })).filter(g => g.people.length > 0);
  if (visible.length === 0) return null;
  const btn = { fontSize: 12.5, padding: '6px 12px', borderRadius: 16, border: `1px solid ${accent.base}70`, color: TEXT_DARK, textDecoration: 'none', background: '#fff' };
  return (
    <Block>
      <SectionTitle eyebrow="Contact" title="연락하기" accent={accent} />
      <Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {visible.map(g => (
            <div key={g.title}>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent.deep, marginBottom: 8 }}>{g.title}</div>
              {g.people.map(p => {
                const tel = p.phone.replace(/[^0-9+]/g, '');
                return (
                  <div key={p.role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${accent.base}20` }}>
                    <div style={{ fontSize: 14 }}><span style={{ color: TEXT_MUTE, marginRight: 8 }}>{p.role}</span>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a href={`tel:${tel}`} style={btn}>📞 전화</a>
                      <a href={`sms:${tel}`} style={btn}>✉️ 문자</a>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Reveal>
    </Block>
  );
}

function Notice({ items, accent }) {
  const list = nonEmpty(items);
  if (list.length === 0) return null;
  return (
    <Block white>
      <SectionTitle eyebrow="Information" title="안내사항" accent={accent} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.map((n, i) => (
          <Reveal key={i}>
            <div style={{ border: `1px solid ${accent.base}35`, borderRadius: 14, padding: '18px 18px', background: '#fff' }}>
              {n.title && <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>{n.title}</div>}
              {n.desc && <div style={{ fontSize: 13.5, lineHeight: 1.9, whiteSpace: 'pre-line', textAlign: 'center' }}>{n.desc}</div>}
            </div>
          </Reveal>
        ))}
      </div>
    </Block>
  );
}

function AccountGroup({ label, list, accent, collapsed }) {
  const [open, setOpen] = useState(!collapsed);
  useEffect(() => setOpen(!collapsed), [collapsed]);
  return (
    <div style={{ border: `1px solid ${accent.base}35`, borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px',
        border: 'none', cursor: 'pointer', fontSize: 14.5, fontWeight: 600, color: TEXT_DARK, fontFamily: 'inherit',
        background: `${accent.base}18`,
      }}>
        <span>{label} 계좌번호</span>
        <span style={{ fontSize: 12, color: accent.deep, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {open && list.map((acc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '13px 18px', borderTop: `1px solid ${accent.base}20` }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: TEXT_MUTE, marginBottom: 3 }}>{acc.name}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, wordBreak: 'break-all' }}>{acc.bank} {acc.account}</div>
          </div>
          <CopyBtn text={acc.account} accent={accent} />
        </div>
      ))}
    </div>
  );
}

function Accounts({ groups, accent, collapsed }) {
  const visible = groups.filter(g => g.list.some(a => (a.account || '').trim()));
  if (visible.length === 0) return null;
  return (
    <Block>
      <SectionTitle eyebrow="Gift" title="마음 전하실 곳" accent={accent} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map(g => (
          <AccountGroup key={g.label} label={g.label} list={g.list.filter(a => (a.account || '').trim())} accent={accent} collapsed={collapsed} />
        ))}
      </div>
    </Block>
  );
}

function Ending({ invite, accent }) {
  if (!invite.endingText && !invite.endingImage) return null;
  return (
    <Block pad="20px 24px 50px">
      <Reveal>
        {invite.endingImage && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 22 }}>
            <img src={invite.endingImage} alt="" style={{ width: '100%', display: 'block' }} />
          </div>
        )}
        {invite.endingText && (
          <p style={{ fontSize: 15, lineHeight: 2.1, textAlign: 'center', margin: 0, whiteSpace: 'pre-line', color: TEXT_DARK }}>
            {invite.endingText}
          </p>
        )}
        <div style={{ width: 26, height: 2, background: accent.base, margin: '26px auto 0', borderRadius: 2 }} />
      </Reveal>
    </Block>
  );
}

// ───────────────────────── 결혼식 전용 ─────────────────────────

function weddingSides(invite) {
  const p = invite.parents ?? {};
  const c = invite.contacts ?? {};
  const a = invite.accounts ?? {};
  const sides = [
    {
      key: 'groom', label: '신랑', side: '신랑측', name: invite.groomFull, short: invite.groomShort || invite.groomFull,
      father: p.groom?.father, fatherDeceased: p.groom?.fatherDeceased, mother: p.groom?.mother, motherDeceased: p.groom?.motherDeceased,
      relation: p.groom?.relation || '아들',
      phones: { self: c.groom, father: c.groomFather, mother: c.groomMother },
      accounts: a.groom ?? [],
    },
    {
      key: 'bride', label: '신부', side: '신부측', name: invite.brideFull, short: invite.brideShort || invite.brideFull,
      father: p.bride?.father, fatherDeceased: p.bride?.fatherDeceased, mother: p.bride?.mother, motherDeceased: p.bride?.motherDeceased,
      relation: p.bride?.relation || '딸',
      phones: { self: c.bride, father: c.brideFather, mother: c.brideMother },
      accounts: a.bride ?? [],
    },
  ];
  return invite.brideFirst ? sides.reverse() : sides;
}

function WeddingHero({ invite, sides, date, accent, cream }) {
  const cover = invite.gallery?.[0];
  return (
    <div style={{ position: 'relative', height: cover ? 460 : 260, overflow: 'hidden', background: accent.base }}>
      {cover && <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(61,56,56,0.15) 0%, rgba(61,56,56,0.05) 40%, ${cream} 96%)` }} />
      <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 12, letterSpacing: 5, opacity: 0.85, marginBottom: 14, fontWeight: 600 }}>WEDDING INVITATION</div>
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: 3, marginBottom: 10 }}>{sides[0].short} · {sides[1].short}</div>
        <div style={{ fontSize: 13.5, opacity: 0.9, letterSpacing: 1 }}>{date ? formatDateTime(date) : ''}</div>
        <div style={{ fontSize: 13.5, opacity: 0.9, marginTop: 4 }}>{[invite.venueName, invite.venueHall].filter(Boolean).join(' ')}</div>
      </div>
    </div>
  );
}

function Couple({ sides, accent }) {
  if (!sides.some(s => s.name)) return null;
  return (
    <Block white pad="40px 24px">
      <Reveal>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          {sides.map(s => {
            const parents = [parentName(s.father, s.fatherDeceased), parentName(s.mother, s.motherDeceased)].filter(Boolean);
            return (
              <div key={s.key} style={{ fontSize: 15.5, textAlign: 'center' }}>
                {parents.length > 0 && (
                  <>
                    <span>{parents.join(' · ')}</span>
                    <span style={{ color: TEXT_MUTE, fontSize: 13.5 }}> 의 {s.relation} </span>
                  </>
                )}
                {parents.length === 0 && <span style={{ color: TEXT_MUTE, fontSize: 13.5, marginRight: 6 }}>{s.label}</span>}
                <b style={{ fontSize: 17 }}>{parents.length > 0 ? s.short : s.name}</b>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', color: accent.base, marginTop: 16, fontSize: 18 }}>♥</div>
      </Reveal>
    </Block>
  );
}

function WeddingBody({ invite, slug }) {
  const pal = PALETTE;
  const accent = hexToAccent(invite.accentColor, pal.accent);
  const date = parseDate(invite.weddingDate);
  const sides = weddingSides(invite);

  const render = {
    greeting: () => <Greeting text={invite.greeting} accent={accent} />,
    couple: () => <Couple sides={sides} accent={accent} />,
    calendar: () => <CalendarSection date={date} accent={accent} title="예식 일시" ddayText={`${sides[0].short || ''} ♥ ${sides[1].short || ''} 결혼식까지`} />,
    gallery: () => <Gallery images={invite.gallery ?? []} accent={accent} eyebrow="Gallery" creamDeep={pal.creamDeep} />,
    location: () => <Location invite={invite} accent={accent} />,
    contact: () => (
      <Contact accent={accent} groups={sides.map(s => ({
        title: s.side,
        people: [
          { role: s.label, name: s.name, phone: s.phones.self },
          !s.fatherDeceased && { role: '아버지', name: s.father, phone: s.phones.father },
          !s.motherDeceased && { role: '어머니', name: s.mother, phone: s.phones.mother },
        ].filter(Boolean),
      }))} />
    ),
    notice: () => <Notice items={invite.notices} accent={accent} />,
    account: () => <Accounts accent={accent} collapsed={invite.accountsCollapsed} groups={sides.map(s => ({ label: s.side, list: s.accounts }))} />,
    ending: () => <Ending invite={invite} accent={accent} />,
  };

  return (
    <Shell invite={invite} accent={accent} pal={pal} slug={slug} videoLabel="🎬 식전영상 보기"
      hero={<WeddingHero invite={invite} sides={sides} date={date} accent={accent} cream={pal.cream} />}
      render={render} />
  );
}

// ───────────────────────── 공통 틀 ─────────────────────────

function Shell({ invite, accent, pal, slug, hero, render, videoLabel }) {
  const preview = useIsPreview();
  const [bgmStarted, setBgmStarted] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const musicSrc = !preview && bgmStarted && invite.bgmYoutubeId
    ? `https://www.youtube.com/embed/${invite.bgmYoutubeId}?autoplay=1&mute=${bgmMuted ? 1 : 0}&loop=1&playlist=${invite.bgmYoutubeId}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: preview ? 0 : '100vh', background: pal.cream,
      fontFamily: "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif", color: TEXT_DARK, textAlign: 'left',
    }}>
      <style>{`
        @keyframes ic-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .ic-float { display: inline-block; animation: ic-float 3s ease-in-out infinite; }
      `}</style>

      {hero}
      {resolveOrder(invite).filter(id => !isHidden(invite, id)).map(id => (
        <React.Fragment key={id}>{render[id]?.()}</React.Fragment>
      ))}

      {slug && (
        <div style={{ padding: '10px 24px 40px', textAlign: 'center' }}>
          {preview
            ? <span style={{ fontSize: 13, color: accent.deep }}>{videoLabel}</span>
            : <Link to={`/invite/video/${slug}`} style={{ fontSize: 13, color: accent.deep, textDecoration: 'none' }}>{videoLabel}</Link>}
        </div>
      )}

      {!preview && invite.bgmYoutubeId && (
        <MusicPill started={bgmStarted} muted={bgmMuted} onStart={() => setBgmStarted(true)} onToggleMute={() => setBgmMuted(m => !m)} accent={accent} />
      )}
      {musicSrc && (
        <iframe key={bgmMuted ? 'm' : 'u'} title="배경음악" src={musicSrc} allow="autoplay; encrypted-media"
          style={{ position: 'fixed', bottom: 0, right: 0, width: 1, height: 1, opacity: 0, border: 'none', pointerEvents: 'none' }} />
      )}
    </div>
  );
}

export default function InvitationContent({ invite, slug, preview = false }) {
  return (
    <PreviewContext.Provider value={preview}>
      <WeddingBody invite={invite} slug={slug} />
    </PreviewContext.Provider>
  );
}
