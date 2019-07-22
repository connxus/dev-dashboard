<style>
  .layout-box {
    position: relative;
    background-color: #303030;
    border-radius: 15px;
    padding: 1em;
  }
</style>

<script>
  export let identifier = 'box';
</script>

<section class="layout-box" id={identifier}>
  <slot></slot>
</section>