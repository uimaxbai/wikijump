import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const from = url.searchParams.get('from') || "";
    const to = url.searchParams.get('to') || "";
    if (from === "") {
        error(400, "No From Wikipedia article specified.");
    }
    if (to === "") {
        error(400, "No To article specified.");
    }
    
    const response = await fetch("https://api.sixdegreesofwikipedia.com/paths", {
        "method": "post",
        "body": JSON.stringify({
            source: from,
            target: to
        }),
    })
    const data = await response.json();

    return json(data);
}

/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
    error(405, "Method not allowed. Use a GET request instead.");
}