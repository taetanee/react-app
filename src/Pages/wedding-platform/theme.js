export const LAVENDER = '#a78bda';
export const LAVENDER_DEEP = '#7c5cb5';
export const CREAM = '#fdf8f1';
export const CREAM_DEEP = '#f6ece0';
export const TEXT_DARK = '#3d3838';
export const TEXT_MUTE = '#8d8488';
export const BORDER = '#e7e0ec';
export const DANGER = '#c2185b';

export const FONT = "'Gowun Dodum', 'Apple SD Gothic Neo', sans-serif";

export const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px 14px',
  fontSize: 14,
  borderRadius: 10,
  border: `1.5px solid ${BORDER}`,
  outline: 'none',
  fontFamily: FONT,
  color: TEXT_DARK,
  background: '#fff',
};

export const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  color: TEXT_MUTE,
  fontWeight: 600,
  marginBottom: 6,
};

export const primaryButtonStyle = (disabled) => ({
  width: '100%',
  padding: '12px 0',
  borderRadius: 10,
  border: 'none',
  background: disabled ? '#c9bfe0' : `linear-gradient(135deg, ${LAVENDER}, ${LAVENDER_DEEP})`,
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  fontFamily: FONT,
});

export const cardStyle = {
  background: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: 14,
  padding: 18,
};
