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

  function fetchWeather() {
    return fetch(`${config.apiLocation}/weather`)
      .then(res => {
        return res.json();
      });
  }

  onMount(() => {
    fetchWeather().then(response => {
      weather = response.currently;
      weatherIcon = weatherIcons[weather.icon] || 'fa-sun';
      console.log(weather);
    });
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