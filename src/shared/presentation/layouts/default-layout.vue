<script setup>
import { useI18n } from 'vue-i18n';
import AppHeader from '../components/app-header.vue';
import AppFooter from '../components/app-footer.vue';

const { t } = useI18n();
</script>

<template>
  <div class="default-layout">
    <a class="skip-link" href="#main-content">
      {{ t('app.skipToContent') }}
    </a>

    <app-header />

    <div
        id="main-content"
        class="default-layout__content"
        tabindex="-1"
    >
      <slot />
    </div>

    <app-footer />

    <!-- Notices raised outside a view (API reasons, insurer reviews) use this group. -->
    <pv-toast group="global" />
  </div>
</template>