// Use wikipedia search api for autocomplete on from and to
export const searchWikipedia = async (q: string) => {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${q}&origin=*`);
    let resJson = await response.json();
    return resJson;
};

// get content of page or see if page exists
export const getContentOfPage = async (page: string) => {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&formatversion=2&origin=*&format=json`);
    let resJson = await response.json();
    if (resJson.error === undefined) {
        return resJson;
    }
    else if (resJson.error.code === "missingtitle") {
        throw new ReferenceError(`${page} does not exist on Wikipedia.`)
    }
    else {
        throw new Error(`Unknown error occured. JSON: ${JSON.stringify(resJson)}`);
    }
};