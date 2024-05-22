import { error, json } from '@sveltejs/kit';
import sanitiseHtml from 'sanitize-html';
import { JSDOM } from "jsdom";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const name = url.searchParams.get('n') || "";
    if (name === "") {
        error(400, "No Wikipedia article specified.");
    }
    var linktoFetch = `https://en.wikipedia.org/w/api.php?action=parse&page=${name}&prop=text&formatversion=2&origin=*&format=json`;
    const response = await fetch(linktoFetch);
    let resJson = await response.json();
    // console.log(resJson)
    try {
        if (typeof resJson.error !== undefined) {
            if (resJson.error.code === "missingtitle") {
                error(404, JSON.stringify({
                    status: 404,
                    body: `Page ${name} does not exist on Wikipedia.` 
                }))
            }
            else {
                error(500, JSON.stringify({
                    status: 500,
                    body: `Unknown error occured.`,
                    error: resJson
                }))
            }
        }
    }
    catch (e) {
        // idk why this works, but maybe it's because resJson.error doesn't exist?????
    }
    let article = resJson["parse"]["text"];

    sanitiseHtml(article);
    const htmlDoc = new JSDOM(article);
    htmlDoc.window.document.querySelectorAll('.mw-editsection').forEach(e => e.remove()); // get rid of edit buttons
    // return htmlDoc.body.innerHTML
    // remove external links
    htmlDoc.window.document.querySelectorAll(".external").forEach(e => { e.style.color = "#f00" });
    htmlDoc.window.document.querySelectorAll(".external").forEach(e => e?.setAttribute("href", ""));
    /* let wikiJs = htmlDoc.window.document.createElement("script");
    wikiJs.text = `
    document.querySelectorAll(".hidden-begin").forEach(e => {
        let hiddenButtonDiv = document.createElement("div");
        hiddenButtonDiv.innerHTML = \`
        [<button tabindex="0" onclick="">hide</button>]
        \`;
        e.prepend()
    })
    `;
    htmlDoc.window.document.body.appendChild(wikiJs); */
    
    let data = {
        status: 200,
        body: htmlDoc.window.document.body.innerHTML
    }


    return json(data);
}

/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
    error(405, "Method not allowed. Use a GET request instead.");
}