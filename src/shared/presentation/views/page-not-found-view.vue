<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <main class="page-container">
    <section class="content-card">
      <span class="error-code">404</span>

      <h1>{{ t('notFound.title') }}</h1>

      <p>{{ t('notFound.description') }}</p>

      <router-link class="primary-link" to="/">
        {{ t('notFound.action') }}
      </router-link>
    </section>
  </main>
</template>