<style>
.releases-content {text-align: center}
.release-desc {
  width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.column {
  float: left;
  width: 50%;
}
.row:after {
  content: "";
  display: table;
  clear: both;
}
</style>

<script>
  import { onMount } from 'svelte';
  import Box from './Box.svelte';
  import config from './config.js';

  const identifier = 'releases';

  let releases = [];

  /**
   * Retrieves the release details from the server
   * */
  function fetchReleases() {
    return fetch(`${config.apiLocation}/releases`)
      .then(res => {
        return res.json();
      });
  }

  /**
   * Calls fetchReleases. Called after the component has mounted itself to the DOM.
   * */
  function postMount() {
    fetchReleases().then(response => {
      releases = response.data;
    });
  }

  /**
   * Svelte JS Lifecycle hook to trigger function once component is mounted to the DOM.
   * */
  onMount(() => {
    postMount();
    // request again in 30 minutes
    setTimeout(postMount, 1000 * 60 * 30);
  });
</script>

{#each releases as release}
  <Box {identifier}>
    <section class="releases-content">
      <h2>{release.title}</h2>
      <center>
        <p class="release-desc">{release.description}</p>
        <div class="row">
          <div class="column">
            <h1>{release.appIssueCount}</h1>
            <label>App</label>
          </div>
          <div class="column">
            <h1>{release.apiIssueCount}</h1>
            <label>Api</label>
          </div>
        </div>
        {#if release.daysLeft > 0}
          <p>Due in {release.daysLeft} {#if release.daysLeft > 1}Days{:else}Day{/if}</p>
        {:else}
          <p>Due Today</p>
        {/if}
      </center>
    </section>
  </Box>
{/each}