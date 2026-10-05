<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../application/user.store.js';

const router = useRouter();
const userStore = useUserStore();
const { t } = useI18n();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const phone = ref('');

const submitRegister = async () => {
  const user = await userStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    passwordHash: password.value,
    phone: phone.value
  });

  if (user) {
    await router.push('/login');
  }
};
</script>

<template>
  <main class="register-page">
    <section class="register-card">
      <h1>{{ t('auth.register.title') }}</h1>

      <form @submit.prevent="submitRegister">
        <div class="field">
          <label for="firstName">
            {{ t('auth.register.firstName') }}
          </label>

          <input
              id="firstName"
              v-model="firstName"
              type="text"
              required
          />
        </div>

        <div class="field">
          <label for="lastName">
            {{ t('auth.register.lastName') }}
          </label>

          <input
              id="lastName"
              v-model="lastName"
              type="text"
              required
          />
        </div>

        <div class="field">
          <label for="email">
            {{ t('auth.register.email') }}
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
            {{ t('auth.register.password') }}
          </label>

          <input
              id="password"
              v-model="password"
              type="password"
              required
          />
        </div>

        <div class="field">
          <label for="phone">
            {{ t('auth.register.phone') }}
          </label>

          <input
              id="phone"
              v-model="phone"
              type="text"
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
            :disabled="userStore.saving"
        >
          {{
            userStore.saving
                ? t('auth.register.creating')
                : t('auth.register.submit')
          }}
        </button>
      </form>

      <p class="login-link">
        {{ t('auth.register.alreadyHaveAccount') }}

        <RouterLink to="/login">
          {{ t('auth.register.signIn') }}
        </RouterLink>
      </p>
    </section>
  </main>
</template>

<style scoped>
.register-page {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
}

.register-card h1 {
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

.login-link {
  margin-top: 1rem;
  text-align: center;
}
</style>