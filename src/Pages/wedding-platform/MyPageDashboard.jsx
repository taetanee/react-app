import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getToken, getMe, logout, saveInvite, saveVideo, uploadImage, createOrder, listMyOrders,
} from '../../api/weddingPlatform';
import {
  CREAM, LAVENDER, LAVENDER_DEEP, TEXT_DARK, TEXT_MUTE, BORDER, FONT,
  inputStyle, labelStyle, primaryButtonStyle, cardStyle,
} from './theme';
import { PAPER_INVITATION_SAMPLES, MEAL_TICKET_SAMPLES, ORDER_STATUS_LABEL } from './sampleCatalog';

const TABS = [
  { id: 'invite', label: '모바일 청첩장' },
  { id: 'video', label: '식전영상' },
  { id: 'paper', label: '종이청첩장 신청' },
  { id: 'meal', label: '식권 신청' },
];

const EMPTY_INVITE = {
  groomFull: '', brideFull: '', groomShort: '', brideShort: '',
  weddingDate: '', venueName: '', venueHall: '', venueAddr: '',
  greeting: '', accentColor: '#a78bda', bgmYoutubeId: '',
  accounts: { groom: [], bride: [] },
  gallery: [],
};

const EMPTY_VIDEO = {
  titleLine1: '', titleLine2: '', dateLabel: '', slideMs: 4000, songIds: '',
};

function Section({ title, children, right }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function CopyLink({ url }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: LAVENDER_DEEP, wordBreak: 'break-all' }}>{url}</a>
      <button
        onClick={() => { navigator.clipboard.writeText(url).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }); }}
        style={{ border: `1px solid ${LAVENDER}70`, background: '#fff', borderRadius: 14, padding: '3px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
      >
        {done ? '복사됨' : '복사'}
      </button>
    </div>
  );
}

// ───────────────────────── 청첩장 편집 ─────────────────────────

function AccountEditor({ side, label, list, onChange }) {
  const update = (idx, key, value) => {
    const next = list.map((a, i) => (i === idx ? { ...a, [key]: value } : a));
    onChange(next);
  };
  const add = () => onChange([...list, { name: '', bank: '', account: '' }]);
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_MUTE, marginBottom: 8 }}>{label}</div>
      {list.map((acc, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="이름" value={acc.name} onChange={e => update(i, 'name', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1 }} placeholder="은행" value={acc.bank} onChange={e => update(i, 'bank', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1.4 }} placeholder="계좌번호" value={acc.account} onChange={e => update(i, 'account', e.target.value)} />
          <button onClick={() => remove(i)} style={{ border: 'none', background: 'none', color: '#c2185b', cursor: 'pointer', fontSize: 13 }}>삭제</button>
        </div>
      ))}
      <button onClick={add} style={{ border: `1px dashed ${BORDER}`, background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 12.5, cursor: 'pointer', color: TEXT_MUTE }}>
        + {label} 계좌 추가
      </button>
    </div>
  );
}

function GalleryEditor({ gallery, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange([...gallery, url]);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  const remove = (i) => onChange(gallery.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        {gallery.map((url, i) => (
          <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => remove(i)} style={{
              position: 'absolute', top: 2, right: 2, width: 20, height: 20, borderRadius: '50%',
              border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, cursor: 'pointer',
            }}>✕</button>
          </div>
        ))}
      </div>
      <label style={{
        display: 'inline-block', border: `1px dashed ${BORDER}`, borderRadius: 8, padding: '8px 14px',
        fontSize: 12.5, color: TEXT_MUTE, cursor: 'pointer', background: '#fff',
      }}>
        {uploading ? '업로드 중...' : '+ 사진 추가'}
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: 'none' }} />
      </label>
    </div>
  );
}

function InviteTab({ me, invite, setInvite }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const publicUrl = `https://mypad.kr/invite/${me.slug}`;

  const update = (key, value) => setInvite(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveInvite(invite);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Section title="공개 링크 (하객에게 공유)">
        <CopyLink url={publicUrl} />
      </Section>

      <Section title="신랑 · 신부 정보">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="신랑 이름"><input style={inputStyle} value={invite.groomFull} onChange={e => update('groomFull', e.target.value)} /></Field>
          <Field label="신부 이름"><input style={inputStyle} value={invite.brideFull} onChange={e => update('brideFull', e.target.value)} /></Field>
          <Field label="신랑 애칭(짧은 이름)"><input style={inputStyle} value={invite.groomShort} onChange={e => update('groomShort', e.target.value)} /></Field>
          <Field label="신부 애칭(짧은 이름)"><input style={inputStyle} value={invite.brideShort} onChange={e => update('brideShort', e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="예식 정보">
        <Field label="예식 일시">
          <input type="datetime-local" style={inputStyle} value={invite.weddingDate} onChange={e => update('weddingDate', e.target.value)} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="예식장 이름"><input style={inputStyle} value={invite.venueName} onChange={e => update('venueName', e.target.value)} /></Field>
          <Field label="홀 이름"><input style={inputStyle} value={invite.venueHall} onChange={e => update('venueHall', e.target.value)} /></Field>
        </div>
        <Field label="예식장 주소"><input style={inputStyle} value={invite.venueAddr} onChange={e => update('venueAddr', e.target.value)} /></Field>
      </Section>

      <Section title="인사말">
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: FONT }}
          value={invite.greeting}
          onChange={e => update('greeting', e.target.value)}
          placeholder={'예) 인생에서 가장 소중한 순간을\n소중한 분들과 함께하고 싶습니다.'}
        />
      </Section>

      <Section title="갤러리 사진">
        <GalleryEditor gallery={invite.gallery} onChange={g => update('gallery', g)} />
      </Section>

      <Section title="계좌번호">
        <AccountEditor side="groom" label="신랑측" list={invite.accounts.groom} onChange={list => update('accounts', { ...invite.accounts, groom: list })} />
        <AccountEditor side="bride" label="신부측" list={invite.accounts.bride} onChange={list => update('accounts', { ...invite.accounts, bride: list })} />
      </Section>

      <Section title="배경음악 (유튜브 영상 ID)">
        <input style={inputStyle} placeholder="예: h-XrgiZiQgw" value={invite.bgmYoutubeId} onChange={e => update('bgmYoutubeId', e.target.value)} />
      </Section>

      <button onClick={handleSave} disabled={saving} style={primaryButtonStyle(saving)}>
        {saving ? '저장 중...' : saved ? '저장되었습니다 ✓' : '저장하기'}
      </button>
    </div>
  );
}

// ───────────────────────── 식전영상 설정 ─────────────────────────

function VideoTab({ me, invite, video, setVideo }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const publicUrl = `https://mypad.kr/invite/${me.slug}/video`;

  const update = (key, value) => setVideo(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveVideo(video);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Section title="미리보기 링크">
        <CopyLink url={publicUrl} />
      </Section>

      <div style={{ fontSize: 12.5, color: TEXT_MUTE, marginBottom: 18, lineHeight: 1.7 }}>
        식전영상 슬라이드는 <b>모바일 청첩장의 갤러리 사진</b>을 그대로 사용합니다.
        현재 {invite.gallery.length}장의 사진이 등록되어 있어요. 사진을 추가/변경하려면 "모바일 청첩장" 탭을 이용해주세요.
      </div>

      <Section title="화면 텍스트">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="첫째 줄 (보통 신랑 애칭)"><input style={inputStyle} value={video.titleLine1} onChange={e => update('titleLine1', e.target.value)} /></Field>
          <Field label="둘째 줄 (보통 신부 애칭)"><input style={inputStyle} value={video.titleLine2} onChange={e => update('titleLine2', e.target.value)} /></Field>
        </div>
        <Field label="날짜 라벨">
          <input style={inputStyle} placeholder="예: 2026. 9. 13" value={video.dateLabel} onChange={e => update('dateLabel', e.target.value)} />
        </Field>
      </Section>

      <Section title="슬라이드 속도 (밀리초)">
        <input type="number" min={1000} step={500} style={inputStyle} value={video.slideMs} onChange={e => update('slideMs', Number(e.target.value))} />
      </Section>

      <Section title="배경음악 (유튜브 영상 ID, 콤마로 여러 개 가능)">
        <input style={inputStyle} placeholder="예: sSvAFjpLaGA,08Ndzf5-HxI" value={video.songIds} onChange={e => update('songIds', e.target.value)} />
      </Section>

      <button onClick={handleSave} disabled={saving} style={primaryButtonStyle(saving)}>
        {saving ? '저장 중...' : saved ? '저장되었습니다 ✓' : '저장하기'}
      </button>
    </div>
  );
}

// ───────────────────────── 샘플 신청 (종이청첩장 / 식권) ─────────────────────────

function SampleOrderTab({ productType, samples, orders, onOrderCreated }) {
  const [selected, setSelected] = useState(samples[0]?.code ?? '');
  const [quantity, setQuantity] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shippingAddr, setShippingAddr] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myOrders = orders.filter(o => o.productType === productType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || !recipientName.trim() || !recipientPhone.trim() || !shippingAddr.trim()) {
      alert('샘플 선택, 받는 분 이름/연락처/주소는 필수입니다.');
      return;
    }
    setSubmitting(true);
    try {
      await createOrder({
        productType, sampleCode: selected, quantity,
        recipientName, recipientPhone, shippingAddr, memo,
      });
      setMemo('');
      await onOrderCreated();
      alert('신청이 접수되었습니다. 확인 후 순차적으로 발주 진행해드릴게요.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Section title="샘플 선택">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {samples.map(s => (
            <label key={s.code} style={{
              border: `2px solid ${selected === s.code ? LAVENDER_DEEP : BORDER}`,
              borderRadius: 12, padding: 10, cursor: 'pointer', background: '#fff',
            }}>
              <input type="radio" name="sample" value={s.code} checked={selected === s.code} onChange={() => setSelected(s.code)} style={{ display: 'none' }} />
              <div style={{ width: '100%', aspectRatio: '4/3', borderRadius: 8, background: s.color, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>{s.name}</div>
              <div style={{ fontSize: 11.5, color: TEXT_MUTE, marginTop: 2 }}>{s.desc}</div>
            </label>
          ))}
        </div>
      </Section>

      <form onSubmit={handleSubmit}>
        <Section title="신청 정보">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Field label="수량"><input type="number" min={1} style={inputStyle} value={quantity} onChange={e => setQuantity(Number(e.target.value))} /></Field>
            <Field label="받는 분 이름"><input style={inputStyle} value={recipientName} onChange={e => setRecipientName(e.target.value)} /></Field>
          </div>
          <Field label="받는 분 연락처"><input style={inputStyle} value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} /></Field>
          <Field label="배송 주소"><input style={inputStyle} value={shippingAddr} onChange={e => setShippingAddr(e.target.value)} /></Field>
          <Field label="요청사항 (선택)">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical', fontFamily: FONT }} value={memo} onChange={e => setMemo(e.target.value)} />
          </Field>
        </Section>
        <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
          {submitting ? '신청 중...' : '샘플 신청하기'}
        </button>
      </form>

      <Section title="나의 신청 내역">
        {myOrders.length === 0 ? (
          <div style={{ fontSize: 13, color: TEXT_MUTE }}>아직 신청 내역이 없습니다.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myOrders.map(o => (
              <div key={o.idx} style={{ ...cardStyle, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>{o.sampleCode} · {o.quantity}개</div>
                  <div style={{ fontSize: 11.5, color: TEXT_MUTE, marginTop: 2 }}>{o.cDate}</div>
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600, color: LAVENDER_DEEP, background: '#f3edfb',
                  borderRadius: 20, padding: '4px 12px',
                }}>
                  {ORDER_STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ───────────────────────── 대시보드 ─────────────────────────

export default function MyPageDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [invite, setInvite] = useState(EMPTY_INVITE);
  const [video, setVideo] = useState(EMPTY_VIDEO);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('invite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setOrders(await listMyOrders());
    } catch (err) {
      // 주문 조회 실패는 치명적이지 않으므로 무시
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      navigate('/mypage/login', { replace: true });
      return;
    }
    (async () => {
      try {
        const meData = await getMe();
        setMe(meData);
        setInvite({
          ...EMPTY_INVITE,
          ...meData.invite,
          accounts: { groom: [], bride: [], ...(meData.invite?.accounts ?? {}) },
          gallery: meData.invite?.gallery ?? [],
        });
        setVideo({ ...EMPTY_VIDEO, ...meData.video });
        await loadOrders();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, loadOrders]);

  const handleLogout = async () => {
    await logout();
    navigate('/mypage/login', { replace: true });
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: TEXT_MUTE }}>불러오는 중...</div>;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, gap: 12 }}>
        <div style={{ color: '#c2185b', fontSize: 14 }}>{error}</div>
        <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: LAVENDER_DEEP, cursor: 'pointer', fontSize: 13 }}>다시 로그인하기</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: FONT }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, background: 'rgba(253,248,241,0.96)',
        borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(6px)',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK }}>{me.customerName || me.loginId}님의 마이페이지</div>
          </div>
          <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: TEXT_MUTE, fontSize: 13, cursor: 'pointer' }}>로그아웃</button>
        </div>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 12px' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: '0 0 auto', border: 'none', background: 'none', cursor: 'pointer',
                padding: '10px 14px', fontSize: 13.5, whiteSpace: 'nowrap',
                color: tab === t.id ? LAVENDER_DEEP : TEXT_MUTE,
                fontWeight: tab === t.id ? 700 : 500,
                borderBottom: tab === t.id ? `2px solid ${LAVENDER_DEEP}` : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
        {tab === 'invite' && <InviteTab me={me} invite={invite} setInvite={setInvite} />}
        {tab === 'video' && <VideoTab me={me} invite={invite} video={video} setVideo={setVideo} />}
        {tab === 'paper' && (
          <SampleOrderTab productType="PAPER_INVITATION" samples={PAPER_INVITATION_SAMPLES} orders={orders} onOrderCreated={loadOrders} />
        )}
        {tab === 'meal' && (
          <SampleOrderTab productType="MEAL_TICKET" samples={MEAL_TICKET_SAMPLES} orders={orders} onOrderCreated={loadOrders} />
        )}
      </div>
    </div>
  );
}

