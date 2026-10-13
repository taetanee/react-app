// 종이청첩장 / 식권 샘플 카탈로그 (정적 데이터)
// imageUrl을 지정하면 사진으로, 없으면 색상 플레이스홀더로 표시됩니다.

export const PAPER_INVITATION_SAMPLES = [
  { code: 'PI-01', name: '카드형 · 아이보리', desc: '심플한 단색 카드, 금박 글자', color: '#f3ece0' },
  { code: 'PI-02', name: '카드형 · 라벤더', desc: '은은한 라벤더 톤, 리본 포인트', color: '#ded4ef' },
  { code: 'PI-03', name: '접지형 · 크림', desc: '3단 접지, 내지 포켓 포함', color: '#f6f1e4' },
  { code: 'PI-04', name: '접지형 · 그레이', desc: '모던 그레이, 음각 타이포', color: '#e2e2e4' },
  { code: 'PI-05', name: '박지형 · 화이트골드', desc: '전체 금박 테두리, 고급 재질', color: '#efe9da' },
  { code: 'PI-06', name: '엽서형 · 베이지', desc: '포토 엽서 스타일, 심플 타이포', color: '#ece3d3' },
];

export const MEAL_TICKET_SAMPLES = [
  { code: 'MT-01', name: '티켓형 · 클래식', desc: '티켓 절취선, 번호 인쇄', color: '#f1e5d8' },
  { code: 'MT-02', name: '티켓형 · 블랙골드', desc: '블랙 바탕 금박 테두리', color: '#d9d4cf' },
  { code: 'MT-03', name: '카드형 · 미니멀', desc: '성함/인원 기입란 포함', color: '#eef0e9' },
  { code: 'MT-04', name: '카드형 · 플로럴', desc: '은은한 꽃 일러스트 배경', color: '#f3e7ec' },
];

export const PRODUCT_TYPE_LABEL = {
  PAPER_INVITATION: '종이청첩장',
  MEAL_TICKET: '식권',
};

export const ORDER_STATUS_LABEL = {
  REQUESTED: '신청 접수',
  CONFIRMED: '확인중',
  ORDERED: '발주 완료',
  SHIPPED: '배송중',
  DONE: '완료',
  CANCELED: '취소됨',
};
