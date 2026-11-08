import React from 'react';
import { Link } from 'react-router-dom';
import { LAVENDER, LAVENDER_DEEP, CREAM, CREAM_DEEP, TEXT_DARK, TEXT_MUTE, BORDER, FONT } from './theme';

// 네이버 스마트스토어 상품 주소. 값을 넣으면 "구매하기" 버튼이 나타납니다.
const SMARTSTORE_URL = '';

const SERIF = "'Gowun Batang', serif";

const FEATURES = [
  { icon: '💌', title: '모바일 청첩장', desc: '인사말, 예식 정보, 갤러리, 계좌번호 복사까지. 링크 하나로 전해요.' },
  { icon: '🎬', title: '식전영상', desc: '우리 사진과 배경음악으로 만드는 웨딩 필름. 청첩장 안에서 바로 재생돼요.' },
  { icon: '🎫', title: '종이청첩장 · 식권', desc: '마이페이지에서 샘플을 고르고 바로 주문할 수 있어요.' },
];

const DETAILS = [
  '카카오톡 공유 시 이름 · 날짜 · 대표 사진 미리보기',
  '계좌번호 원터치 복사',
  '배경음악 (유튜브) 설정',
  '사진 갤러리 직접 업로드',
  '예식 당일까지 D-day 표시',
  '언제든 직접 수정, 바로 반영',
];

const STEPS = [
  { title: '구매', desc: '네이버 스마트스토어에서 상품을 구매해요.' },
  { title: '계정 안내', desc: '마이페이지 아이디와 비밀번호를 보내드려요.' },
  { title: '직접 작성', desc: '마이페이지에서 내용과 사진을 채워요.' },
  { title: '링크 공유', desc: '완성된 링크를 카카오톡으로 보내면 끝!' },
];

function Eyebrow({ children, color = LAVENDER_DEEP }) {
  return <div style={{ fontSize: 11, letterSpacing: 3, color, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>{children}</div>;
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 26, fontWeight: 700, color: TEXT_DARK }}>{title}</h2>
    </div>
  );
}

// 히어로 오른쪽의 휴대폰 미리보기 (실제 청첩장 화면을 단순화한 목업)
function PhoneMockup() {
  return (
    <div style={{
      width: 230, height: 460, borderRadius: 36, background: '#1f1c1d', padding: 10,
      boxShadow: '0 30px 60px rgba(124,92,181,0.25)', flexShrink: 0,
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 28, background: CREAM, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          height: 220, background: `linear-gradient(160deg, ${LAVENDER} 0%, ${CREAM_DEEP} 100%)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 18, color: '#fff',
        }}>
          <div style={{ fontSize: 9, letterSpacing: 3, opacity: 0.9 }}>WEDDING INVITATION</div>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, marginTop: 6 }}>민준 ♥ 서연</div>
        </div>
        <div style={{ padding: '16px 18px', textAlign: 'center', color: TEXT_DARK }}>
          <div style={{ fontSize: 10.5, color: TEXT_MUTE }}>2027년 5월 22일 토요일 오후 1시</div>
          <div style={{ fontSize: 10.5, color: TEXT_MUTE, marginTop: 2 }}>더채플 그랜드홀</div>
          <div style={{ fontFamily: SERIF, fontSize: 11.5, lineHeight: 1.9, marginTop: 14 }}>
            서로의 이름을 부르며<br />평생을 약속하려 합니다.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginTop: 14 }}>
            {[0.55, 0.35, 0.45, 0.3, 0.5, 0.4].map((o, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 4, background: LAVENDER, opacity: o }} />
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 10.5, color: LAVENDER_DEEP, fontWeight: 600 }}>D-128</div>
        </div>
      </div>
    </div>
  );
}

function PrimaryLink({ href, to, children }) {
  const style = {
    display: 'inline-block', padding: '13px 28px', borderRadius: 999, textDecoration: 'none',
    background: `linear-gradient(135deg, ${LAVENDER}, ${LAVENDER_DEEP})`, color: '#fff', fontSize: 15, fontWeight: 600,
    boxShadow: '0 8px 20px rgba(124,92,181,0.25)',
  };
  return to ? <Link to={to} style={style}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer" style={style}>{children}</a>;
}

function SecondaryLink({ to, children }) {
  return (
    <Link to={to} style={{
      display: 'inline-block', padding: '12px 26px', borderRadius: 999, textDecoration: 'none',
      border: `1.5px solid ${LAVENDER}`, color: LAVENDER_DEEP, fontSize: 15, fontWeight: 600, background: '#fff',
    }}>{children}</Link>
  );
}

export default function IntroPage() {
  return (
    <div style={{ fontFamily: FONT, color: TEXT_DARK, background: CREAM, textAlign: 'left' }}>
      <style>{`
        .ip-wrap { max-width: 1040px; margin: 0 auto; padding: 0 24px; }
        .ip-hero { display: flex; align-items: center; justify-content: space-between; gap: 48px; padding: 72px 0 80px; }
        .ip-grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .ip-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 860px) {
          .ip-hero { flex-direction: column; text-align: center; padding: 48px 0 56px; gap: 40px; }
          .ip-hero-actions { justify-content: center; }
          .ip-grid4 { grid-template-columns: repeat(2, 1fr); }
          .ip-grid3 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .ip-grid4, .ip-grid3 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* 상단 바 */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: 'rgba(253,248,241,0.9)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(6px)' }}>
        <div className="ip-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58 }}>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: LAVENDER_DEEP }}>MyPad</div>
          <Link to="/mypage/login" style={{ fontSize: 13.5, color: TEXT_DARK, textDecoration: 'none', fontWeight: 600 }}>마이페이지 로그인</Link>
        </div>
      </header>

      {/* 히어로 */}
      <section className="ip-wrap">
        <div className="ip-hero">
          <div style={{ flex: 1 }}>
            <Eyebrow>Mobile Wedding Invitation</Eyebrow>
            <h1 style={{ margin: 0, fontFamily: SERIF, fontSize: 'clamp(30px, 5vw, 44px)', lineHeight: 1.35, fontWeight: 700 }}>
              우리의 시작을<br />가장 따뜻하게 전하는 방법
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: TEXT_MUTE, margin: '20px 0 32px' }}>
              모바일 청첩장부터 식전영상, 종이청첩장까지.<br />
              마이페이지에서 직접 만들고, 링크 하나로 소중한 분들께 보내세요.
            </p>
            <div className="ip-hero-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {SMARTSTORE_URL && <PrimaryLink href={SMARTSTORE_URL}>구매하기</PrimaryLink>}
              {SMARTSTORE_URL
                ? <SecondaryLink to="/mypage/login">마이페이지 로그인</SecondaryLink>
                : <PrimaryLink to="/mypage/login">마이페이지 로그인</PrimaryLink>}
            </div>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* 서비스 */}
      <section style={{ background: '#fff', padding: '72px 0' }}>
        <div className="ip-wrap">
          <SectionTitle eyebrow="Service" title="한 곳에서 모두 준비해요" />
          <div className="ip-grid3">
            {FEATURES.map(f => (
              <div key={f.title} style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '26px 20px' }}>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: TEXT_MUTE }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 */}
      <section style={{ padding: '72px 0' }}>
        <div className="ip-wrap">
          <SectionTitle eyebrow="Details" title="받는 분도, 보내는 분도 편하게" />
          <div className="ip-grid3">
            {DETAILS.map(d => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '15px 16px', fontSize: 14 }}>
                <span style={{ color: LAVENDER_DEEP, fontWeight: 700 }}>✓</span>{d}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section style={{ background: '#fff', padding: '72px 0' }}>
        <div className="ip-wrap">
          <SectionTitle eyebrow="How it works" title="이렇게 진행돼요" />
          <div className="ip-grid4">
            {STEPS.map((s, i) => (
              <div key={s.title} style={{ textAlign: 'center', padding: '8px 10px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', margin: '0 auto 14px',
                  background: i === STEPS.length - 1 ? LAVENDER_DEEP : LAVENDER, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16,
                }}>{i + 1}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: TEXT_MUTE }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 마무리 */}
      <section style={{ padding: '80px 0', textAlign: 'center', background: `linear-gradient(180deg, ${CREAM} 0%, ${CREAM_DEEP} 100%)` }}>
        <div className="ip-wrap">
          <h2 style={{ margin: 0, fontFamily: SERIF, fontSize: 26, fontWeight: 700 }}>이미 구매하셨나요?</h2>
          <p style={{ fontSize: 15, color: TEXT_MUTE, margin: '14px 0 28px', lineHeight: 1.8 }}>
            안내받은 아이디로 로그인하고 지금 바로 청첩장을 만들어 보세요.
          </p>
          <PrimaryLink to="/mypage/login">마이페이지 로그인</PrimaryLink>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '26px 0', textAlign: 'center', fontSize: 12.5, color: TEXT_MUTE }}>
        문의는 구매하신 네이버 스마트스토어 채팅으로 남겨주세요.<br />
        © MyPad
      </footer>
    </div>
  );
}
