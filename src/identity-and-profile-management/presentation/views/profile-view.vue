<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '../../application/user.store.js';

const userStore = useUserStore();
const { t } = useI18n();

const documentType = ref('');
const documentNumber = ref('');
const birthDate = ref('');
const address = ref('');
const district = ref('');
const province = ref('');
const department = ref('');
const country = ref('');

const editing = ref(false);

const loadProfile = async () => {
  if (!userStore.currentUser) {
    userStore.restoreSession();
  }

  if (!userStore.currentUser) {
    return;
  }

  const profile = await userStore.fetchProfile(
      userStore.currentUser.id
  );

  if (profile) {
    documentType.value = profile.documentType ?? '';
    documentNumber.value = profile.documentNumber ?? '';
    birthDate.value = profile.birthDate ?? '';
    address.value = profile.address ?? '';
    district.value = profile.district ?? '';
    province.value = profile.province ?? '';
    department.value = profile.department ?? '';
    country.value = profile.country ?? '';
  }
};

const saveProfile = async () => {
  if (!userStore.currentUser) return;

  const result = await userStore.saveProfile(
      userStore.currentUser.id,
      {
        documentType: documentType.value,
        documentNumber: documentNumber.value,
        birthDate: birthDate.value,
        address: address.value,
        district: district.value,
        province: province.value,
        department: department.value,
        country: country.value
      }
  );

  if (result) {
    editing.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <main class="profile-page">
    <section class="profile-card">
      <h1>{{ t('profile.title') }}</h1>

      <div
          v-if="userStore.currentUser"
          class="user-info"
      >
        <p>
          <strong>{{ t('profile.fields.name') }}:</strong>
          {{ userStore.currentUser.fullName }}
        </p>

        <p>
          <strong>{{ t('profile.fields.email') }}:</strong>
          {{ userStore.currentUser.email }}
        </p>

        <p>
          <strong>{{ t('profile.fields.phone') }}:</strong>
          {{ userStore.currentUser.phone || '-' }}
        </p>
      </div>

      <form @submit.prevent="saveProfile">
        <div class="field">
          <label for="documentType">
            {{ t('profile.fields.documentType') }}
          </label>

          <input
              id="documentType"
              v-model="documentType"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="documentNumber">
            {{ t('profile.fields.documentNumber') }}
          </label>

          <input
              id="documentNumber"
              v-model="documentNumber"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="birthDate">
            {{ t('profile.fields.birthDate') }}
          </label>

          <input
              id="birthDate"
              v-model="birthDate"
              type="date"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="address">
            {{ t('profile.fields.address') }}
          </label>

          <input
              id="address"
              v-model="address"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="district">
            {{ t('profile.fields.district') }}
          </label>

          <input
              id="district"
              v-model="district"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="province">
            {{ t('profile.fields.province') }}
          </label>

          <input
              id="province"
              v-model="province"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="department">
            {{ t('profile.fields.department') }}
          </label>

          <input
              id="department"
              v-model="department"
              type="text"
              :disabled="!editing"
          />
        </div>

        <div class="field">
          <label for="country">
            {{ t('profile.fields.country') }}
          </label>

          <input
              id="country"
              v-model="country"
              type="text"
              :disabled="!editing"
          />
        </div>

        <p
            v-if="userStore.error"
            class="error-message"
        >
          {{ t(userStore.error) }}
        </p>

        <div class="actions">
          <button
              v-if="!editing"
              type="button"
              @click="editing = true"
          >
            {{ t('profile.actions.edit') }}
          </button>

          <button
              v-else
              type="submit"
              :disabled="userStore.saving"
          >
            {{
              userStore.saving
                  ? t('profile.actions.saving')
                  : t('profile.actions.save')
            }}
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.profile-card {
  width: 100%;
  max-width: 700px;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
}

.profile-card h1 {
  margin-bottom: 1.5rem;
}

.user-info {
  margin-bottom: 2rem;
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

.field input:disabled {
  background: #f5f5f5;
}

.actions {
  margin-top: 1.5rem;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.error-message {
  color: #b42318;
}
</style>