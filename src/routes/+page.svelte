<style lang="scss">
    :global(html, body, body .mainDiv) {
        width: 100%;
        height: 100%;
        padding: 0;
        margin: 0;
        font-family: 
    }
    .search {
        display: flex;
        gap: 1em;
        input {
            padding: 1em;
            border-radius: .5em;
            border: 1px solid #ccc;
        }
    }
</style>

<div class="search">
    <div class="from">
        <input type="text" placeholder="From...">
    </div>
    <div class="to">
        <input type="text" placeholder="To...">
    </div>
</div>

<script lang="ts">
    import { onMount } from 'svelte';
    const searchWikipedia = async (q: String) => {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=${q}`, {
        });
        let json = await response.json();
        return json;
    };

    onMount(() => {
        searchWikipedia("pizza").then(d => {
            console.log(d);
        })
    });
</script>