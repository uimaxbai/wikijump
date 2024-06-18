<style lang="scss">
    @import './wikipedia.scss';
    $font: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
    :global(html, body, body .mainDiv) {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        font-family: $font;
    }
    :global(body) {
        width: calc(100% - 2em);
        height: calc(100% - 2em);
        margin: 1em;
    }
    .search {
        display: flex;
        gap: 1em;
        input {
            padding: 1em;
            border-radius: .5em;
            border: 1px solid #ccc;
            font-family: $font;
        }
        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        .error {
            color: #e00;
        }
        .submitButton {
            cursor: pointer;
            &:disabled {
                cursor: not-allowed;
            }
        }
    }
</style>

<form class="search">
    <div class="from">
        <input on:focus={() => fromResultsShown = true} on:blur={() => setTimeout(() => {fromResultsShown = false}, 50)} type="text" bind:value={fromInput} placeholder="From..." on:input={() => {updateSearch(false); fromResultsShown = true;}}>
        <ul>
            {#if resultsFrom && fromResultsShown}
                {#each Object.keys(resultsFrom) as item}
                <li><button on:click={() => {selectItem(false, item); fromResultsShown = false; }} on:mousedown|preventDefault={() => {}}>{item}</button></li>
                {/each}
            {/if}
        </ul>
    </div> 
    <div class="to">
        <input on:focus={() => toResultsShown = true} on:blur={() => setTimeout(() => {toResultsShown = false}, 50)} type="text" bind:value={toInput} placeholder="To..." on:input={() => {updateSearch(true); toResultsShown = true}}>
        <ul>
            {#if resultsTo && toResultsShown}
                {#each Object.keys(resultsTo) as item}
                    <li><button on:click={() => { selectItem(true, item); toResultsShown = false; }} on:mousedown|preventDefault={() => {}}>{item}</button></li>
                {/each}
            {/if}
        </ul>
        {#if errorShown}
            <span class="error" id="sameError">{errorContent}</span>
        {/if}
    </div>
    <input disabled={submitDisabled} type="submit" value="Go" class="submitButton" on:click={() => onSubmit()}>
</form>
<main class="wikipedia" style="display: {wikiDisplay ? 'flex' : 'none'}">
    <div class="left">
        {@html tableOfContents}
    </div>
    <div class="right">
        <h1 style="margin-top: 0; border-bottom: 1px solid lightgray; padding-bottom: .5em; margin-bottom: .5em;">{title}</h1>
        {@html articleContent}
    </div>
</main>

<script lang="ts">
    // TODO now we have to make the wikipedia client+
    
    import { onMount } from 'svelte';
    import { searchWikipedia, getContentOfPage, getTableOfContents } from '$lib/api';

    // inputs and list buttons
    let resultsTo: Record<string, string> = {};
    let resultsFrom: Record<string, string> = {};
    let toResultsShown = false;
    let fromResultsShown = false;
    let toInput = "";
    let fromInput = "";
    let title = "";
    let wikiDisplay = false;

    // things to do with the actual article
    let articleContent = "";
    let tableOfContents = "";

    // submit button
    let submitDisabled = false;

    // errors
    let errorShown = false;
    let errorContent = "";

    // utility functions
    const toggleSameError = (error: boolean) => {
        if (error) {
            errorContent = "Error: both articles must not be the same."
            errorShown = true;
        }
        else if (!error) {
            errorShown = false;
        }
        else { // error = undefined, toggle the error
            errorContent = "Error: both articles must not be the same.";
            errorShown = !errorShown;
        }
    }
    // end utility functions

    // START searching for a page
    // make sure that from and to are correct
    const validateInputs = () => {
        if (toInput === "" || fromInput === "") {
            submitDisabled = true; // very subtle
        }
        else if (toInput.toLowerCase() === fromInput.toLowerCase()) {
            submitDisabled = true;
            toggleSameError(true)
            console.warn("Both input fields are the same, warning")
        }
        else {
            submitDisabled = false;
            toggleSameError(false)
        }
    }
    const updateSearch = (to: boolean) => {
        if (to === false) { // from
            searchWikipedia(fromInput).then(data => {
                resultsFrom = {};
                try {
                    (data[1]).forEach((el: string, i: number) => {
                        resultsFrom[el] = data[3][i];
                    })
                } catch (e) {
                    console.warn("No search results")
                }
                try {
                    delete resultsFrom[toInput]
                } catch (e) {
                    console.log("nothing found to delete")
                }
            })
            validateInputs();
        }
        else if (to === true) { // to
            searchWikipedia(toInput).then(data => {
                resultsTo = {};
                try {
                    (data[1]).forEach((el: string, i: number) => {
                        resultsTo[el] = data[3][i];
                    })
                }
                catch (e) {
                    console.warn("No search results")
                }
                try {
                    delete resultsTo[fromInput]
                } catch (e) {
                    console.log("nothing found")
                }
            });
            validateInputs();
        }
    };
    const selectItem = (to: boolean, item: string) => {
        if (to === false) { // from
            fromInput = item;
        }
        else if (to === true) { // to
            toInput = item;
        }
    };
    // END searching for a page

    // START actual wikipedia
    // make collapsible things collapsible, etc
    let currentId = 0;
    const javascriptify = () => {
        onMount(() => { // do this in dom
            document.querySelectorAll("table.collapsible").forEach(el => {
                console.log(el);
                el = el.querySelector("tbody");
                el?.classList.add(`custom-collapsible-num-${currentId}`);
                let button = document.createElement("button");
                button.classList.add(`custom-collapsible-num-${currentId}`);
                let buttonSpan = button.appendChild(document.createElement("span"));
                buttonSpan.classList.add("custom-collapsible-toggle-span");
                buttonSpan.innerHTML = "show";
                el.querySelector("tr")?.appendChild(button);
            })
        })
        currentId += 1;
    }
    const onSubmit = () => {
        // validate both pages and store content of JSON returned if possible
        // articleContent = "<b>Loading...</b>";
        getContentOfPage(toInput).then(data => {
            errorShown = false;
        }).catch((err) => {
            if (err instanceof ReferenceError) { // wikipedia page not found
                errorShown = true;
                errorContent = `Wikipedia page "${toInput} not found. Check your spelling."`;
            }
            else {
                errorShown = true;
                errorContent = `Wikipedia page "${toInput}" not found. Check your spelling.`;
            }
        });
        getContentOfPage(fromInput).then(pageContent => {
            // look in here, actual stuff happens!
            errorShown = false;
            // console.log(pageContent);
            articleContent = pageContent["body"];
            title = pageContent["title"];
            wikiDisplay = true; // display the wiki!
            javascriptify();
            getTableOfContents(fromInput).then(toc => {
                
            })
        }).catch((err) => {
            if (err instanceof ReferenceError) { // wikipedia page not found
                errorShown = true;
                errorContent = `Wikipedia page "${fromInput} not found. Check your spelling."`;
            }
            else {
                errorShown = true;
                errorContent = `Wikipedia page "${fromInput}" not found. Check your spelling.`;
            }
        });

        // yay! the articles actually exist!
        
    }
    // END actual wikipedia

    onMount(() => {
        validateInputs();
    })
</script>