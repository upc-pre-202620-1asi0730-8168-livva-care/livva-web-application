<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../application/user.store.js';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const email = ref('');
const password = ref('');

const submitLogin = async () => {
  const success = await userStore.login(
      email.value,
      password.value
  );

  if (success) {
    await router.push('/profile');
  }
};
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <h1>{{ t('auth.login.title') }}</h1>

      <form @submit.prevent="submitLogin">
        <div class="field">
          <label for="email">
            {{ t('auth.login.email') }}
          </label>

          <input
              id="email"
              v-model="email"
              type="email"
              required
          />
        </div>

        <div class="field">
          <label for="password">
            {{ t('auth.login.password') }}
          </label>

          <input
              id="password"
              v-model="password"
              type="password"
              required
          />
        </div>

        <p
            v-if="userStore.error"
            class="error-message"
        >
          {{ t(userStore.error) }}
        </p>

        <button
            type="submit"
            :disabled="userStore.loading"
        >
          {{
            userStore.loading
                ? t('auth.login.signingIn')
                : t('auth.login.submit')
          }}
        </button>
      </form>

      <p class="register-link">
        {{ t('auth.login.noAccount') }}

        <RouterLink to="/register">
          {{ t('auth.login.createAccount') }}
        </RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
}

.login-card h1 {
  margin-bottom: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.field input {
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.error-message {
  margin-bottom: 1rem;
  color: #b42318;
}

.register-link {
  margin-top: 1rem;
  text-align: center;
}
</style>