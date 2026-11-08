import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvitePublic } from '../../api/weddingPlatform';
import { setPageMeta } from '../../utils/pageMeta';
import { useDaysLeft, CopyBtn, Reveal, SectionTitle, MusicPill, hexToAccent } from './InvitationView';
import { DOL_ACCENT } from './theme';

const CREAM = '#fffaf4';
const CREAM_DEEP = '#fbefe4';
const TEXT_DARK = '#3d3838';
const TEXT_MUTE = '#a89fa0';

const DEFAULT_GREETING = '저희 아이가 건강하게 자라\n첫 번째 생일을 맞이하게 되었습니다.\n\n소중한 분들을 모시고\n감사의 마음을 나누고자 합니다.\n오셔서 축복해 주시면 감사하겠습니다.';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 아기 이름이 아직 입력되지 않았으면 빈 문자열 (제목에 undefined가 찍히지 않게)
export const babyLabel = (invite) => (invite?.babyShort || invite?.babyName || '').trim();

function formatDateTime(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${DAYS[d.getDay()]}요일 ${d.getHours() < 12 ? '오전' : '오후'} ${((d.getHours() + 11) % 12) + 1}시${d.getMinutes() ? ` ${d.getMinutes()}분` : ''}`;
}

function formatDate(d) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function DolInvitationView() {
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
      title: babyLabel(invite) ? `${babyLabel(invite)}의 첫 번째 생일에 초대합니다` : '첫 번째 생일에 초대합니다',
      description: [invite.venueName, invite.venueHall].filter(Boolean).join(' ') || '돌잔치 초대장',
    });
  }, [invite]);

  const eventDate = invite?.eventDate ? new Date(invite.eventDate) : null;
  const birthDate = invite?.birthDate ? new Date(invite.birthDate) : null;
  const daysLeft = useDaysLeft(eventDate);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Gowun Dodum', sans-serif", color: TEXT_MUTE }}>
        초대장을 찾을 수 없습니다.
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

  const accent = hexToAccent(invite.accentColor || DOL_ACCENT);
  const baby = babyLabel(invite);
  const gallery = invite.gallery ?? [];
  const GALLERY_INITIAL = 8;
  const visibleImages = galleryExpanded ? gallery : gallery.slice(0, GALLERY_INITIAL);
  const accounts = invite.accounts ?? {};
  const accountSides = [['dad', '아빠'], ['mom', '엄마']].filter(([k]) => accounts[k]?.length > 0);
  const daysSinceBirth = birthDate && eventDate ? Math.floor((eventDate - birthDate) / 86400000) + 1 : null;
  const mapQuery = encodeURIComponent(invite.venueAddr || invite.venueName || '');

  const musicSrc = bgmStarted && invite.bgmYoutubeId
    ? `https://www.youtube.com/embed/${invite.bgmYoutubeId}?autoplay=1&mute=${bgmMuted ? 1 : 0}&loop=1&playlist=${invite.bgmYoutubeId}&controls=0&modestbranding=1&playsinline=1&rel=0`
    : null;

  const dateLabel = eventDate ? formatDateTime(eventDate) : '';

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: CREAM,
      fontFamily: "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif", color: TEXT_DARK,
    }}>
      <style>{`
        @keyframes dv-fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dv-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .dv-fade { animation: dv-fadeUp 0.9s ease forwards; }
        .dv-float { display: inline-block; animation: dv-float 3s ease-in-out infinite; }
        .dv-gallery-item { position: relative; width: 100%; aspect-ratio: 1 / 1; overflow: hidden; border-radius: 14px; background: ${CREAM_DEEP}; }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', height: gallery[0] ? 480 : 300, overflow: 'hidden', background: `linear-gradient(160deg, ${accent.base}55, ${CREAM})` }}>
        {gallery[0] && (
          <img src={gallery[0]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(61,56,56,0.05) 0%, rgba(61,56,56,0) 45%, ${CREAM} 96%)` }} />
        <div className="dv-fade" style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center' }}>
          <div className="dv-float" style={{ fontSize: 30, marginBottom: 6 }}>🎂</div>
          <div style={{ fontSize: 12, letterSpacing: 5, color: accent.deep, marginBottom: 12, fontWeight: 600 }}>FIRST BIRTHDAY</div>
          <div style={{ fontSize: 27, fontWeight: 600, color: TEXT_DARK, letterSpacing: 1, marginBottom: 10 }}>{baby ? `${baby}의 첫 번째 생일` : '첫 번째 생일'}</div>
          <div style={{ fontSize: 13.5, color: TEXT_DARK, opacity: 0.9, letterSpacing: 0.5 }}>{dateLabel}</div>
        </div>
      </div>

      {/* 인사말 */}
      <div style={{ padding: '40px 30px 36px', textAlign: 'center' }}>
        <Reveal>
          <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, marginBottom: 20, textTransform: 'uppercase' }}>Invitation</div>
          <p style={{ fontSize: 15.5, lineHeight: 2.2, color: TEXT_DARK, margin: 0, whiteSpace: 'pre-line' }}>
            {invite.greeting || DEFAULT_GREETING}
          </p>
        </Reveal>
      </div>

      {/* 주인공 */}
      <div style={{ padding: '0 24px 40px' }}>
        <Reveal>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 20px', textAlign: 'center', boxShadow: `0 6px 24px ${accent.base}25` }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: accent.deep, marginBottom: 10 }}>STAR OF THE DAY</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{invite.babyName}</div>
            {birthDate && <div style={{ fontSize: 13.5, color: TEXT_MUTE, marginTop: 6 }}>{formatDate(birthDate)} 태어났어요</div>}
            {(invite.fatherName || invite.motherName) && (
              <div style={{ fontSize: 14, marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${accent.base}60` }}>
                {invite.fatherName && <>아빠 <b>{invite.fatherName}</b></>}
                {invite.fatherName && invite.motherName && <span style={{ color: accent.base, margin: '0 8px' }}>·</span>}
                {invite.motherName && <>엄마 <b>{invite.motherName}</b></>}
              </div>
            )}
            {daysSinceBirth > 0 && (
              <div style={{ fontSize: 13, color: accent.deep, marginTop: 12 }}>돌잔치 날은 태어난 지 <b>{daysSinceBirth}</b>일째 되는 날이에요</div>
            )}
          </div>
        </Reveal>
      </div>

      {/* 일시 · 장소 */}
      <div style={{ padding: '40px 24px', background: '#fff' }}>
        <SectionTitle eyebrow="When & Where" title="일시 · 장소" accent={accent} />
        <Reveal>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, marginBottom: 14 }}>{dateLabel}</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{invite.venueName} {invite.venueHall}</div>
            <div style={{ fontSize: 13.5, color: TEXT_MUTE }}>{invite.venueAddr}</div>
            {mapQuery && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {[['네이버 지도', `https://map.naver.com/p/search/${mapQuery}`], ['카카오맵', `https://map.kakao.com/link/search/${mapQuery}`]].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 13, color: TEXT_DARK, textDecoration: 'none', padding: '7px 16px', borderRadius: 18, border: `1px solid ${accent.base}70`,
                  }}>{label}</a>
                ))}
              </div>
            )}
            {eventDate && (
              <div style={{ fontSize: 14.5, marginTop: 26 }}>
                {baby ? `${baby} 돌잔치까지` : '돌잔치까지'}{' '}
                <span style={{ fontWeight: 700, color: accent.deep, fontSize: 17 }}>{daysLeft > 0 ? daysLeft : 0}</span>일 남았어요
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* 성장 앨범 */}
      {gallery.length > 0 && (
        <div style={{ padding: '44px 24px 46px' }}>
          <SectionTitle eyebrow="Growing Up" title="성장 앨범" accent={accent} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {visibleImages.map((src) => (
              <div key={src} className="dv-gallery-item">
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
      {accountSides.length > 0 && (
        <div style={{ padding: '10px 24px 50px' }}>
          <SectionTitle eyebrow="Gift" title="마음 전하실 곳" accent={accent} />
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${accountSides.length}, 1fr)`, gap: 10 }}>
            {accountSides.map(([side, label]) => (
              <div key={side} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  textAlign: 'center', padding: '9px 0', borderRadius: 12,
                  background: `linear-gradient(135deg, ${accent.base}, ${accent.deep})`,
                  color: '#fff', fontSize: 13.5, fontWeight: 600, letterSpacing: 0.5,
                }}>
                  {label}
                </div>
                {accounts[side].map((acc, i) => (
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
          🎬 성장영상 보기
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
