<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <main class="about-page">
    <section class="about-intro">
      <span class="section-label">
        {{ t('about.sectionLabel') }}
      </span>

      <h1>{{ t('about.title') }}</h1>

      <p>{{ t('about.description') }}</p>
    </section>

    <section class="about-values">
      <article class="about-value-card">
        <i class="pi pi-lock"></i>

        <h2>{{ t('about.values.security.title') }}</h2>

        <p>{{ t('about.values.security.description') }}</p>
      </article>

      <article class="about-value-card">
        <i class="pi pi-bolt"></i>

        <h2>{{ t('about.values.digital.title') }}</h2>

        <p>{{ t('about.values.digital.description') }}</p>
      </article>

      <article class="about-value-card">
        <i class="pi pi-users"></i>

        <h2>{{ t('about.values.people.title') }}</h2>

        <p>{{ t('about.values.people.description') }}</p>
      </article>
    </section>

    <section class="about-mission">
      <div>
        <span class="section-label">
          {{ t('about.mission.label') }}
        </span>

        <h2>{{ t('about.mission.title') }}</h2>

        <p>{{ t('about.mission.description') }}</p>
      </div>

      <div>
        <span class="section-label">
          {{ t('about.vision.label') }}
        </span>

        <h2>{{ t('about.vision.title') }}</h2>

        <p>{{ t('about.vision.description') }}</p>
      </div>
    </section>
  </main>
</template>