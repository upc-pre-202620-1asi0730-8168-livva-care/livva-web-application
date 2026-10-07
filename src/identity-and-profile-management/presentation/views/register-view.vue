<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '../../application/user.store.js';

const router = useRouter();
const userStore = useUserStore();
const toast = useToast();
const { t } = useI18n();

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  phone: ''
});

const errors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  phone: ''
});

const clearErrors = () => {
  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });
  userStore.clearError();
};

const validateForm = () => {
  clearErrors();

  if (form.firstName.trim().length < 2) {
    errors.firstName = t('auth.validation.name');
  }
  if (form.lastName.trim().length < 2) {
    errors.lastName = t('auth.validation.name');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = t('auth.validation.email');
  }
  if (form.password.length < 6) {
    errors.password = t('auth.validation.password');
  }
  if (form.passwordConfirmation !== form.password) {
    errors.passwordConfirmation = t('auth.validation.passwordConfirmation');
  }
  if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone.trim())) {
    errors.phone = t('auth.validation.phone');
  }

  return Object.values(errors).every((error) => !error);
};

const submitRegister = async () => {
  if (!validateForm()) return;

  const user = await userStore.register({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    passwordHash: form.password,
    phone: form.phone
  });

  if (!user) return;

  toast.add({
    severity: 'success',
    summary: t('auth.messages.registered'),
    life: 3000
  });

  await router.push('/login');
};
</script>

<template>
  <main class="auth-page">
    <pv-toast />

    <section class="auth-card">
      <span class="section-label">
        {{ t('auth.register.sectionLabel') }}
      </span>
      <h1>{{ t('auth.register.title') }}</h1>
      <p>{{ t('auth.register.description') }}</p>

      <form class="auth-form" @submit.prevent="submitRegister">
        <div class="auth-form__grid">
          <div class="auth-form__field">
            <label for="register-first-name">
              {{ t('auth.register.firstName') }}
            </label>
            <pv-input-text
                id="register-first-name"
                v-model="form.firstName"
                :invalid="Boolean(errors.firstName)"
                autocomplete="given-name"
            />
            <small v-if="errors.firstName" class="auth-form__error">
              {{ errors.firstName }}
            </small>
          </div>

          <div class="auth-form__field">
            <label for="register-last-name">
              {{ t('auth.register.lastName') }}
            </label>
            <pv-input-text
                id="register-last-name"
                v-model="form.lastName"
                :invalid="Boolean(errors.lastName)"
                autocomplete="family-name"
            />
            <small v-if="errors.lastName" class="auth-form__error">
              {{ errors.lastName }}
            </small>
          </div>
        </div>

        <div class="auth-form__field">
          <label for="register-email">
            {{ t('auth.register.email') }}
          </label>
          <pv-input-text
              id="register-email"
              v-model="form.email"
              type="email"
              :invalid="Boolean(errors.email)"
              autocomplete="email"
          />
          <small v-if="errors.email" class="auth-form__error">
            {{ errors.email }}
          </small>
        </div>

        <div class="auth-form__grid">
          <div class="auth-form__field">
            <label for="register-password">
              {{ t('auth.register.password') }}
            </label>
            <pv-input-text
                id="register-password"
                v-model="form.password"
                type="password"
                :invalid="Boolean(errors.password)"
                autocomplete="new-password"
            />
            <small v-if="errors.password" class="auth-form__error">
              {{ errors.password }}
            </small>
          </div>

          <div class="auth-form__field">
            <label for="register-password-confirmation">
              {{ t('auth.register.passwordConfirmation') }}
            </label>
            <pv-input-text
                id="register-password-confirmation"
                v-model="form.passwordConfirmation"
                type="password"
                :invalid="Boolean(errors.passwordConfirmation)"
                autocomplete="new-password"
            />
            <small
                v-if="errors.passwordConfirmation"
                class="auth-form__error"
            >
              {{ errors.passwordConfirmation }}
            </small>
          </div>
        </div>

        <div class="auth-form__field">
          <label for="register-phone">
            {{ t('auth.register.phone') }}
          </label>
          <pv-input-text
              id="register-phone"
              v-model="form.phone"
              :invalid="Boolean(errors.phone)"
              autocomplete="tel"
          />
          <small v-if="errors.phone" class="auth-form__error">
            {{ errors.phone }}
          </small>
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
            icon="pi pi-user-plus"
            :label="t('auth.register.submit')"
            :loading="userStore.saving"
        />
      </form>

      <p class="auth-card__link">
        {{ t('auth.register.alreadyHaveAccount') }}
        <router-link to="/login">
          {{ t('auth.register.signIn') }}
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
  width: min(100%, 680px);
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

.auth-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
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

.auth-form__error {
  color: #c62828;
}

.auth-card__link {
  margin: 1.5rem 0 0;
  text-align: center;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 1.5rem;
  }

  .auth-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>
