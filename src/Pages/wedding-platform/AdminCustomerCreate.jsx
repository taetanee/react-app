import React, { useState } from 'react';
import { adminCreateCustomer } from '../../api/weddingPlatform';
import { CREAM, LAVENDER_DEEP, TEXT_DARK, TEXT_MUTE, FONT, inputStyle, labelStyle, primaryButtonStyle, cardStyle } from './theme';

const ADMIN_KEY_STORAGE = 'wedding_admin_key';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminCustomerCreate() {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem(ADMIN_KEY_STORAGE) || '');
  const [form, setForm] = useState({ loginId: '', password: '', slug: '', customerName: '', phone: '', naverOrderNo: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminKey.trim() || !form.loginId.trim() || !form.password.trim()) {
      setError('관리자 키, 아이디, 비밀번호는 필수입니다.');
      return;
    }
    setError('');
    setResult(null);
    setSubmitting(true);
    try {
      sessionStorage.setItem(ADMIN_KEY_STORAGE, adminKey.trim());
      const created = await adminCreateCustomer(adminKey.trim(), form);
      setResult(created);
      setForm({ loginId: '', password: '', slug: '', customerName: '', phone: '', naverOrderNo: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM, fontFamily: FONT, padding: '40px 20px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ fontSize: 13, letterSpacing: 2, color: LAVENDER_DEEP, fontWeight: 600, marginBottom: 6 }}>ADMIN</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: TEXT_DARK, marginBottom: 20 }}>고객 계정 발급</div>

        <form onSubmit={handleSubmit} style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}>
          <Field label="관리자 키">
            <input style={inputStyle} type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} />
          </Field>
          <Field label="아이디 (고객에게 전달)">
            <input style={inputStyle} value={form.loginId} onChange={e => update('loginId', e.target.value)} />
          </Field>
          <Field label="비밀번호 (고객에게 전달)">
            <input style={inputStyle} value={form.password} onChange={e => update('password', e.target.value)} />
          </Field>
          <Field label="공개 URL 슬러그 (선택, 비우면 아이디 사용)">
            <input style={inputStyle} value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="mypad.kr/invite/이값" />
          </Field>
          <Field label="고객명">
            <input style={inputStyle} value={form.customerName} onChange={e => update('customerName', e.target.value)} />
          </Field>
          <Field label="연락처">
            <input style={inputStyle} value={form.phone} onChange={e => update('phone', e.target.value)} />
          </Field>
          <Field label="네이버 스마트스토어 주문번호">
            <input style={inputStyle} value={form.naverOrderNo} onChange={e => update('naverOrderNo', e.target.value)} />
          </Field>

          {error && <div style={{ fontSize: 13, color: '#c2185b', marginBottom: 12 }}>{error}</div>}

          <button type="submit" disabled={submitting} style={primaryButtonStyle(submitting)}>
            {submitting ? '생성 중...' : '계정 생성'}
          </button>
        </form>

        {result && (
          <div style={{ ...cardStyle, marginTop: 16, fontSize: 13.5, lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: TEXT_DARK }}>생성 완료</div>
            <div>아이디: <b>{result.loginId}</b></div>
            <div>마이페이지: <b>mypad.kr/mypage/login</b></div>
            <div>공개 청첩장: <b>mypad.kr/invite/{result.slug}</b></div>
            <div style={{ color: TEXT_MUTE, marginTop: 8 }}>위 정보를 고객에게 전달하세요.</div>
          </div>
        )}
      </div>
    </div>
  );
}
