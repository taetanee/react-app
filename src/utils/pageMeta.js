import { useEffect } from "react";
import { useLocation, matchPath } from "react-router-dom";
import PAGE_META from "../pageMeta.json";

// 페이지별 메타 정보는 src/pageMeta.json 에서 관리합니다.
// (빌드 후 scripts/generate-meta-pages.js 가 같은 파일로 경로별 index.html 을 만들어 카톡 미리보기에도 반영)

function upsertMeta(attr, key, content) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (content == null) {
        if (el) el.remove();
        return;
    }
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

export function setPageMeta(pageMeta) {
    const meta = { ...PAGE_META.default, ...pageMeta };
    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:image', meta.image);
}

export function findPageMeta(pathname) {
    const route = PAGE_META.routes.find(r => matchPath({ path: r.path, end: true }, pathname));
    return { ...PAGE_META.default, ...route };
}

// Router 안에 두면 경로가 바뀔 때마다 메타 태그를 갱신
export function RouteMeta() {
    const { pathname } = useLocation();
    useEffect(() => {
        setPageMeta(findPageMeta(pathname));
    }, [pathname]);
    return null;
}
