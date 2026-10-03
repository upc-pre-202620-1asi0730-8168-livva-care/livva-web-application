<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <footer class="app-footer">
    <p>
      {{ t('footer.copyright', { year: currentYear }) }}
    </p>
  </footer>
</template>