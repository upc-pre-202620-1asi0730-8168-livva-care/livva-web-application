<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const currentYear = computed(() => new Date().getFullYear());

// Legal documents are published on the Livva landing page and shared by every product.
const landingPageUrl = import.meta.env.VITE_LANDING_PAGE_URL ??
    'https://upc-pre-202620-1asi0730-8168-livva-care.github.io/livva-landing-page';

const termsUrl = `${landingPageUrl}/terms.html`;
const privacyUrl = `${landingPageUrl}/privacy.html`;
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__content">
      <div class="app-footer__brand">
        <router-link
            class="app-footer__logo"
            to="/"
        >
          Livva<span>.</span>
        </router-link>

        <p>{{ t('footer.description') }}</p>
      </div>

      <nav
          class="app-footer__links"
          :aria-label="t('footer.navigationLabel')"
      >
        <router-link to="/">
          {{ t('navigation.home') }}
        </router-link>

        <router-link to="/about">
          {{ t('navigation.about') }}
        </router-link>

        <router-link to="/policies">
          {{ t('navigation.policies') }}
        </router-link>
      </nav>
    </div>

    <div class="app-footer__bottom">
      <p>
        {{ t('footer.copyright', { year: currentYear }) }}
      </p>

      <nav
          class="app-footer__legal"
          :aria-label="t('footer.legalLabel')"
      >
        <a
            :href="termsUrl"
            target="_blank"
            rel="noopener noreferrer"
        >
          {{ t('footer.terms') }}
        </a>

        <a
            :href="privacyUrl"
            target="_blank"
            rel="noopener noreferrer"
        >
          {{ t('footer.privacy') }}
        </a>
      </nav>
    </div>
  </footer>
</template>