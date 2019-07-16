<style>
  .weather-condition h2 {
    font-size: 2em;
  }
  .weather-icon {
    font-size: 8em;
    float: right;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import Box from './Box.svelte';
  import config from './config.js';

  const identifier = 'weather';

  let weather;
  let weatherIcon = 'fa-sun';
  const weatherIcons = {
    'clear-day': 'fa-sun',
    'clear-night': 'fa-moon',
    'rain': 'fa-cloud-rain',
    'snow': 'fa-snowflake',
    'sleet': 'fa-snowflake',
    'wind': 'fa-wind',
    'fog': 'fa-smog',
    'cloudy': 'fa-cloud',
    'partly-cloudy-day': 'fa-cloud-sun',
    'partly-cloudy-night': 'fa-cloud-moon',
    'hail': 'fa-cloud-showers-heavy',
    'thunderstorm': 'fa-bolt',
    'tornado': 'poo-storm'
  };

  /**
   * Retrieves the weather details from the server
   * */
  function fetchWeather() {
    return fetch(`${config.apiLocation}/weather`)
      .then(res => {
        return res.json();
      });
  }

  /**
   * Calls fetchWeather. Called after the component has mounted itself to the DOM.
   * */
  function postMount() {
    fetchWeather().then(response => {
      weather = response.currently;
      weatherIcon = weatherIcons[weather.icon] || 'fa-sun';
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

<Box {identifier}>
  {#if weather}
    <section class="weather-condition">
      <i class="weather-icon fas {weatherIcon}"></i>
      <h2>{weather.summary}/{parseInt(weather.temperature)}<sup>&deg;</sup></h2>
      <h4>Mason, OH</h4>
    </section>
  {:else}
    <p class="txt-center">Loading...</p>
  {/if}
</Box>