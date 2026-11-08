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
import InvitationContent from './InvitationContent';
import { SECTIONS, resolveOrder, isHidden } from './inviteSections';

const TABS = [
  { id: 'invite', label: '모바일 청첩장' },
  { id: 'video', label: '식전영상' },
  { id: 'paper', label: '종이청첩장 신청' },
  { id: 'meal', label: '식권 신청' },
];

const WEDDING_ACCENT = '#a78bda';

const EMPTY_PARENT = { father: '', fatherDeceased: false, mother: '', motherDeceased: false, relation: '' };

const EMPTY_INVITE = {
  eventType: 'wedding',
  groomFull: '', brideFull: '', groomShort: '', brideShort: '',
  brideFirst: false,
  parents: { groom: { ...EMPTY_PARENT }, bride: { ...EMPTY_PARENT } },
  weddingDate: '',
  venueName: '', venueHall: '', venueAddr: '',
  transport: [],
  contacts: { groom: '', bride: '', groomFather: '', groomMother: '', brideFather: '', brideMother: '' },
  greeting: '', accentColor: WEDDING_ACCENT, bgmYoutubeId: '',
  accounts: { groom: [], bride: [] },
  accountsCollapsed: false,
  gallery: [],
  notices: [],
  endingText: '', endingImage: '',
  sectionOrder: [], hiddenSections: [],
};

// 서버에 저장된 값(예전 형식 포함)을 편집기 형식으로 맞춘다
function normalizeInvite(saved = {}) {
  return {
    ...EMPTY_INVITE,
    ...saved,
    eventType: 'wedding',
    parents: {
      groom: { ...EMPTY_PARENT, ...(saved.parents?.groom ?? {}) },
      bride: { ...EMPTY_PARENT, ...(saved.parents?.bride ?? {}) },
    },
    contacts: { ...EMPTY_INVITE.contacts, ...(saved.contacts ?? {}) },
    accounts: { groom: [], bride: [], ...(saved.accounts ?? {}) },
    gallery: saved.gallery ?? [],
    transport: saved.transport ?? [],
    notices: saved.notices ?? [],
    sectionOrder: saved.sectionOrder ?? [],
    hiddenSections: saved.hiddenSections ?? [],
  };
}

const ACCENT_PRESETS = ['#a78bda', '#e79aa8', '#f2a7a0', '#d9a45b', '#8fb39a', '#7fa3c9', '#9a8f86'];

const GREETING_SAMPLES = [
  '인생에서 가장 소중한 순간을\n소중한 분들과 함께하고 싶습니다.\n\n함께해 주셔서\n저희의 시작을 축복해 주세요.',
  '서로 다른 길을 걸어온 두 사람이\n이제 같은 길을 함께 걸어가려 합니다.\n\n귀한 걸음 하시어\n축복해 주시면 감사하겠습니다.',
  '봄날의 햇살처럼 따뜻한 사람을 만나\n평생을 약속하려 합니다.\n\n저희 두 사람의 새로운 시작을\n함께 지켜봐 주세요.',
];

const EMPTY_VIDEO = {
  titleLine1: '', titleLine2: '', dateLabel: '', slideMs: 4000, songIds: '',
};

const smallBtn = { border: `1px solid ${BORDER}`, background: '#fff', borderRadius: 8, padding: '5px 10px', fontSize: 12.5, cursor: 'pointer', color: TEXT_MUTE, fontFamily: FONT };
const addBtn = { border: `1px dashed ${BORDER}`, background: '#fff', borderRadius: 8, padding: '7px 12px', fontSize: 12.5, cursor: 'pointer', color: TEXT_MUTE, fontFamily: FONT };
const removeBtn = { border: 'none', background: 'none', color: '#c2185b', cursor: 'pointer', fontSize: 13, flexShrink: 0, fontFamily: FONT };

function Section({ title, desc, children, right }) {
  return (
    <div style={{ ...cardStyle, marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: desc ? 4 : 12, gap: 10 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT_DARK }}>{title}</div>
        {right}
      </div>
      {desc && <div style={{ fontSize: 12, color: TEXT_MUTE, marginBottom: 12, lineHeight: 1.6 }}>{desc}</div>}
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

function Check({ checked, onChange, children }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: TEXT_DARK, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} style={{ accentColor: LAVENDER_DEEP }} />
      {children}
    </label>
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

// ───────────────────────── 청첩장 편집 부품 ─────────────────────────

function AccountEditor({ label, list, onChange }) {
  const update = (idx, key, value) => onChange(list.map((a, i) => (i === idx ? { ...a, [key]: value } : a)));
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_MUTE, marginBottom: 8 }}>{label}</div>
      {list.map((acc, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} placeholder="예금주" value={acc.name} onChange={e => update(i, 'name', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} placeholder="은행" value={acc.bank} onChange={e => update(i, 'bank', e.target.value)} />
          <input style={{ ...inputStyle, flex: 1.4, minWidth: 0 }} placeholder="계좌번호" value={acc.account} onChange={e => update(i, 'account', e.target.value)} />
          <button onClick={() => onChange(list.filter((_, idx) => idx !== i))} style={removeBtn}>삭제</button>
        </div>
      ))}
      <button onClick={() => onChange([...list, { name: '', bank: '', account: '' }])} style={addBtn}>+ {label} 계좌 추가</button>
    </div>
  );
}

// 제목 + 내용 목록 (교통 안내, 안내사항)
function TitledListEditor({ items, onChange, titlePlaceholder, descPlaceholder, addLabel, max = 10 }) {
  const update = (idx, key, value) => onChange(items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  const move = (idx, d) => {
    const j = idx + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 10, marginBottom: 8, background: '#fcfbfd' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 0 }} placeholder={titlePlaceholder} value={it.title} onChange={e => update(i, 'title', e.target.value)} />
            <button onClick={() => move(i, -1)} disabled={i === 0} style={smallBtn} aria-label="위로">↑</button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={smallBtn} aria-label="아래로">↓</button>
            <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={removeBtn}>삭제</button>
          </div>
          <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical', fontFamily: FONT }} placeholder={descPlaceholder} value={it.desc} onChange={e => update(i, 'desc', e.target.value)} />
        </div>
      ))}
      {items.length < max && (
        <button onClick={() => onChange([...items, { title: '', desc: '' }])} style={addBtn}>+ {addLabel}</button>
      )}
    </div>
  );
}

function useUpload(onUploaded) {
  const [uploading, setUploading] = useState(false);
  const handle = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await uploadImage(file));
      onUploaded(urls);
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };
  return [uploading, handle];
}

function UploadButton({ uploading, onChange, multiple, children }) {
  return (
    <label style={{ ...addBtn, display: 'inline-block' }}>
      {uploading ? '업로드 중...' : children}
      <input type="file" accept="image/*" multiple={multiple} onChange={onChange} disabled={uploading} style={{ display: 'none' }} />
    </label>
  );
}

function GalleryEditor({ gallery, onChange }) {
  const [uploading, handle] = useUpload(urls => onChange([...gallery, ...urls]));
  const move = (idx, d) => {
    const j = idx + d;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const tiny = { width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11, cursor: 'pointer', padding: 0 };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 8, marginBottom: 10 }}>
        {gallery.map((url, i) => (
          <div key={url + i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: '#eee' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {i === 0 && <span style={{ position: 'absolute', left: 4, bottom: 4, fontSize: 10.5, color: '#fff', background: LAVENDER_DEEP, borderRadius: 6, padding: '1px 6px' }}>대표</span>}
            <div style={{ position: 'absolute', top: 3, right: 3, display: 'flex', gap: 3 }}>
              {i > 0 && <button onClick={() => move(i, -1)} style={tiny} aria-label="앞으로">‹</button>}
              {i < gallery.length - 1 && <button onClick={() => move(i, 1)} style={tiny} aria-label="뒤로">›</button>}
              <button onClick={() => onChange(gallery.filter((_, idx) => idx !== i))} style={tiny} aria-label="삭제">✕</button>
            </div>
          </div>
        ))}
      </div>
      <UploadButton uploading={uploading} onChange={handle} multiple>+ 사진 추가 (여러 장 선택 가능)</UploadButton>
    </div>
  );
}

function ParentsEditor({ label, value, onChange, relationPlaceholder }) {
  const set = (key, v) => onChange({ ...value, [key]: v });
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_MUTE, marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, alignItems: 'center', marginBottom: 6 }}>
        <input style={inputStyle} placeholder="아버지 성함" value={value.father} onChange={e => set('father', e.target.value)} />
        <Check checked={value.fatherDeceased} onChange={v => set('fatherDeceased', v)}>故</Check>
        <input style={inputStyle} placeholder="어머니 성함" value={value.mother} onChange={e => set('mother', e.target.value)} />
        <Check checked={value.motherDeceased} onChange={v => set('motherDeceased', v)}>故</Check>
      </div>
      <input style={inputStyle} placeholder={relationPlaceholder} value={value.relation} onChange={e => set('relation', e.target.value)} />
    </div>
  );
}

function SectionOrderEditor({ invite, onChange }) {
  const order = resolveOrder(invite);
  const labels = Object.fromEntries(SECTIONS.map(s => [s.id, s.label]));
  const move = (idx, d) => {
    const j = idx + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({ sectionOrder: next });
  };
  const toggle = (id, visible) => {
    const hidden = new Set(invite.hiddenSections);
    if (visible) hidden.delete(id); else hidden.add(id);
    onChange({ hiddenSections: [...hidden] });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {order.map((id, i) => {
        const visible = !isHidden(invite, id);
        return (
          <div key={id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
            border: `1px solid ${BORDER}`, background: visible ? '#fff' : '#f6f4f7',
          }}>
            <Check checked={visible} onChange={v => toggle(id, v)}>
              <span style={{ color: visible ? TEXT_DARK : TEXT_MUTE, textDecoration: visible ? 'none' : 'line-through' }}>{labels[id]}</span>
            </Check>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={smallBtn} aria-label="위로">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === order.length - 1} style={smallBtn} aria-label="아래로">↓</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EndingImageEditor({ value, onChange }) {
  const [uploading, handle] = useUpload(urls => onChange(urls[0]));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {value && <img src={value} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />}
      <UploadButton uploading={uploading} onChange={handle}>{value ? '사진 바꾸기' : '+ 엔딩 사진 (선택)'}</UploadButton>
      {value && <button onClick={() => onChange('')} style={removeBtn}>삭제</button>}
    </div>
  );
}

// ───────────────────────── 청첩장 편집 탭 ─────────────────────────

function InviteTab({ me, invite, setInvite }) {
  const publicUrl = `https://mypad.kr/invite/${me.slug}`;

  const update = (key, value) => setInvite(prev => ({ ...prev, [key]: value }));
  const patch = (obj) => setInvite(prev => ({ ...prev, ...obj }));
  const setContact = (key, value) => setInvite(prev => ({ ...prev, contacts: { ...prev.contacts, [key]: value } }));
  const setParents = (side, value) => setInvite(prev => ({ ...prev, parents: { ...prev.parents, [side]: value } }));

  const sides = [['groom', '신랑'], ['bride', '신부']];

  return (
    <div>
      <Section title="공개 링크 (하객에게 공유)" desc="저장한 뒤 이 링크를 카카오톡으로 보내면 이름 · 날짜 · 대표 사진이 미리보기로 나와요.">
        <CopyLink url={publicUrl} />
      </Section>

          <Section title="신랑 · 신부" right={<Check checked={invite.brideFirst} onChange={v => update('brideFirst', v)}>신부 먼저 표시</Check>}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="신랑 이름"><input style={inputStyle} value={invite.groomFull} onChange={e => update('groomFull', e.target.value)} /></Field>
              <Field label="신부 이름"><input style={inputStyle} value={invite.brideFull} onChange={e => update('brideFull', e.target.value)} /></Field>
              <Field label="신랑 애칭(짧은 이름)"><input style={inputStyle} value={invite.groomShort} onChange={e => update('groomShort', e.target.value)} /></Field>
              <Field label="신부 애칭(짧은 이름)"><input style={inputStyle} value={invite.brideShort} onChange={e => update('brideShort', e.target.value)} /></Field>
            </div>
          </Section>

          <Section title="혼주 (부모님)" desc="고인이신 경우 故 에 체크하면 이름 앞에 故 가 붙고, 연락하기에서는 빠져요.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <ParentsEditor label="신랑측" value={invite.parents.groom} onChange={v => setParents('groom', v)} relationPlaceholder="관계 (예: 장남, 차남) · 비우면 '아들'" />
              <ParentsEditor label="신부측" value={invite.parents.bride} onChange={v => setParents('bride', v)} relationPlaceholder="관계 (예: 장녀, 차녀) · 비우면 '딸'" />
            </div>
          </Section>

          <Section title="예식 일시 · 장소">
            <Field label="예식 일시">
              <input type="datetime-local" style={inputStyle} value={invite.weddingDate} onChange={e => update('weddingDate', e.target.value)} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="예식장 이름"><input style={inputStyle} value={invite.venueName} onChange={e => update('venueName', e.target.value)} /></Field>
              <Field label="홀 이름"><input style={inputStyle} value={invite.venueHall} onChange={e => update('venueHall', e.target.value)} /></Field>
            </div>
            <Field label="예식장 주소 (도로명 주소를 넣으면 지도가 표시돼요)"><input style={inputStyle} value={invite.venueAddr} onChange={e => update('venueAddr', e.target.value)} /></Field>
          </Section>

      <Section title="교통 안내" desc="오시는 길 아래에 표시돼요. (최대 10개)">
        <TitledListEditor
          items={invite.transport}
          onChange={v => update('transport', v)}
          titlePlaceholder="예: 지하철"
          descPlaceholder={'예: 5·9호선 여의도역 1번 출구 도보 5분'}
          addLabel="교통 안내 추가"
        />
      </Section>

      <Section title="연락처" desc="입력한 번호만 '연락하기'에 전화 · 문자 버튼으로 표시돼요.">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {sides.map(([side, label]) => (
              <div key={side}>
                <Field label={label}><input style={inputStyle} inputMode="tel" placeholder="010-0000-0000" value={invite.contacts[side]} onChange={e => setContact(side, e.target.value)} /></Field>
                <Field label={`${label} 아버지`}><input style={inputStyle} inputMode="tel" value={invite.contacts[`${side}Father`]} onChange={e => setContact(`${side}Father`, e.target.value)} /></Field>
                <Field label={`${label} 어머니`}><input style={inputStyle} inputMode="tel" value={invite.contacts[`${side}Mother`]} onChange={e => setContact(`${side}Mother`, e.target.value)} /></Field>
              </div>
            ))}
          </div>
      </Section>

      <Section title="인사말" right={(
        <select
          value=""
          onChange={e => { if (e.target.value !== '') update('greeting', GREETING_SAMPLES[Number(e.target.value)]); }}
          style={{ ...inputStyle, width: 'auto', padding: '5px 8px', fontSize: 12.5 }}
        >
          <option value="">샘플 문구 넣기</option>
          {GREETING_SAMPLES.map((g, i) => <option key={i} value={i}>{g.split('\n')[0]}</option>)}
        </select>
      )}>
        <textarea
          style={{ ...inputStyle, minHeight: 120, resize: 'vertical', fontFamily: FONT }}
          value={invite.greeting}
          onChange={e => update('greeting', e.target.value)}
          placeholder={'예) 인생에서 가장 소중한 순간을\n소중한 분들과 함께하고 싶습니다.'}
        />
      </Section>

      <Section title="갤러리 사진" desc="첫 번째 사진이 대표 사진(맨 위 · 카카오톡 미리보기)으로 쓰여요. ‹ › 로 순서를 바꿀 수 있어요.">
        <GalleryEditor gallery={invite.gallery} onChange={g => update('gallery', g)} />
      </Section>

      <Section title="계좌번호" right={<Check checked={invite.accountsCollapsed} onChange={v => update('accountsCollapsed', v)}>처음엔 접어두기</Check>}>
        {[['groom', '신랑측'], ['bride', '신부측']].map(([side, label]) => (
          <AccountEditor key={side} label={label} list={invite.accounts[side]} onChange={list => update('accounts', { ...invite.accounts, [side]: list })} />
        ))}
      </Section>

      <Section title="안내사항" desc="식사, 주차, 화환, 피로연 등 하객에게 알릴 내용을 카드로 보여줘요.">
        <TitledListEditor
          items={invite.notices}
          onChange={v => update('notices', v)}
          titlePlaceholder="예: 식사 안내"
          descPlaceholder={'예: 예식 후 2층 연회장에서 뷔페가 준비되어 있습니다.'}
          addLabel="안내사항 추가"
        />
      </Section>

      <Section title="엔딩" desc="청첩장 맨 마지막에 보여줄 사진과 문구예요.">
        <EndingImageEditor value={invite.endingImage} onChange={v => update('endingImage', v)} />
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical', fontFamily: FONT, marginTop: 10 }}
          value={invite.endingText}
          onChange={e => update('endingText', e.target.value)}
          placeholder={'예) 저희의 새로운 시작을\n함께 축복해 주셔서 감사합니다.'}
        />
      </Section>

      <Section title="섹션 순서 · 표시" desc="체크를 끄면 그 섹션이 숨겨져요. 화살표로 순서를 바꿀 수 있어요.">
        <SectionOrderEditor invite={invite} onChange={patch} />
      </Section>

      <Section title="포인트 색상">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {ACCENT_PRESETS.map(c => (
            <button key={c} onClick={() => update('accentColor', c)} aria-label={c} style={{
              width: 30, height: 30, borderRadius: '50%', background: c, cursor: 'pointer',
              border: invite.accentColor === c ? `3px solid ${TEXT_DARK}` : '3px solid #fff', boxShadow: `0 0 0 1px ${BORDER}`,
            }} />
          ))}
          <input type="color" value={invite.accentColor || WEDDING_ACCENT} onChange={e => update('accentColor', e.target.value)} style={{ width: 36, height: 30, border: 'none', background: 'none', cursor: 'pointer' }} />
        </div>
      </Section>

      <Section title="배경음악" desc="유튜브 주소나 영상 ID를 넣으세요. 하객이 '배경음악 재생'을 누르면 재생돼요.">
        <input
          style={inputStyle}
          placeholder="예: https://youtu.be/h-XrgiZiQgw"
          value={invite.bgmYoutubeId}
          onChange={e => update('bgmYoutubeId', youtubeId(e.target.value))}
        />
      </Section>
    </div>
  );
}

// 유튜브 주소를 붙여넣어도 영상 ID만 남긴다
function youtubeId(value) {
  const m = value.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : value.trim();
}

// ───────────────────────── 식전영상 설정 ─────────────────────────

function VideoTab({ me, invite, video, setVideo }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const publicUrl = `https://mypad.kr/invite/video/${me.slug}`;

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

// ───────────────────────── 실시간 미리보기 ─────────────────────────

function PhonePreview({ invite, slug }) {
  return (
    <div style={{
      width: 380, height: '100%', borderRadius: 34, background: '#1f1c1d', padding: 9,
      boxShadow: '0 20px 50px rgba(124,92,181,0.2)', boxSizing: 'border-box',
    }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 26, overflowY: 'auto', overflowX: 'hidden', background: '#fff' }}>
        <InvitationContent invite={invite} slug={slug} preview />
      </div>
    </div>
  );
}

function MobilePreviewOverlay({ invite, slug, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, fontFamily: FONT }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK }}>미리보기</span>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 14, color: LAVENDER_DEEP, cursor: 'pointer', fontFamily: FONT }}>닫기 ✕</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <InvitationContent invite={invite} slug={slug} preview />
      </div>
    </div>
  );
}

function SaveBar({ dirty, saving, savedAt, onSave, onPreview }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 40, marginTop: 6, padding: '12px 0 16px',
      background: `linear-gradient(to top, ${CREAM} 75%, rgba(253,248,241,0))`,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="mp-preview-btn" onClick={onPreview} style={{
          flex: '0 0 auto', padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${LAVENDER}`, background: '#fff',
          color: LAVENDER_DEEP, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT,
        }}>미리보기</button>
        <button onClick={onSave} disabled={saving || !dirty} style={{ ...primaryButtonStyle(saving || !dirty), flex: 1 }}>
          {saving ? '저장 중...' : dirty ? '저장하기' : savedAt ? '저장되었습니다 ✓' : '변경사항 없음'}
        </button>
      </div>
      {dirty && <div style={{ fontSize: 12, color: '#c2185b', marginTop: 6, textAlign: 'center' }}>저장하지 않은 변경사항이 있어요</div>}
    </div>
  );
}

// ───────────────────────── 대시보드 ─────────────────────────

export default function MyPageDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [invite, setInvite] = useState(EMPTY_INVITE);
  const [savedInvite, setSavedInvite] = useState(EMPTY_INVITE);
  const [video, setVideo] = useState(EMPTY_VIDEO);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('invite');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const dirty = JSON.stringify(invite) !== JSON.stringify(savedInvite);

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
        const loaded = normalizeInvite(meData.invite);
        setInvite(loaded);
        setSavedInvite(loaded);
        setVideo({ ...EMPTY_VIDEO, ...meData.video });
        await loadOrders();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate, loadOrders]);

  // 저장하지 않고 나가려 하면 경고
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveInvite(invite);
      setSavedInvite(invite);
      setSavedAt(Date.now());
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (dirty && !window.confirm('저장하지 않은 변경사항이 있어요. 로그아웃할까요?')) return;
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

  const isInviteTab = tab === 'invite';
  const width = isInviteTab ? 1120 : 640;

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: FONT, textAlign: 'left' }}>
      <style>{`
        .mp-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: 32px; }
        .mp-side { display: none; }
        @media (min-width: 1000px) {
          .mp-layout.with-preview { grid-template-columns: minmax(0, 1fr) 380px; }
          .mp-layout.with-preview .mp-side { display: block; }
          .mp-preview-btn { display: none; }
        }
      `}</style>

      <div style={{
        position: 'sticky', top: 0, zIndex: 50, background: 'rgba(253,248,241,0.96)',
        borderBottom: `1px solid ${BORDER}`, backdropFilter: 'blur(6px)',
      }}>
        <div style={{ maxWidth: width, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK }}>{me.customerName || me.loginId}님의 마이페이지</div>
          <button onClick={handleLogout} style={{ border: 'none', background: 'none', color: TEXT_MUTE, fontSize: 13, cursor: 'pointer' }}>로그아웃</button>
        </div>
        <div style={{ maxWidth: width, margin: '0 auto', display: 'flex', overflowX: 'auto', padding: '0 12px', boxSizing: 'border-box' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: '0 0 auto', border: 'none', background: 'none', cursor: 'pointer',
                padding: '10px 14px', fontSize: 13.5, whiteSpace: 'nowrap', fontFamily: FONT,
                color: tab === t.id ? LAVENDER_DEEP : TEXT_MUTE,
                fontWeight: tab === t.id ? 700 : 500,
                borderBottom: tab === t.id ? `2px solid ${LAVENDER_DEEP}` : '2px solid transparent',
              }}
            >
              {t.label}
              {t.id === 'invite' && dirty && <span style={{ color: '#c2185b' }}> •</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: width, margin: '0 auto', padding: '24px 20px 40px', boxSizing: 'border-box' }}>
        <div className={`mp-layout${isInviteTab ? ' with-preview' : ''}`}>
          <div>
            {isInviteTab && (
              <>
                <InviteTab me={me} invite={invite} setInvite={setInvite} />
                <SaveBar dirty={dirty} saving={saving} savedAt={savedAt} onSave={handleSave} onPreview={() => setShowPreview(true)} />
              </>
            )}
            {tab === 'video' && <VideoTab me={me} invite={savedInvite} video={video} setVideo={setVideo} />}
            {tab === 'paper' && (
              <SampleOrderTab productType="PAPER_INVITATION" samples={PAPER_INVITATION_SAMPLES} orders={orders} onOrderCreated={loadOrders} />
            )}
            {tab === 'meal' && (
              <SampleOrderTab productType="MEAL_TICKET" samples={MEAL_TICKET_SAMPLES} orders={orders} onOrderCreated={loadOrders} />
            )}
          </div>
          {isInviteTab && (
            <div className="mp-side">
              <div style={{ position: 'sticky', top: 120, height: 'calc(100vh - 150px)', maxHeight: 820 }}>
                <div style={{ fontSize: 12.5, color: TEXT_MUTE, textAlign: 'center', marginBottom: 8 }}>실시간 미리보기 · 저장 전 내용도 바로 보여요</div>
                <div style={{ height: 'calc(100% - 26px)' }}>
                  <PhonePreview invite={invite} slug={me.slug} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreview && <MobilePreviewOverlay invite={invite} slug={me.slug} onClose={() => setShowPreview(false)} />}
    </div>
  );
}
