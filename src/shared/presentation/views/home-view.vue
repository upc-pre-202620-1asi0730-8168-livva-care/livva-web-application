<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <main class="page-container">
    <section class="hero-section">
      <span class="brand-name">{{ t('app.name') }}</span>

      <h1>{{ t('home.title') }}</h1>

      <p>{{ t('home.description') }}</p>

      <router-link class="secondary-link" to="/about">
        {{ t('navigation.about') }}
      </router-link>
    </section>
  </main>
</template>