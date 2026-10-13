import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getToken } from '../../api/weddingPlatform';
import { CREAM, LAVENDER_DEEP, TEXT_DARK, TEXT_MUTE, FONT, inputStyle, labelStyle, primaryButtonStyle, cardStyle } from './theme';

export default function MyPageLogin() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (getToken()) navigate('/mypage', { replace: true });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId.trim() || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(loginId.trim(), password);
      navigate('/mypage', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, letterSpacing: 2, color: LAVENDER_DEEP, fontWeight: 600, marginBottom: 6 }}>WEDDING MYPAGE</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEXT_DARK }}>마이페이지 로그인</div>
          <div style={{ fontSize: 13, color: TEXT_MUTE, marginTop: 8 }}>
            네이버 스마트스토어 구매 후 안내받은<br />아이디와 비밀번호로 로그인하세요.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>아이디</label>
            <input style={inputStyle} value={loginId} onChange={e => setLoginId(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label style={labelStyle}>비밀번호</label>
            <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div style={{ fontSize: 13, color: '#c2185b' }}>{error}</div>}
          <button type="submit" disabled={loading} style={primaryButtonStyle(loading)}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: TEXT_MUTE }}>
          계정 정보를 받지 못하셨다면 구매하신 스마트스토어 채팅으로 문의해주세요.
        </div>
      </div>
    </div>
  );
}
