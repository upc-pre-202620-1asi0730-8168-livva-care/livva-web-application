<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const currentYear = computed(() => new Date().getFullYear());
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
    </div>
  </footer>
</template>