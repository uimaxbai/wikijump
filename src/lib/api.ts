// Use wikipedia search api for autocomplete on from and to
export const searchWikipedia = async (q: string) => {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${q}&origin=*`);
    let resJson = await response.json();
    return resJson;
};

// get content of page or see if page exists
export const getContentOfPage = async (page: string) => {
    const response = await fetch(`/api/getArticle?n=${page}`);
    let resJson = await response.json();
    if (response.status === 404) {
        throw new ReferenceError(`Page ${page} not found on Wikipedia.`)
    }
    else if (response.status !== 200) {
        throw new Error(`An unknown error occured. JSON: ${JSON.stringify(resJson)}`);
    }
    return resJson;
};