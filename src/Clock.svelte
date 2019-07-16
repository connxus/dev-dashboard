<style>
  .analog-clock {
    float: right;
    height: 150px;
    width: 150px;
  }

  .hour-hand {
    stroke: #CCC;
  }

  .minute-hand {
    stroke: #AAA;
  }

  .major-mark {
    stroke: #555;
    stroke-width: 1;
  }

  .major-mark-0,
  .major-mark-15,
  .major-mark-30,
  .major-mark-45 {
    stroke: #CCC;
  }

  .digital-time-output {
    z-index: 2;
  }

  .time-output {
    display: block;
    font-size: 4em;
  }

  .time-output span {
    margin: 0;
    padding: 0;
  }

  .date-output {
    display: block;
    font-size: 1.3em;
  }
</style>

<script>
  import { onMount } from 'svelte';
  import Box from './Box.svelte';

  const identifier = 'clock';

  let time = new Date();

  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // computed time segments updated when `date` changes
  $: hours = time.getHours();
  $: minutes = time.getMinutes();
  $: seconds = time.getSeconds();

  $: day = days[time.getDay()];
  $: month = months[time.getMonth()];
  $: date = time.getDate();
  $: year = time.getFullYear();

  onMount(() => {
    const interval = setInterval(() => {
      time = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<Box {identifier}>
  <svg class="analog-clock" viewBox="-50 -50 100 100">

    <!-- markers -->
    {#each [0,5,10,15,20,25,30,35,40,45,50,55] as minuteMarks}
      <line
        class="major-mark major-mark-{minuteMarks}"
        y1="30"
        y2="35"
        transform="rotate({30 * minuteMarks})"
      />
    {/each}

    <!-- hour hand -->
    <line
      class="hour-hand"
      y1="2"
      y2="-20"
      transform="rotate({30 * hours + minutes / 2})"
    />

    <!-- minute hand -->
    <line
      class="minute-hand"
      y1="4"
      y2="-30"
      transform="rotate({6 * minutes + seconds / 10})"
    />

  </svg>

  <div class="digital-time-output">
    <div class="time-output">
      <span class="hour">{hours > 12 ? hours-12 : hours}</span>:<span class="minute">{minutes >= 10 ? minutes : `0${minutes}`}</span>
      <span class="period">{hours > 12 ? 'PM' : 'AM'}</span>
    </div>
    <div class="date-output">
      <span class="day">{day}</span>,
      <span class="month">{month}</span>
      <span class="date">{date}</span>
      <span class="year">{year}</span>
    </div>
  </div>
</Box>