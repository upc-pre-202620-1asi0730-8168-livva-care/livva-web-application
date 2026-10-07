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
    <section class="home-services">
      <div class="home-section-heading">
    <span class="section-label">
      {{ t('home.services.label') }}
    </span>

        <h2>{{ t('home.services.title') }}</h2>

        <p>{{ t('home.services.description') }}</p>
      </div>

      <div class="home-services__grid">
        <article class="service-card">
          <div class="service-card__icon">
            <i class="pi pi-car"></i>
          </div>

          <h3>{{ t('home.services.vehicle.title') }}</h3>

          <p>{{ t('home.services.vehicle.description') }}</p>

          <router-link to="/vehicles">
            {{ t('home.services.action') }}
            <i class="pi pi-arrow-right"></i>
          </router-link>
        </article>

        <article class="service-card">
          <div class="service-card__icon">
            <i class="pi pi-heart"></i>
          </div>

          <h3>{{ t('home.services.life.title') }}</h3>

          <p>{{ t('home.services.life.description') }}</p>

          <router-link to="/life-applications">
            {{ t('home.services.action') }}
            <i class="pi pi-arrow-right"></i>
          </router-link>
        </article>

        <article class="service-card">
          <div class="service-card__icon">
            <i class="pi pi-file"></i>
          </div>

          <h3>{{ t('home.services.policies.title') }}</h3>

          <p>{{ t('home.services.policies.description') }}</p>

          <router-link to="/policies">
            {{ t('home.services.action') }}
            <i class="pi pi-arrow-right"></i>
          </router-link>
        </article>
      </div>
    </section>
  </main>
</template>