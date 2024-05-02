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
        }
    }
</style>

<div class="search">
    <div class="from">
        <input type="text" bind:value={fromInput} placeholder="From..." on:input={() => updateSearch(false)}>
        <ul>
            {#if resultsFrom}
                {#each Object.keys(resultsFrom) as item}
                <li><button>{item}</button></li>
                {/each}
            {/if}
        </ul>
    </div>
    <div class="to">
        <input type="text" bind:value={toInput} placeholder="To..." on:input={() => updateSearch(true)}>
        <ul>
            {#if resultsTo}
                {#each Object.keys(resultsTo) as item}
                    <li><button>{item}</button></li>
                {/each}
            {/if}
        </ul>
    </div>
</div>

<script lang="ts">
    import { onMount } from 'svelte';

    let resultsTo: Record<string, string> = {};
    let resultsFrom: Record<string, string> = {};
    let toInput = "";
    let fromInput = "";
    // TODO: set from and to using the buttons in the input
    let from = "";
    let to = "";


    const searchWikipedia = async (q: string) => {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${q}&origin=*`);
        let resJson = await response.json();
        return resJson;
    };

    const updateSearch = (to: boolean) => {
        if (to === false) { // from
            searchWikipedia(fromInput).then(data => {
                resultsFrom = {};
                (data[1]).forEach((el: string, i: number) => {
                    resultsFrom[el] = data[3][i];
                })
            })
        }
        else if (to === true) { // to
            searchWikipedia(toInput).then(data => {
                resultsTo = {};
                (data[1]).forEach((el: string, i: number) => {
                    resultsTo[el] = data[3][i];
                })
            })
        }
    }
</script>