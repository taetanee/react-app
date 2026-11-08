import React, { useState } from "react";

// ── 세법 가정 (단위: 만원) — 세법이 바뀌면 여기만 수정 ───────────
const TAX = {
    dividend: 0.154,        // 국내 배당·이자소득세 (지방세 포함)
    usDividend: 0.15,       // 미국 배당 원천징수
    overseasGain: 0.22,     // 해외주식 양도소득세 (국세 20% + 지방세 2%)
    overseasDeduct: 250,    // 해외주식 양도소득 기본공제 (연)
    isaYear: 2000,          // ISA 연 납입한도
    isaTotal: 10000,        // ISA 총 납입한도
    isaRate: 0.099,         // ISA 비과세 초과분
    pensionCredit: 600,     // 연금저축 세액공제 한도
    totalCredit: 900,       // 연금저축 + IRP 세액공제 한도
    pensionContrib: 1800,   // 연금계좌 연 납입한도
    pensionTax: 0.055,      // 연금 수령 시 (55~69세)
    comprehensive: 2000,    // 금융소득 종합과세 기준 (연)
};

const OVERSEAS = ['krEtf', 'usEtf', 'usStock'];
const isOverseas = (a) => OVERSEAS.includes(a.asset);
const isUsEtf = (a) => a.asset === 'krEtf' || a.asset === 'usEtf';

// ── 질문 ─────────────────────────────────────────────────────
// when: 이 조건일 때만 묻는다 / options: 함수면 앞선 답에 따라 바뀐다
const QUESTIONS = [
    {
        key: 'horizon',
        title: '이 돈은 언제 쓸 건가요?',
        options: [
            { key: 'retire', label: '노후 자금', sub: '55세 이후에 쓸 돈' },
            { key: 'mid', label: '몇 년 뒤 목돈', sub: '결혼·집·차 마련' },
            { key: 'anytime', label: '언제든 꺼낼 수 있게', sub: '비상금 성격' },
        ],
    },
    {
        key: 'years',
        title: '얼마나 오래 투자할 계획인가요?',
        options: [
            { key: 3, label: '3년' },
            { key: 5, label: '5년' },
            { key: 10, label: '10년' },
            { key: 20, label: '20년 이상' },
        ],
    },
    {
        key: 'income',
        title: '연봉(총급여)은 어느 정도인가요?',
        options: [
            { key: 'low', label: '5,000만원 이하', sub: '서민형 ISA(비과세 400만원) · 세액공제 16.5%' },
            { key: 'mid', label: '5,000~5,500만원', sub: '일반형 ISA(비과세 200만원) · 세액공제 16.5%' },
            { key: 'high', label: '5,500만원 초과', sub: '일반형 ISA · 세액공제 13.2%' },
            { key: 'none', label: '근로·사업소득 없음', sub: '세액공제 없음' },
        ],
    },
    {
        key: 'asset',
        title: '무엇에 투자하나요?',
        options: [
            { key: 'krEtf', label: '국내상장 미국 ETF', sub: 'TIGER·KODEX 미국S&P500, 나스닥100 등' },
            { key: 'usEtf', label: '해외 직투 ETF', sub: 'VOO·QQQ·SCHD를 미국 시장에서 직접 매수' },
            { key: 'usStock', label: '해외 직투 개별주', sub: '애플·엔비디아·테슬라 등' },
            { key: 'kr', label: '국내 주식', sub: '삼성전자·코스피200 ETF 등' },
            { key: 'safe', label: '예금·채권', sub: '이자 수익 위주' },
        ],
    },
    {
        key: 'sell',
        title: '해외 주식은 어떻게 팔 생각인가요?',
        when: (a) => a.asset === 'usEtf' || a.asset === 'usStock',
        options: [
            { key: 'hold', label: '오래 들고 있다가 한 번에', sub: '목돈이 필요할 때 전부 매도' },
            { key: 'yearly', label: '매년 수익 일부를 실현', sub: '250만원 공제를 매년 활용' },
            { key: 'unknown', label: '잘 모르겠어요', sub: '차이를 비교해서 보여드려요' },
        ],
    },
    // ── 국내상장 vs 미국 직구 ETF 판단 (1단계 → 2단계 → 3단계, 앞 단계에서 결론이 나면 다음은 묻지 않는다)
    {
        key: 'taxAcct',
        title: '연금저축·ISA 한도를 다 채웠나요?',
        when: isUsEtf,
        options: [
            { key: 'full', label: '다 채웠어요' },
            { key: 'partial', label: '여유 있어요' },
            { key: 'none', label: '계좌 없어요' },
        ],
    },
    {
        key: 'finIncome',
        title: '금융소득이 연 2,000만원을 넘나요?',
        when: (a) => isUsEtf(a) && a.taxAcct === 'full',
        options: [
            { key: 'over', label: '넘어요' },
            { key: 'under', label: '안 넘어요' },
        ],
    },
    {
        key: 'style',
        title: '어떻게 투자하나요?',
        when: (a) => isUsEtf(a) && a.taxAcct === 'full' && a.finIncome === 'under',
        options: [
            { key: 'dca', label: '매달 소액 적립' },
            { key: 'lump', label: '목돈 거치' },
            { key: 'dollar', label: '달러로 보유' },
        ],
    },
    {
        key: 'amount',
        title: '한 달에 얼마나 투자하나요?',
        options: [
            { key: 50, label: '50만원' },
            { key: 100, label: '100만원' },
            { key: 200, label: '200만원' },
            { key: 300, label: '300만원 이상' },
        ],
    },
    {
        key: 'ret',
        title: '연 수익률은 어느 정도로 예상하나요?',
        options: (a) => a.asset === 'safe'
            ? [
                { key: 3, label: '3%', sub: '예금 수준' },
                { key: 4, label: '4%', sub: '채권형' },
                { key: 5, label: '5%', sub: '회사채·고금리' },
            ]
            : [
                { key: 5, label: '5%', sub: '보수적으로' },
                { key: 8, label: '8%', sub: 'S&P500 장기 평균 수준' },
                { key: 12, label: '12%', sub: '나스닥·성장주 강세장' },
            ],
    },
];

const optionsOf = (q, answers) => (typeof q.options === 'function' ? q.options(answers) : q.options);
const visibleQuestions = (answers) => QUESTIONS.filter(q => !q.when || q.when(answers));

// ── 포맷 ─────────────────────────────────────────────────────
function fmt(v) {
    const n = Math.round(v);
    const abs = Math.abs(n);
    if (abs >= 10000) {
        const man = abs % 10000;
        return `${n < 0 ? '-' : ''}${Math.floor(abs / 10000)}억${man ? ` ${man.toLocaleString()}만` : ''}원`;
    }
    return `${n.toLocaleString()}만원`;
}

// ── 시뮬레이션 (매년 초 납입, 연 수익률 r, 그중 배당 d) ──────────
function divYield(asset, r) {
    if (asset === 'safe') return r;          // 수익 전부가 이자
    if (asset === 'kr') return Math.min(0.02, r);
    if (asset === 'usStock') return Math.min(0.01, r);
    return Math.min(0.015, r);
}

// 해외 직투 (일반 계좌)
function simDirect(flows, r, d, yearly) {
    let bal = 0, basis = 0, tax = 0, saved = 0;
    flows.forEach((f, y) => {
        bal += f; basis += f;
        const div = bal * d, dt = div * TAX.usDividend;
        tax += dt;
        bal = bal * (1 + r) - dt;
        basis += div - dt;
        // 매년 250만원어치 수익을 팔고 다시 사서 취득가를 올림 (마지막 해는 전량 매도에서 공제 사용)
        if (yearly && y < flows.length - 1) {
            const g = bal - basis;
            if (g > 0) { const used = Math.min(g, TAX.overseasDeduct); basis += used; saved += used; }
        }
    });
    const gain = Math.max(0, bal - basis);
    const gainTax = Math.max(0, gain - TAX.overseasDeduct) * TAX.overseasGain;
    return { net: bal - gainTax, tax: tax + gainTax, gain, gainTax, realizedFree: saved };
}

// 일반 계좌 (국내상장 ETF·국내주식·예금) — 배당/이자는 매년, 매매차익은 매도 시 gainRate
function simGeneral(flows, r, d, gainRate) {
    let bal = 0, basis = 0, tax = 0;
    for (const f of flows) {
        bal += f; basis += f;
        const div = bal * d, dt = div * TAX.dividend;
        tax += dt;
        bal = bal * (1 + r) - dt;
        basis += div - dt;
    }
    const gain = Math.max(0, bal - basis);
    const gainTax = gain * gainRate;
    return { net: bal - gainTax, tax: tax + gainTax, gain };
}

// ISA (한도 초과분은 일반 계좌)
function simIsa(flows, r, free, overflowSim) {
    let paid = 0;
    const inIsa = flows.map(f => { const x = Math.min(f, TAX.isaYear, TAX.isaTotal - paid); paid += x; return x; });
    let bal = 0;
    for (const f of inIsa) bal = (bal + f) * (1 + r);
    const isaTax = Math.max(0, bal - paid - free) * TAX.isaRate;
    const rest = overflowSim(flows.map((f, i) => f - inIsa[i]));
    return { net: bal - isaTax + rest.net, tax: isaTax + rest.tax, overflow: paid < flows.reduce((s, f) => s + f, 0) };
}

// 연금저축 + IRP (한도 초과분은 일반 계좌, 세액공제 환급금 포함, 55세 이후 연금 수령 가정)
function simPension(flows, r, creditRate, overflowSim) {
    let bal = 0, paid = 0, credited = 0, refund = 0;
    const inPension = flows.map(f => Math.min(f, TAX.pensionContrib));
    for (const f of inPension) {
        const c = Math.min(f, TAX.totalCredit);
        credited += c; refund += c * creditRate; paid += f;
        bal = (bal + f) * (1 + r);
    }
    const tax = Math.max(0, bal - (paid - credited)) * TAX.pensionTax;
    const rest = overflowSim(flows.map((f, i) => f - inPension[i]));
    return { net: bal - tax + refund + rest.net, tax: tax + rest.tax, refund, overflow: inPension.some((x, i) => x < flows[i]) };
}

// ── 비교표 ───────────────────────────────────────────────────
function compare(a) {
    const r = a.ret / 100;
    const d = divYield(a.asset, r);
    const annual = a.amount * 12;
    const flows = Array(a.years).fill(annual);
    const creditRate = a.income === 'high' ? 0.132 : a.income === 'none' ? 0 : 0.165;
    const isaFree = a.income === 'low' ? 400 : 200;
    const rows = [];

    if (isOverseas(a)) {
        const krGeneral = (fl) => simGeneral(fl, r, d, TAX.dividend);
        const hold = simDirect(flows, r, d, false);
        const yearly = simDirect(flows, r, d, true);
        rows.push({ key: 'hold', label: '해외 직투 · 마지막에 한 번에 매도', ...hold, note: '수익 250만원 공제 후 22%' });
        rows.push({ key: 'yearly', label: '해외 직투 · 매년 250만원씩 수익 실현', ...yearly, note: `총 ${fmt(yearly.realizedFree)} 수익을 세금 없이 실현` });
        rows.push({ key: 'krGeneral', label: '국내상장 미국 ETF · 일반 계좌', ...krGeneral(flows), note: '매매차익·분배금 모두 15.4%' });
        const isa = simIsa(flows, r, isaFree, krGeneral);
        rows.push({ key: 'isa', label: '국내상장 미국 ETF · ISA', ...isa, note: isa.overflow ? '연 2,000만원 초과분은 일반 계좌로 계산' : `수익 ${isaFree}만원 비과세, 초과분 9.9%` });
        if (a.horizon === 'retire') {
            const p = simPension(flows, r, creditRate, krGeneral);
            rows.push({ key: 'pension', label: '국내상장 미국 ETF · 연금저축/IRP', ...p, note: `연금 수령 5.5%${p.refund ? ` · 세액공제 ${fmt(p.refund)} 포함` : ''}${p.overflow ? ' · 한도 초과분 일반 계좌' : ''}` });
        }
    } else {
        const gen = (fl) => simGeneral(fl, r, d, 0);
        rows.push({ key: 'general', label: '일반 계좌', ...gen(flows), note: a.asset === 'safe' ? '이자에 매년 15.4%' : '매매차익 비과세, 배당만 15.4%' });
        const isa = simIsa(flows, r, isaFree, gen);
        rows.push({ key: 'isa', label: 'ISA', ...isa, note: isa.overflow ? '연 2,000만원 초과분은 일반 계좌로 계산' : `수익 ${isaFree}만원 비과세, 초과분 9.9%` });
        if (a.horizon === 'retire') {
            const p = simPension(flows, r, creditRate, gen);
            rows.push({ key: 'pension', label: '연금저축/IRP', ...p, note: `연금 수령 5.5%${p.refund ? ` · 세액공제 ${fmt(p.refund)} 포함` : ''}` });
        }
    }
    const best = rows.reduce((b, x) => (x.net > b.net ? x : b), rows[0]);
    return { rows, best, principal: annual * a.years };
}

// ── 계좌 추천 ─────────────────────────────────────────────────
const ACCOUNT = {
    pension: { label: '연금저축', color: '#8e44ad', cap: 50 },
    irp: { label: 'IRP', color: '#2e86ab', cap: 25 },
    isa: { label: 'ISA (중개형)', color: '#1a7a4a', cap: 166 },
    general: { label: '일반 계좌', color: '#e07b39', cap: Infinity },
};

function recommend(a) {
    const hasIncome = a.income !== 'none';
    const rate = a.income === 'high' ? 0.132 : 0.165;
    const isaFree = a.income === 'low' ? 400 : 200;
    const direct = a.asset === 'usEtf' || a.asset === 'usStock';

    let order;
    if (a.horizon === 'retire') order = hasIncome ? ['pension', 'irp', 'isa', 'general'] : ['isa', 'pension', 'general'];
    else order = ['isa', 'general'];
    if (a.asset === 'usStock') order = order.filter(k => k !== 'isa' && k !== 'general').concat('general');
    if (a.asset === 'kr' && a.horizon !== 'retire') order = ['general'];

    let left = a.amount;
    const steps = [];
    for (const k of order) {
        if (left <= 0) break;
        const put = Math.min(left, ACCOUNT[k].cap);
        steps.push({ key: k, monthly: put });
        left -= put;
    }

    const generalLabel = isOverseas(a) ? '일반 계좌 (해외 직투)' : '일반 계좌';
    const why = {
        pension: (hasIncome ? `세액공제 ${(rate * 100).toFixed(1)}% · 연금 수령 시 3.3~5.5%` : '연금 수령 시 3.3~5.5%')
            + (isOverseas(a) ? ' · 국내상장 ETF로' : ''),
        irp: '연금저축과 합쳐 900만원 공제 · 30% 안전자산',
        isa: `수익 ${isaFree}만원 비과세 · 초과분 9.9% · 3년 유지`,
        general: direct
            ? '250만원 공제 후 22% · 종합과세 제외'
            : a.asset === 'krEtf'
                ? '여기선 해외 직투가 유리할 수 있어요'
                : a.asset === 'kr'
                    ? '매매차익 비과세'
                    : '한도 없음 · 언제든 출금',
    };

    const credit = steps.filter(s => s.key === 'pension' || s.key === 'irp').reduce((sum, s) => sum + s.monthly * 12, 0);
    const refund = hasIncome ? Math.round(Math.min(credit, TAX.totalCredit) * rate) : 0;

    return { steps, why, refund, generalLabel };
}

// ── 국내상장 vs 미국 직구 ETF 판단 ──────────────────────────────
const ETF_PICK = {
    listed: { label: '국내상장 미국 ETF', color: '#1a7a4a' },
    direct: { label: '미국 직구 ETF', color: '#2e86ab' },
};

function guideEtf(a) {
    if (a.taxAcct !== 'full') return { pick: 'listed', reason: '절세 계좌 우선' };
    if (a.finIncome === 'over') return { pick: 'direct', reason: '22% 분류과세' };
    if (a.style === 'dca') return { pick: 'listed', reason: '소액 적립' };
    if (a.style === 'dollar') return { pick: 'direct', reason: '달러 보유' };
    return { pick: 'direct', reason: '목돈 거치' };
}

function buildTips(a, cmp) {
    const tips = [];
    const direct = a.asset === 'usEtf' || a.asset === 'usStock';
    if (direct) {
        tips.push('양도세는 다음 해 5월 직접 신고 (증권사 무료 대행)');
        tips.push('손실 종목을 같이 팔면 세금이 줄어요');
        if (a.sell !== 'yearly') {
            const hold = cmp.rows.find(r => r.key === 'hold');
            const yearly = cmp.rows.find(r => r.key === 'yearly');
            if (yearly.net - hold.net > 1) tips.push(`매년 250만원씩 수익 실현하면 약 ${fmt(yearly.net - hold.net)} 절세`);
        }
    }
    if (a.asset === 'krEtf') {
        const krGeneral = cmp.rows.find(r => r.key === 'krGeneral');
        if (krGeneral.gain > TAX.comprehensive) tips.push(`일반 계좌 매도 시 차익 ${fmt(krGeneral.gain)} → 종합과세 주의`);
    }
    if (a.horizon === 'retire' && a.income !== 'none') tips.push('55세 전 해지 시 16.5% 과세');
    if (a.horizon !== 'retire') tips.push('ISA 만기 후 연금계좌 이전 시 10% 추가 공제');
    return tips;
}

// ── UI 조각 ──────────────────────────────────────────────────
const card = { background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 14px rgba(0,0,0,0.07)', marginBottom: 14 };
const cardTitle = { fontSize: 13, fontWeight: 700, color: '#868e96', marginBottom: 12 };

function CapitalGainExample({ a, cmp }) {
    const hold = cmp.rows.find(r => r.key === 'hold');
    const yearly = cmp.rows.find(r => r.key === 'yearly');
    const taxable = Math.max(0, hold.gain - TAX.overseasDeduct);
    const line = (label, value, strong, color) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: 14, fontWeight: strong ? 800 : 400, color: color || '#2d3436' }}>
            <span>{label}</span><span>{value}</span>
        </div>
    );
    return (
        <div style={card}>
            <div style={cardTitle}>해외 직투 양도세 ({a.years}년 후 전량 매도)</div>
            <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '6px 14px' }}>
                {line('매매 수익', fmt(hold.gain))}
                {line('기본공제', `− ${fmt(Math.min(hold.gain, TAX.overseasDeduct))}`)}
                <div style={{ borderTop: '1px dashed #ced4da' }} />
                {line('과세 대상', fmt(taxable))}
                {line('× 22%', fmt(hold.gainTax), true, '#c0392b')}
            </div>
            <div style={{ fontSize: 13, color: '#495057', marginTop: 12 }}>
                매년 공제 활용 시 <b style={{ color: '#1a7a4a' }}>{fmt(yearly.gainTax)}</b>
            </div>
        </div>
    );
}

function EtfGuide({ a, guide }) {
    const pick = ETF_PICK[guide.pick];
    const mine = a.asset === 'usEtf' ? 'direct' : 'listed';
    return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f3f5', fontSize: 14 }}>
            <span style={{ color: '#868e96' }}>ETF는</span>
            <b style={{ color: pick.color }}>{pick.label}</b>
            <span style={{ fontSize: 12, color: '#868e96', flex: 1 }}>{guide.reason}</span>
            {mine !== guide.pick && <span style={{ fontSize: 12, color: '#c0392b', whiteSpace: 'nowrap' }}>⚠ 선택과 다름</span>}
        </div>
    );
}

function DirectVsListed() {
    const rows = [
        ['매매차익 세금', '연 250만원 공제 후 22%', '15.4% (공제 없음)'],
        ['금융소득 종합과세', '포함 안 됨 (분리과세)', '포함 (연 2,000만원 초과 시)'],
        ['분배금·배당', '미국에서 15% 원천징수', '15.4%'],
        ['ISA·연금계좌', '불가', '가능'],
        ['매매', '달러 환전 필요', '원화로 바로'],
    ];
    const cell = { padding: '9px 8px', borderTop: '1px solid #f1f3f5', fontSize: 13, verticalAlign: 'top' };
    return (
        <div style={card}>
            <div style={cardTitle}>해외 직투 vs 국내상장 미국 ETF</div>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 380 }}>
                    <thead>
                        <tr style={{ fontSize: 12, color: '#868e96', textAlign: 'left' }}>
                            <th style={{ padding: '0 8px 6px' }}></th>
                            <th style={{ padding: '0 8px 6px' }}>해외 직투 (VOO 등)</th>
                            <th style={{ padding: '0 8px 6px' }}>국내상장 (TIGER 등)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(([k, x, y]) => (
                            <tr key={k}>
                                <td style={{ ...cell, fontWeight: 700, color: '#495057', whiteSpace: 'nowrap' }}>{k}</td>
                                <td style={{ ...cell, color: '#2d3436' }}>{x}</td>
                                <td style={{ ...cell, color: '#2d3436' }}>{y}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── 페이지 ───────────────────────────────────────────────────
export default function AccountPlannerPage() {
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(0);
    const [showMore, setShowMore] = useState(false);

    const questions = visibleQuestions(answers);
    const done = step >= questions.length;
    const choose = (key, value) => {
        setAnswers(a => {
            const next = { ...a, [key]: value };
            // 앞 답이 바뀌어 선택지에서 사라진 답은 지운다 (예: 예금·채권 선택 시 수익률 선택지 변경)
            for (const x of QUESTIONS) {
                if (next[x.key] !== undefined && !optionsOf(x, next).some(o => o.key === next[x.key])) delete next[x.key];
            }
            return next;
        });
        setStep(s => s + 1);
    };
    const reset = () => { setAnswers({}); setStep(0); setShowMore(false); };

    let result = null;
    if (done) {
        const cmp = compare(answers);
        result = { rec: recommend(answers), cmp, tips: buildTips(answers, cmp), guide: isUsEtf(answers) ? guideEtf(answers) : null };
    }
    const q = questions[step];
    const direct = answers.asset === 'usEtf' || answers.asset === 'usStock';

    return (
        <div style={{ background: '#f4f6f8', minHeight: '100vh' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '28px 16px 60px', fontFamily: 'sans-serif', textAlign: 'left' }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#2d3436', margin: '0 0 4px' }}>어느 계좌에 투자할까?</h1>

                <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                    {questions.map((x, i) => (
                        <div key={x.key} style={{ flex: 1, height: 5, borderRadius: 3, background: i < step ? '#1a7a4a' : '#dee2e6' }} />
                    ))}
                </div>

                {!done ? (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7a4a', marginBottom: 6 }}>질문 {step + 1} / {questions.length}</div>
                        <h2 style={{ fontSize: 19, fontWeight: 800, color: '#2d3436', margin: '0 0 16px' }}>{q.title}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {optionsOf(q, answers).map(o => {
                                const picked = answers[q.key] === o.key;
                                return (
                                    <button key={o.key} onClick={() => choose(q.key, o.key)}
                                        style={{
                                            textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                                            background: picked ? '#f1faf5' : '#fff', border: `2px solid ${picked ? '#1a7a4a' : '#e9ecef'}`, borderRadius: 14,
                                            padding: '16px 18px', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1a7a4a'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = picked ? '#1a7a4a' : '#e9ecef'; }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2d3436' }}>{o.label}</div>
                                        {o.sub && <div style={{ fontSize: 12, color: '#868e96', marginTop: 3 }}>{o.sub}</div>}
                                    </button>
                                );
                            })}
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
                            {questions.map((x, i) => (
                                <button key={x.key} onClick={() => setStep(i)} title="다시 고르기"
                                    style={{ background: '#e9ecef', border: 'none', borderRadius: 14, padding: '5px 11px', fontSize: 12, color: '#495057', cursor: 'pointer', fontFamily: 'inherit' }}>
                                    {optionsOf(x, answers).find(o => o.key === answers[x.key])?.label ?? '선택 안 함'} ✎
                                </button>
                            ))}
                        </div>

                        {/* 한눈에: 어디에 얼마 */}
                        <div style={card}>
                            <div style={cardTitle}>월 {answers.amount}만원, 이렇게 나눠 넣으세요</div>
                            <div style={{ display: 'flex', height: 40, borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
                                {result.rec.steps.map(s => (
                                    <div key={s.key} title={result.rec.why[s.key]} style={{
                                        flex: s.monthly, background: ACCOUNT[s.key].color, color: '#fff', minWidth: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden',
                                    }}>{s.monthly}</div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', fontSize: 13, color: '#495057' }}>
                                {result.rec.steps.map((s, i) => (
                                    <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                        <span style={{ width: 9, height: 9, borderRadius: 5, background: ACCOUNT[s.key].color }} />
                                        {i + 1}. {s.key === 'general' ? result.rec.generalLabel : ACCOUNT[s.key].label}
                                    </span>
                                ))}
                            </div>
                            {result.guide && <EtfGuide a={answers} guide={result.guide} />}
                            {result.rec.refund > 0 && (
                                <div style={{ color: '#1a7a4a', fontSize: 14, fontWeight: 700, marginTop: 12 }}>💰 매년 {result.rec.refund}만원 환급</div>
                            )}
                        </div>

                        {/* 한눈에: 얼마가 되나 */}
                        <div style={{ ...card, textAlign: 'center' }}>
                            <div style={cardTitle}>{answers.years}년 후</div>
                            <div style={{ fontSize: 30, fontWeight: 800, color: '#1a7a4a' }}>{fmt(result.cmp.best.net)}</div>
                            <div style={{ fontSize: 13, color: '#868e96', marginTop: 4 }}>원금 {fmt(result.cmp.principal)} · {result.cmp.best.label}</div>
                        </div>

                        <button onClick={() => setShowMore(v => !v)}
                            style={{ width: '100%', padding: 12, marginBottom: 14, borderRadius: 12, border: '1px solid #dee2e6', background: '#fff', color: '#495057', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                            {showMore ? '접기 ▴' : '자세히 보기 ▾'}
                        </button>

                        {showMore && (
                            <>
                                <div style={card}>
                                    <div style={cardTitle}>방법별 세후 금액 (연 {answers.ret}%)</div>
                                    {[...result.cmp.rows].sort((x, y) => y.net - x.net).map(row => {
                                        const best = row === result.cmp.best;
                                        const mine = (direct && row.key === (answers.sell === 'yearly' ? 'yearly' : 'hold'));
                                        return (
                                            <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0', borderTop: '1px solid #f1f3f5', fontSize: 14 }}>
                                                <span style={{ color: '#2d3436', fontWeight: best ? 800 : 400 }}>{row.label}{mine && ' (내 방식)'}</span>
                                                <span style={{ whiteSpace: 'nowrap', fontWeight: 700, color: best ? '#1a7a4a' : '#2d3436' }}>
                                                    {fmt(row.net)}
                                                    {!best && <span style={{ color: '#c0392b', fontSize: 12, fontWeight: 400, marginLeft: 6 }}>{fmt(row.net - result.cmp.best.net)}</span>}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {direct && <CapitalGainExample a={answers} cmp={result.cmp} />}
                                {isOverseas(answers) && <DirectVsListed />}

                                {result.tips.length > 0 && (
                                    <div style={card}>
                                        <div style={cardTitle}>알아두세요</div>
                                        {result.tips.map(t => (
                                            <div key={t} style={{ fontSize: 13, color: '#495057', lineHeight: 1.6, padding: '4px 0' }}>• {t}</div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        <button onClick={reset}
                            style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#2d3436', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                            처음부터 다시
                        </button>
                        <div style={{ fontSize: 11, color: '#adb5bd', marginTop: 12, lineHeight: 1.6 }}>
                            단순화한 추정치이며 투자 권유가 아닙니다.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
