import { error, json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    const name = url.searchParams.get('n') || "";
    if (name === "") {
        error(400, "No Wikipedia article specified.");
    }
    
    const response = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&page=${name}&prop=sections&origin=*&format=json`);
    let resJson = await response.json();

    // check for errors
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

    const buildHierarchy = sections => {
        const root = [];
        const sectionMap = {};
      
        sections.forEach(section => {
          const levels = section.number.split('.').map(Number);
          const currentLevel = levels.length;
          const parentLevel = currentLevel - 1;
      
          const newSection = {
            id: section.index,
            name: section.line,
            anchor: section.anchor,
            children: []
          };
      
          sectionMap[section.index] = newSection;
      
          if (parentLevel === 0) {
            root.push(newSection);
          } else {
            const parentNumber = levels.slice(0, parentLevel).join('.');
            const parentSection = Object.values(sectionMap).find(
              sec => sec.id == sections.find(s => s.number === parentNumber).index
            );
      
            if (parentSection) {
              parentSection.children.push(newSection);
            }
          }
        });
      
        return root;
    }

    const sectionsHierarchy = buildHierarchy(resJson.parse.sections);

    let data = {
        status: 200,
        body: {
            title: resJson["parse"]["title"],
            sections: sectionsHierarchy
        }
    };



    return json(data);
}

/** @type {import('./$types').RequestHandler} */
export async function fallback({ request }) {
    error(405, "Method not allowed. Use a GET request instead.");
}