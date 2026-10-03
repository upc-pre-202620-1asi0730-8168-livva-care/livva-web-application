<script setup>
import AppHeader from '../components/app-header.vue';
import AppFooter from '../components/app-footer.vue';
</script>

<template>
  <div class="default-layout">
    <app-header />

    <div class="default-layout__content">
      <slot />
    </div>

    <app-footer />
  </div>
</template>