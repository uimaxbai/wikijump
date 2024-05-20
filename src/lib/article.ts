import sanitizeHtml from 'sanitize-html';

export const sanitiseArticle = (html: string) => {
    // 1. remove script tags
    sanitizeHtml(html); // run through sanitizeHTML
    // 2. remove any "[edit]", the "external links section"
    // html += `<style>/* INJECTED BY WIKIJUMP. */ .mw-editsection { display: none!important; }</style>` // get rid of edit buttons
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(html, 'text/html');
    htmlDoc.querySelectorAll('.mw-editsection').forEach(e => e.remove()); // get rid of edit buttons
    // TODO get rid of external links
    return htmlDoc.body.innerHTML
};