<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <main class="page-container">
    <section class="content-card">
      <h1>{{ t('about.title') }}</h1>

      <p>{{ t('about.description') }}</p>

      <router-link class="secondary-link" to="/">
        {{ t('navigation.home') }}
      </router-link>
    </section>
  </main>
</template>