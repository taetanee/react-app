// 운영용 서버: build/ 를 서빙하고, 동적 경로(/invite/:slug, /dol/:slug)는
// API 로 청첩장 정보를 조회해 메타 태그를 HTML 에 직접 넣어준다.
// (카카오톡 등 JS 를 실행하지 않는 링크 미리보기용)
// 실행: npm run build && npm run serve   (nginx 는 기존처럼 localhost:3000 으로 프록시)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SITE = 'https://mypad.kr';
const API = 'https://api.mypad.kr/weddingPlatform';
const buildDir = path.join(__dirname, '..', 'build');
const { default: DEFAULT_META } = require(path.join(__dirname, '..', 'src', 'pageMeta.json'));


const MIME = {
    '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp',
    '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8', '.map': 'application/json',
};

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

function injectMeta(html, meta) {
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

const absUrl = (u) => (!u ? undefined : /^https?:\/\//.test(u) ? u : SITE + (u.startsWith('/') ? '' : '/') + u);
const place = (inv) => [inv.venueName, inv.venueHall].filter(Boolean).join(' ');
const baby = (inv) => (inv.babyShort || inv.babyName || '').trim();

// InvitationView / DolInvitationView / InvitationVideoView 의 setPageMeta 와 같은 규칙
function metaFor(kind, inv) {
    const image = absUrl((inv.gallery || [])[0]);
    if (kind === 'video') {
        return inv.eventType === 'dol'
            ? { title: baby(inv) ? `${baby(inv)} 성장영상` : '성장영상', description: '첫 번째 생일까지의 이야기를 담았습니다', image }
            : { title: `${inv.groomShort} ♥ ${inv.brideShort} 식전영상`, description: '저희의 이야기를 영상으로 담았습니다', image };
    }
    if (kind === 'dol') {
        return {
            title: baby(inv) ? `${baby(inv)}의 첫 번째 생일에 초대합니다` : '첫 번째 생일에 초대합니다',
            description: place(inv) || '돌잔치 초대장', image,
        };
    }
    return { title: `${inv.groomShort} ♥ ${inv.brideShort} 결혼식에 초대합니다`, description: place(inv) || '모바일 청첩장', image };
}

function matchDynamic(pathname) {
    let m;
    if ((m = pathname.match(/^\/invite\/video\/([^/]+)\/?$/))) return { kind: 'video', slug: m[1] };
    if ((m = pathname.match(/^\/invite\/([^/]+)\/?$/))) return { kind: 'invite', slug: m[1] };
    if ((m = pathname.match(/^\/dol\/([^/]+)\/?$/))) return { kind: 'dol', slug: m[1] };
    return null;
}

const cache = new Map(); // slug -> { at, invite }
const CACHE_MS = 60 * 1000;

async function fetchInvite(slug) {
    const hit = cache.get(slug);
    if (hit && Date.now() - hit.at < CACHE_MS) return hit.invite;
    const res = await fetch(`${API}/invite/public?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    if (data.result_code || !data.result) throw new Error(data.result_msg || 'not found');
    cache.set(slug, { at: Date.now(), invite: data.result });
    return data.result;
}

function send(res, status, body, type, cacheControl) {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': cacheControl });
    res.end(body);
}

function readHtml(file) {
    return fs.readFileSync(file, 'utf8');
}

const server = http.createServer(async (req, res) => {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
        return send(res, 400, 'Bad Request', 'text/plain', 'no-store');
    }

    // 1) 정적 파일 (build/static/..., images, favicon 등)
    const file = path.join(buildDir, pathname);
    if (!file.startsWith(buildDir)) return send(res, 403, 'Forbidden', 'text/plain', 'no-store');
    if (pathname !== '/' && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        const cc = pathname.startsWith('/static/') ? 'public, max-age=31536000, immutable'
            : ext === '.html' ? 'no-cache' : 'public, max-age=3600';
        return send(res, 200, fs.readFileSync(file), MIME[ext] || 'application/octet-stream', cc);
    }

    // 2) 동적 경로: API 조회 후 메타 주입
    const dyn = matchDynamic(pathname);
    const indexHtml = readHtml(path.join(buildDir, 'index.html'));
    if (dyn) {
        try {
            const invite = await fetchInvite(dyn.slug);
            return send(res, 200, injectMeta(indexHtml, { ...DEFAULT_META, ...metaFor(dyn.kind, invite) }), MIME['.html'], 'no-cache');
        } catch (e) {
            console.warn(`[meta] ${pathname}: ${e.message}`);
            return send(res, 200, indexHtml, MIME['.html'], 'no-cache');
        }
    }

    // 3) 고정 경로: postbuild 가 만든 build/<경로>/index.html, 없으면 SPA 기본 index.html
    const routeIndex = path.join(buildDir, pathname, 'index.html');
    const html = routeIndex.startsWith(buildDir) && fs.existsSync(routeIndex) ? readHtml(routeIndex) : indexHtml;
    send(res, 200, html, MIME['.html'], 'no-cache');
});

server.listen(PORT, () => console.log(`serving build/ on http://localhost:${PORT}`));
