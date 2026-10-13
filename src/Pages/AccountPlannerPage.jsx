import React, { useState } from "react";

// ── 질문 ─────────────────────────────────────────────────────
const QUESTIONS = [
    {
        key: 'horizon',
        title: '이 돈은 언제 쓸 건가요?',
        options: [
            { key: 'retire', label: '노후 자금', sub: '55세 이후에 쓸 돈' },
            { key: 'mid', label: '3~5년 뒤', sub: '결혼·집·목돈 마련' },
            { key: 'anytime', label: '언제든 꺼낼 수 있게', sub: '비상금 성격' },
        ],
    },
    {
        key: 'income',
        title: '연말정산(종합소득세) 하는 소득이 있나요?',
        options: [
            { key: 'low', label: '있음 · 연봉 5,500만원 이하', sub: '세액공제율 16.5%' },
            { key: 'high', label: '있음 · 연봉 5,500만원 초과', sub: '세액공제율 13.2%' },
            { key: 'none', label: '없음', sub: '학생·전업주부 등' },
        ],
    },
    {
        key: 'asset',
        title: '주로 무엇에 투자하나요?',
        options: [
            { key: 'etf', label: '미국 지수 ETF', sub: 'S&P500·나스닥100 등' },
            { key: 'us', label: '미국 개별 주식', sub: '애플·엔비디아 등 직접 매수' },
            { key: 'kr', label: '국내 주식', sub: '삼성전자·코스피 ETF 등' },
            { key: 'safe', label: '예금·채권', sub: '안정적인 이자 수익' },
        ],
    },
    {
        key: 'amount',
        title: '한 달에 얼마나 투자하나요?',
        options: [
            { key: 50, label: '50만원 이하' },
            { key: 100, label: '50~150만원' },
            { key: 200, label: '150~250만원' },
            { key: 300, label: '250만원 이상' },
        ],
    },
];

const ACCOUNT = {
    pension: { label: '연금저축', color: '#8e44ad', cap: 50 },
    irp: { label: 'IRP', color: '#2e86ab', cap: 25 },
    isa: { label: 'ISA (중개형)', color: '#1a7a4a', cap: 166 },
    general: { label: '일반 계좌', color: '#e07b39', cap: Infinity },
};

// ── 추천 로직 ─────────────────────────────────────────────────
function recommend({ horizon, income, asset, amount }) {
    const hasIncome = income !== 'none';
    const rate = income === 'low' ? 0.165 : 0.132;

    // 넣을 순서 정하기
    let order;
    if (horizon === 'retire') {
        order = hasIncome ? ['pension', 'irp', 'isa', 'general'] : ['isa', 'pension', 'general'];
    } else {
        order = ['isa', 'general'];
    }
    if (asset === 'us') {
        // 개별 주식은 ISA·연금에서 살 수 없음 → 일반 계좌를 ISA보다 앞으로
        order = order.filter(k => k !== 'isa' && k !== 'general').concat('general');
    }
    if (asset === 'kr' && horizon !== 'retire') {
        // 국내 주식은 일반 계좌도 매매차익 비과세라 ISA 이점이 작음
        order = ['general'];
    }

    // 금액 채우기
    let left = amount;
    const steps = [];
    for (const k of order) {
        if (left <= 0) break;
        const put = Math.min(left, ACCOUNT[k].cap);
        steps.push({ key: k, monthly: put });
        left -= put;
    }

    const why = {
        pension: hasIncome
            ? `연 600만원까지 낸 돈의 ${rate * 100}%를 연말정산 때 돌려받아요. 55세 이후 연금으로 받으면 세금은 3.3~5.5%뿐이에요.`
            : '세액공제는 못 받지만, 수익에 대한 세금을 55세 이후 연금 받을 때까지 미루고 3.3~5.5%로 낮춰줘요.',
        irp: `연금저축과 합쳐 연 900만원까지 세액공제가 돼요. 다만 30%는 예금·채권 같은 안전자산에 넣어야 해요.`,
        isa: asset === 'kr'
            ? '국내 주식 배당에 붙는 15.4% 세금을 아낄 수 있어요. 수익 200만원(서민형 400만원)까지 비과세예요.'
            : '수익 200만원(서민형 400만원)까지 세금이 0원, 넘는 부분도 15.4% 대신 9.9%만 내요. 3년은 유지해야 하지만 넣은 원금은 중간에 꺼낼 수 있어요.',
        general: asset === 'us'
            ? '미국 개별 주식은 일반 계좌에서만 살 수 있어요. 매년 수익 250만원까지는 양도세가 없어요.'
            : asset === 'kr'
                ? '국내 주식은 일반 계좌에서도 매매차익에 세금이 없어요. 언제든 자유롭게 꺼낼 수 있어요.'
                : '한도가 없고 언제든 꺼낼 수 있어요. 절세 계좌를 다 채우고 남는 돈을 넣으세요.',
    };

    const tips = [];
    if (asset === 'us' && horizon === 'retire') tips.push('연금저축·IRP에서는 개별 주식을 살 수 없어요. 대신 S&P500 같은 국내상장 미국 지수 ETF를 담으세요.');
    if (asset === 'us') tips.push('일반 계좌 해외 주식은 수익 250만원을 넘으면 22% 세금이 붙어요. 매년 250만원 근처에서 일부 팔고 다시 사면 세금을 줄일 수 있어요.');
    if (asset === 'etf' && horizon !== 'retire') tips.push('미국 지수 ETF는 해외 주식 직접 매수보다 국내상장 ETF를 ISA에서 사는 쪽이 세금이 훨씬 적어요.');
    if (horizon === 'retire' && hasIncome) tips.push('연금저축·IRP는 55세 전에 해지하면 16.5% 세금을 내야 해요. 정말 노후용 돈만 넣으세요.');
    if (steps.some(s => s.key === 'isa')) tips.push('ISA 3년 만기 후 연금저축·IRP로 옮기면 옮긴 금액의 10%(최대 300만원)를 추가로 세액공제 받을 수 있어요.');
    if (asset === 'safe') tips.push('예금·채권 이자는 일반 계좌에서 15.4% 세금이 붙어요. ISA에 넣으면 같은 상품이라도 세금을 아낄 수 있어요.');

    const credit = steps
        .filter(s => s.key === 'pension' || s.key === 'irp')
        .reduce((sum, s) => sum + s.monthly * 12, 0);
    const refund = hasIncome ? Math.round(Math.min(credit, 900) * rate) : 0;

    return { steps, why, tips, refund };
}

// ── 페이지 ───────────────────────────────────────────────────
export default function AccountPlannerPage() {
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(0);

    const done = step >= QUESTIONS.length;
    const choose = (key, value) => {
        setAnswers(a => ({ ...a, [key]: value }));
        setStep(s => s + 1);
    };
    const reset = () => { setAnswers({}); setStep(0); };

    const result = done ? recommend(answers) : null;

    return (
        <div style={{ background: '#f4f6f8', minHeight: '100vh' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 16px 60px', fontFamily: 'sans-serif', textAlign: 'left' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d3436', margin: '0 0 4px' }}>어느 계좌에 투자할까?</h1>
                <div style={{ fontSize: 13, color: '#868e96', marginBottom: 20 }}>질문 4개에 답하면 계좌별로 얼마씩 넣으면 되는지 알려드려요.</div>

                {/* 진행 표시 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                    {QUESTIONS.map((q, i) => (
                        <div key={q.key} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? '#1a7a4a' : '#dee2e6' }} />
                    ))}
                </div>

                {!done ? (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7a4a', marginBottom: 6 }}>질문 {step + 1} / {QUESTIONS.length}</div>
                        <h2 style={{ fontSize: 19, fontWeight: 800, color: '#2d3436', margin: '0 0 16px' }}>{QUESTIONS[step].title}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {QUESTIONS[step].options.map(o => (
                                <button key={o.key} onClick={() => choose(QUESTIONS[step].key, o.key)}
                                    style={{
                                        textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                                        background: '#fff', border: '2px solid #e9ecef', borderRadius: 14,
                                        padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a7a4a'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e9ecef'; }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: '#2d3436' }}>{o.label}</div>
                                    {o.sub && <div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{o.sub}</div>}
                                </button>
                            ))}
                        </div>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)}
                                style={{ marginTop: 16, background: 'none', border: 'none', color: '#868e96', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
                                ← 이전 질문
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* 내 선택 */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                            {QUESTIONS.map((q, i) => (
                                <button key={q.key} onClick={() => setStep(i)} title="다시 고르기"
                                    style={{ background: '#e9ecef', border: 'none', borderRadius: 14, padding: '5px 11px', fontSize: 12, color: '#495057', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {q.options.find(o => o.key === answers[q.key])?.label} ✎
                                </button>
                            ))}
                        </div>

                        {/* 추천 */}
                        <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 14px rgba(0,0,0,0.07)', marginBottom: 14 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#868e96', marginBottom: 12 }}>이 순서대로 넣으세요 (월 {answers.amount}만원 기준)</div>
                            {result.steps.map((s, i) => {
                                const acc = ACCOUNT[s.key];
                                return (
                                    <div key={s.key} style={{ padding: '14px 0', borderTop: i ? '1px solid #f1f3f5' : 'none' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                width: 24, height: 24, borderRadius: 12, background: acc.color, color: '#fff', flexShrink: 0,
                                                fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                            }}>{i + 1}</span>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: '#2d3436', flex: 1 }}>{acc.label}</span>
                                            <span style={{ fontSize: 16, fontWeight: 800, color: acc.color }}>월 {s.monthly}만원</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#636e72', lineHeight: 1.6, marginTop: 6, paddingLeft: 34 }}>{result.why[s.key]}</div>
                                    </div>
                                );
                            })}
                            {result.refund > 0 && (
                                <div style={{ background: '#e6f9f0', color: '#1a7a4a', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontWeight: 700, marginTop: 8 }}>
                                    💰 연말정산 때 매년 약 {result.refund}만원 돌려받아요
                                </div>
                            )}
                        </div>

                        {result.tips.length > 0 && (
                            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', marginBottom: 14 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#868e96', marginBottom: 6 }}>알아두세요</div>
                                {result.tips.map(t => (
                                    <div key={t} style={{ fontSize: 13, color: '#495057', lineHeight: 1.6, padding: '6px 0' }}>• {t}</div>
                                ))}
                            </div>
                        )}

                        <button onClick={reset}
                            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#2d3436', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            처음부터 다시
                        </button>
                        <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 12, lineHeight: 1.6 }}>
                            현행 세법 기준의 간단한 안내이며 투자 권유가 아닙니다. 세법 개정에 따라 한도·세율이 달라질 수 있어요.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
