<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from './language-switcher.vue';

const { t } = useI18n();
const route = useRoute();

const vehicleMenu = ref(null);
const lifeMenu = ref(null);

const vehicleSectionActive = computed(() =>
    route.path.startsWith('/vehicles') ||
    route.path.startsWith('/vehicle-applications') ||
    route.path.startsWith('/vehicle-claims')
);

const lifeSectionActive = computed(() =>
    route.path.startsWith('/life-applications') ||
    route.path.startsWith('/beneficiaries')
);

const closeMenus = () => {
  if (vehicleMenu.value) {
    vehicleMenu.value.open = false;
  }

  if (lifeMenu.value) {
    lifeMenu.value.open = false;
  }
};

const closeOtherMenu = (menu) => {
  if (
      menu === 'vehicle' &&
      vehicleMenu.value?.open &&
      lifeMenu.value
  ) {
    lifeMenu.value.open = false;
  }

  if (
      menu === 'life' &&
      lifeMenu.value?.open &&
      vehicleMenu.value
  ) {
    vehicleMenu.value.open = false;
  }
};
</script>

<template>
  <header class="app-header">
    <div class="app-header__content">
      <router-link
          class="app-logo"
          to="/"
          aria-label="Livva home"
          @click="closeMenus"
      >
        Livva<span>.</span>
      </router-link>

      <nav
          class="app-navigation"
          :aria-label="t('navigation.main')"
      >
        <router-link to="/" @click="closeMenus">
          {{ t('navigation.home') }}
        </router-link>

        <router-link to="/about" @click="closeMenus">
          {{ t('navigation.about') }}
        </router-link>

        <router-link to="/policies" @click="closeMenus">
          {{ t('navigation.policies') }}
        </router-link>

        <details
            ref="vehicleMenu"
            class="app-navigation__group"
            :class="{
              'app-navigation__group--active':
                vehicleSectionActive
            }"
            @toggle="closeOtherMenu('vehicle')"
        >
          <summary>
            {{ t('navigation.vehicleInsurance') }}
            <i class="pi pi-chevron-down"></i>
          </summary>

          <div class="app-navigation__dropdown">
            <router-link
                to="/vehicles"
                @click="closeMenus"
            >
              <i class="pi pi-car"></i>
              {{ t('navigation.vehicles') }}
            </router-link>

            <router-link
                to="/vehicle-claims"
                @click="closeMenus"
            >
              <i class="pi pi-exclamation-circle"></i>
              {{ t('navigation.vehicleClaims') }}
            </router-link>

            <router-link
                to="/vehicle-applications"
                @click="closeMenus"
            >
              <i class="pi pi-file-edit"></i>
              {{ t('navigation.applications') }}
            </router-link>
          </div>
        </details>

        <details
            ref="lifeMenu"
            class="app-navigation__group"
            :class="{
              'app-navigation__group--active':
                lifeSectionActive
            }"
            @toggle="closeOtherMenu('life')"
        >
          <summary>
            {{ t('navigation.lifeInsurance') }}
            <i class="pi pi-chevron-down"></i>
          </summary>

          <div class="app-navigation__dropdown">
            <router-link
                to="/life-applications"
                @click="closeMenus"
            >
              <i class="pi pi-heart"></i>
              {{ t('navigation.lifeApplications') }}
            </router-link>

            <router-link
                to="/beneficiaries"
                @click="closeMenus"
            >
              <i class="pi pi-users"></i>
              {{ t('navigation.beneficiaries') }}
            </router-link>
          </div>
        </details>
      </nav>

      <language-switcher />
    </div>
  </header>
</template>