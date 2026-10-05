<script setup>
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './language-switcher.vue';

const { t } = useI18n();
</script>

<template>
  <header class="app-header">
    <div class="app-header__content">
      <router-link
          class="app-logo"
          to="/"
          aria-label="Livva home"
      >
        Livva<span>.</span>
      </router-link>

      <nav class="app-navigation" aria-label="Main navigation">
        <router-link to="/">
          {{ t('navigation.home') }}
        </router-link>

        <router-link to="/about">
          {{ t('navigation.about') }}
        </router-link>

        <router-link to="/vehicles">
          {{ t('navigation.vehicles') }}
        </router-link>

        <router-link to="/policies">
          {{ t('navigation.policies') }}
        </router-link>

        <router-link to="/vehicle-applications">
          {{ t('navigation.applications') }}
        </router-link>

        <router-link to="/life-applications">
          {{ t('navigation.lifeApplications') }}
        </router-link>

        <router-link to="/beneficiaries">
          {{ t('navigation.beneficiaries') }}
        </router-link>

      </nav>

      <language-switcher />
    </div>
  </header>
</template>