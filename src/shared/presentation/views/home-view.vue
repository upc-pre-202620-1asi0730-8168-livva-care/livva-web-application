<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <main class="home-page">
    <section class="home-hero">
      <div class="home-hero__content">
        <span class="section-label">
          {{ t('home.heroLabel') }}
        </span>

        <h1>{{ t('home.title') }}</h1>

        <p>
          {{ t('home.description') }}
        </p>

        <div class="home-hero__actions">
          <router-link
              class="primary-link"
              to="/policies"
          >
            <i class="pi pi-file"></i>
            {{ t('home.actions.policies') }}
          </router-link>

          <router-link
              class="secondary-link"
              to="/about"
          >
            {{ t('home.actions.about') }}
          </router-link>
        </div>
      </div>

      <div class="home-hero__visual">
        <div class="home-hero__shield">
          <i class="pi pi-shield"></i>
        </div>

        <div class="home-hero__floating-card">
          <i class="pi pi-check-circle"></i>

          <div>
            <strong>{{ t('home.protectedTitle') }}</strong>
            <span>{{ t('home.protectedDescription') }}</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>