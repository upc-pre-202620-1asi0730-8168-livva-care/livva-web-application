<script setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../application/user.store.js';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const form = reactive({
  email: '',
  password: ''
});

const submitLogin = async () => {
  userStore.clearError();

  const success = await userStore.login(
      form.email,
      form.password
  );

  if (!success) return;

  const redirect = typeof route.query.redirect === 'string'
      ? route.query.redirect
      : '/profile';

  await router.push(redirect);
};
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <span class="section-label">
        {{ t('auth.login.sectionLabel') }}
      </span>
      <h1>{{ t('auth.login.title') }}</h1>
      <p>{{ t('auth.login.description') }}</p>

      <form class="auth-form" @submit.prevent="submitLogin">
        <div class="auth-form__field">
          <label for="login-email">
            {{ t('auth.login.email') }}
          </label>
          <pv-input-text
              id="login-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
          />
        </div>

        <div class="auth-form__field">
          <label for="login-password">
            {{ t('auth.login.password') }}
          </label>
          <pv-input-text
              id="login-password"
              v-model="form.password"
              type="password"
              autocomplete="current-password"
          />
        </div>

        <pv-message
            v-if="userStore.error"
            severity="error"
            :closable="false"
        >
          {{ t(userStore.error) }}
        </pv-message>

        <pv-button
            type="submit"
            icon="pi pi-sign-in"
            :label="t('auth.login.submit')"
            :loading="userStore.loading"
            :disabled="!form.email || !form.password"
        />
      </form>

      <p class="auth-card__link">
        {{ t('auth.login.noAccount') }}
        <router-link to="/register">
          {{ t('auth.login.createAccount') }}
        </router-link>
      </p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 180px);
  display: grid;
  place-items: center;
  padding: 3rem 1.5rem;
}

.auth-card {
  width: min(100%, 480px);
  padding: 2.5rem;
  border: 1px solid #dbe3ef;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 50px rgb(15 39 77 / 8%);
}

.auth-card h1 {
  margin: 0.5rem 0;
  color: #071c44;
  font-size: clamp(2rem, 5vw, 3rem);
}

.auth-card > p:not(.auth-card__link) {
  margin: 0 0 2rem;
  color: #49617e;
}

.auth-form,
.auth-form__field {
  display: flex;
  flex-direction: column;
}

.auth-form {
  gap: 1.25rem;
}

.auth-form__field {
  gap: 0.5rem;
}

.auth-form__field label {
  color: #071c44;
  font-weight: 600;
}

.auth-form__field :deep(.p-inputtext) {
  width: 100%;
}

.auth-card__link {
  margin: 1.5rem 0 0;
  text-align: center;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
