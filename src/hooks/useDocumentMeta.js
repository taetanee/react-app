import { useEffect } from "react";

function upsertMeta(attr, key, content) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    const prev = el.getAttribute("content");
    el.setAttribute("content", content);
    return { el, prev };
}

// 페이지 진입 시 title/meta를 바꾸고, 이탈 시 이전 값으로 되돌린다.
export default function useDocumentMeta({
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = "website",
} = {}) {
    useEffect(() => {
        const prevTitle = document.title;
        if (title) document.title = title;

        const restores = [];
        if (description) restores.push(upsertMeta("name", "description", description));
        const finalOgTitle = ogTitle ?? title;
        if (finalOgTitle) restores.push(upsertMeta("property", "og:title", finalOgTitle));
        const finalOgDescription = ogDescription ?? description;
        if (finalOgDescription) restores.push(upsertMeta("property", "og:description", finalOgDescription));
        if (ogType) restores.push(upsertMeta("property", "og:type", ogType));
        if (ogImage) restores.push(upsertMeta("property", "og:image", ogImage));

        return () => {
            document.title = prevTitle;
            restores.forEach(({ el, prev }) => {
                if (prev == null) el.remove();
                else el.setAttribute("content", prev);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, description, ogTitle, ogDescription, ogImage, ogType]);
}
