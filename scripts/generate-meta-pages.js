// 빌드 후 실행: src/pageMeta.json 의 고정 경로마다 build/<경로>/index.html 을 만들어
// 카카오톡 등 JS 를 실행하지 않는 링크 미리보기에도 페이지별 제목이 나오게 한다.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');
const { default: defaults, routes } = require(path.join(root, 'src', 'pageMeta.json'));

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

function render(html, meta) {
    const tags = [
        `<title>${esc(meta.title)}</title>`,
        `<meta name="description" content="${esc(meta.description)}"/>`,
        `<meta property="og:title" content="${esc(meta.title)}"/>`,
        `<meta property="og:description" content="${esc(meta.description)}"/>`,
        meta.image && `<meta property="og:image" content="${esc(meta.image)}"/>`,
    ].filter(Boolean).join('');

    return html
        .replace(/<title>[\s\S]*?<\/title>/i, '')
        .replace(/<meta\s+name="description"[^>]*>/gi, '')
        .replace(/<meta\s+property="og:(title|description|image)"[^>]*>/gi, '')
        .replace('</head>', `${tags}</head>`);
}

const template = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
fs.writeFileSync(path.join(buildDir, 'index.html'), render(template, defaults));

let count = 0;
for (const route of routes) {
    if (route.path.includes(':')) continue; // 동적 경로는 브라우저에서만 적용
    const dir = path.join(buildDir, ...route.path.split('/').filter(Boolean));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), render(template, { ...defaults, ...route }));
    count++;
}
console.log(`meta pages: ${count}개 경로 생성`);
