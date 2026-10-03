<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

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
      aria-label="Language selector"
  >
    <pv-button
        label="EN"
        size="small"
        :outlined="locale !== 'en'"
        :aria-pressed="locale === 'en'"
        @click="changeLanguage('en')"
    />

    <pv-button
        label="ES"
        size="small"
        :outlined="locale !== 'es'"
        :aria-pressed="locale === 'es'"
        @click="changeLanguage('es')"
    />
  </div>
</template>