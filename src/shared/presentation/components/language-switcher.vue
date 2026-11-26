<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();

const supportedLocales = ['en', 'es'];

const changeLanguage = (language) => {
  if (!supportedLocales.includes(language)) return;

  locale.value = language;
  document.documentElement.lang = language;
  localStorage.setItem('livva-language', language);
};

onMounted(() => {
  document.documentElement.lang = locale.value;
});
</script>

<template>
  <div
      class="language-switcher"
      role="group"
      :aria-label="t('app.languageSelector')"
  >
    <pv-button
        label="EN"
        lang="en"
        :aria-label="t('app.languages.en')"
        size="small"
        :outlined="locale !== 'en'"
        :aria-pressed="locale === 'en'"
        @click="changeLanguage('en')"
    />

    <pv-button
        label="ES"
        lang="es"
        :aria-label="t('app.languages.es')"
        size="small"
        :outlined="locale !== 'es'"
        :aria-pressed="locale === 'es'"
        @click="changeLanguage('es')"
    />
  </div>
</template>