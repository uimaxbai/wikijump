<style lang="scss">
    $font: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
    :global(html, body, body .mainDiv) {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        font-family: $font;
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
                <li><button on:click|preventDefault={() => {selectItem(false, item)}} on:mousedown|preventDefault={() => {}}>{item}</button></li>
                {/each}
            {/if}
        </ul>
    </div> 
    <div class="to">
        <input on:focus={() => toResultsShown = true} on:blur={() => setTimeout(() => {toResultsShown = false}, 50)} type="text" bind:value={toInput} placeholder="To..." on:input={() => {updateSearch(true); toResultsShown = true}}>
        <ul>
            {#if resultsTo && toResultsShown}
                {#each Object.keys(resultsTo) as item}
                    <li><button on:click|preventDefault={() => selectItem(true, item)} on:mousedown|preventDefault={() => {}}>{item}</button></li>
                {/each}
            {/if}
        </ul>
        {#if sameErrorShown}
            <span class="error" id="sameError">Error: articles must not be the same.</span>
        {/if}
    </div>
    <input disabled={submitDisabled} type="submit" value="Go" class="submitButton">
</form>

<script lang="ts">
    // TODO now we have to make the wikipedia client+
    
    import { onMount } from 'svelte';

    // inputs and list buttons
    let resultsTo: Record<string, string> = {};
    let resultsFrom: Record<string, string> = {};
    let toResultsShown = false;
    let fromResultsShown = false;
    let toInput = "";
    let fromInput = "";

    // submit button
    let submitDisabled = false;

    // errors shown?
    let sameErrorShown = false;

    const searchWikipedia = async (q: string) => {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${q}&origin=*`);
        let resJson = await response.json();
        return resJson;
    };

    const validateInputs = () => {
        if (toInput === "" || fromInput === "") {
            submitDisabled = true; // very subtle
        }
        else if (toInput.toLowerCase() === fromInput.toLowerCase()) {
            submitDisabled = true;
            sameErrorShown = true;
            console.warn("Both input fields are the same, warning")
        }
        else {
            submitDisabled = false;
            sameErrorShown = false;
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
    onMount(() => {
        validateInputs();
    })
</script>