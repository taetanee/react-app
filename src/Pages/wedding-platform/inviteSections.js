// 청첩장 본문 섹션 정의. 순서 변경 / 숨기기에 사용한다.
// invite.sectionOrder: 섹션 id 배열, invite.hiddenSections: 숨길 섹션 id 배열

export const SECTIONS = {
  wedding: [
    { id: 'greeting', label: '인사말' },
    { id: 'couple', label: '신랑 · 신부 소개' },
    { id: 'calendar', label: '예식 일시 · 달력' },
    { id: 'gallery', label: '갤러리' },
    { id: 'location', label: '오시는 길' },
    { id: 'contact', label: '연락하기' },
    { id: 'notice', label: '안내사항' },
    { id: 'account', label: '마음 전하실 곳' },
    { id: 'ending', label: '엔딩' },
  ],
  dol: [
    { id: 'greeting', label: '인사말' },
    { id: 'baby', label: '주인공 소개' },
    { id: 'calendar', label: '일시 · 달력' },
    { id: 'gallery', label: '성장 앨범' },
    { id: 'location', label: '오시는 길' },
    { id: 'contact', label: '연락하기' },
    { id: 'notice', label: '안내사항' },
    { id: 'account', label: '마음 전하실 곳' },
    { id: 'ending', label: '엔딩' },
  ],
};

const typeOf = (invite) => (invite?.eventType === 'dol' ? 'dol' : 'wedding');

export function sectionsFor(invite) {
  return SECTIONS[typeOf(invite)];
}

// 저장된 순서를 따르되, 없는 섹션은 지우고 새로 생긴 섹션은 뒤에 붙인다
export function resolveOrder(invite) {
  const ids = sectionsFor(invite).map(s => s.id);
  const saved = Array.isArray(invite?.sectionOrder) ? invite.sectionOrder.filter(id => ids.includes(id)) : [];
  return [...new Set([...saved, ...ids])];
}

export function isHidden(invite, id) {
  return Array.isArray(invite?.hiddenSections) && invite.hiddenSections.includes(id);
}
