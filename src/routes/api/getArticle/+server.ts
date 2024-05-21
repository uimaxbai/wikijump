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
    console.log(resJson)
    if (resJson.error.code === "missingtitle") {
        error(404, JSON.stringify({
            status: 404,
            body: `Page ${name} does not exist on Wikipedia.` 
        }))
    }
    else if (resJson.error !== undefined) {
        error(500, JSON.stringify({
            status: 500,
            body: `Unknown error occured.`,
            error:  resJson
        }))
    }

    let article = resJson["parse"]["text"];

    sanitiseHtml(article);
    const htmlDoc = new JSDOM(article);
    htmlDoc.window.querySelectorAll('.mw-editsection').forEach(e => e.remove()); // get rid of edit buttons
    // return htmlDoc.body.innerHTML
    // remove external links
    htmlDoc.window.querySelector(".external")!.style.color = "#f00";
    htmlDoc.window.querySelector(".external")?.setAttribute("href", "");
    let data = {
        status: 200,
        body: htmlDoc.window.body.innerHTML
    }


    return json(data);
}

/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
    error(405, "Method not allowed. Use a GET request instead.");
}