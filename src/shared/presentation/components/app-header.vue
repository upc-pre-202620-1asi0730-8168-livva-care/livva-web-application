<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import LanguageSwitcher from './language-switcher.vue';

import { useUserStore } from '../../../identity-and-profile-management/application/user.store.js';
import { usePolicyStore } from '../../../policy-management/application/policy.store.js';
import { useNotificationStore } from '../../../notification-management/application/notification.store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const policyStore = usePolicyStore();
const notificationStore = useNotificationStore();

userStore.restoreSession();

const vehicleMenu = ref(null);
const lifeMenu = ref(null);

const unreadCount = computed(
    () => notificationStore.unreadCount
);

const displayedUnreadCount = computed(() =>
    unreadCount.value > 99
        ? '99+'
        : unreadCount.value
);

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

const loadNotifications = async (userId) => {
  await policyStore.fetchPolicies();

  if (policyStore.error) {
    return;
  }

  await notificationStore
      .generateExpirationNotifications(
          policyStore.policies,
          userId
      );
};

const logout = async () => {
  userStore.logout();
  closeMenus();
  await router.push('/login');
};

watch(
    () => userStore.currentUser?.id,
    async (userId) => {
      if (!userId) {
        return;
      }

      await loadNotifications(userId);
    },
    {
      immediate: true
    }
);
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
        <router-link
            to="/"
            @click="closeMenus"
        >
          {{ t('navigation.home') }}
        </router-link>

        <router-link
            to="/about"
            @click="closeMenus"
        >
          {{ t('navigation.about') }}
        </router-link>

        <router-link
            to="/policies"
            @click="closeMenus"
        >
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

      <div class="app-auth">
        <template v-if="!userStore.currentUser">
          <router-link
              to="/login"
              @click="closeMenus"
          >
            {{ t('navigation.login') }}
          </router-link>

          <router-link
              to="/register"
              @click="closeMenus"
          >
            {{ t('navigation.register') }}
          </router-link>
        </template>

        <template v-else>
          <router-link
              to="/notifications"
              class="notification-link"
              :aria-label="t('navigation.notifications')"
              :title="t('navigation.notifications')"
              @click="closeMenus"
          >
            <i class="pi pi-bell"></i>

            <span
                v-if="unreadCount > 0"
                class="notification-badge"
            >
              {{ displayedUnreadCount }}
            </span>
          </router-link>

          <router-link
              to="/profile"
              @click="closeMenus"
          >
            {{ t('navigation.profile') }}
          </router-link>

          <button
              type="button"
              class="logout-button"
              @click="logout"
          >
            {{ t('navigation.logout') }}
          </button>
        </template>
      </div>

      <language-switcher />
    </div>
  </header>
</template>

<style scoped>
.app-auth {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-auth a {
  color: #52627a;
  font-weight: 500;
  text-decoration: none;
}

.app-auth a:hover,
.app-auth a.router-link-active {
  color: #2563eb;
}

.notification-link {
  position: relative;
  display: inline-grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid #dbe4f0;
  border-radius: 50%;
}

.notification-link .pi {
  font-size: 1.1rem;
}

.notification-badge {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  display: grid;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 0.25rem;
  place-items: center;
  color: #ffffff;
  background: #ef4444;
  border: 2px solid #ffffff;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
}

.logout-button {
  padding: 0;
  color: #52627a;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 500;
}

.logout-button:hover {
  color: #2563eb;
}

@media (max-width: 640px) {
  .app-auth {
    margin-left: auto;
  }
}
</style>