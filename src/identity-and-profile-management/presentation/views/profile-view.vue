<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useUserStore } from '../../application/user.store.js';

const userStore = useUserStore();
const toast = useToast();
const { t } = useI18n();

const editing = ref(false);
const today = new Date().toISOString().split('T')[0];

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  documentType: null,
  documentNumber: '',
  birthDate: '',
  address: '',
  district: '',
  province: '',
  department: '',
  country: ''
});

const documentTypeOptions = computed(() => [
  { value: 'DNI', label: t('profile.documentTypes.dni') },
  { value: 'CE', label: t('profile.documentTypes.foreignCard') },
  { value: 'PASSPORT', label: t('profile.documentTypes.passport') }
]);

const populateForm = () => {
  const user = userStore.currentUser;
  const profile = userStore.currentProfile;

  form.firstName = user?.firstName ?? '';
  form.lastName = user?.lastName ?? '';
  form.phone = user?.phone ?? '';
  form.documentType = profile?.documentType ?? null;
  form.documentNumber = profile?.documentNumber ?? '';
  form.birthDate = profile?.birthDate ?? '';
  form.address = profile?.address ?? '';
  form.district = profile?.district ?? '';
  form.province = profile?.province ?? '';
  form.department = profile?.department ?? '';
  form.country = profile?.country ?? '';
};

const loadProfile = async () => {
  if (!userStore.currentUser) {
    userStore.restoreSession();
  }

  if (!userStore.currentUser) return;

  await userStore.fetchProfile(userStore.currentUser.id);
  populateForm();
};

const startEditing = () => {
  userStore.clearError();
  populateForm();
  editing.value = true;
};

const cancelEditing = () => {
  populateForm();
  editing.value = false;
  userStore.clearError();
};

const saveProfile = async () => {
  if (!userStore.currentUser) return;

  if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
    toast.add({
      severity: 'warn',
      summary: t('profile.validation.name'),
      life: 3000
    });
    return;
  }

  const updatedUser = await userStore.updateUser(
      userStore.currentUser.id,
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim()
      }
  );

  if (!updatedUser) return;

  const updatedProfile = await userStore.saveProfile(
      updatedUser.id,
      {
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim().toUpperCase(),
        birthDate: form.birthDate,
        address: form.address.trim(),
        district: form.district.trim(),
        province: form.province.trim(),
        department: form.department.trim(),
        country: form.country.trim()
      }
  );

  if (!updatedProfile) return;

  editing.value = false;
  toast.add({
    severity: 'success',
    summary: t('profile.messages.updated'),
    life: 3000
  });
};

onMounted(loadProfile);
</script>

<template>
  <main class="profile-page">
    <pv-toast />

    <div v-if="userStore.loading" class="vehicles-state">
      <pv-progress-spinner stroke-width="4" />
    </div>

    <section v-else class="profile-card">
      <header class="profile-card__header">
        <div>
          <span class="section-label">
            {{ t('profile.sectionLabel') }}
          </span>
          <h1>{{ t('profile.title') }}</h1>
          <p>{{ t('profile.description') }}</p>
        </div>

        <pv-button
            v-if="!editing"
            icon="pi pi-pencil"
            :label="t('profile.actions.edit')"
            @click="startEditing"
        />
      </header>

      <form class="profile-form" @submit.prevent="saveProfile">
        <div class="profile-form__field">
          <label for="profile-first-name">
            {{ t('profile.fields.firstName') }}
          </label>
          <pv-input-text
              id="profile-first-name"
              v-model="form.firstName"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-last-name">
            {{ t('profile.fields.lastName') }}
          </label>
          <pv-input-text
              id="profile-last-name"
              v-model="form.lastName"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-email">
            {{ t('profile.fields.email') }}
          </label>
          <pv-input-text
              id="profile-email"
              :model-value="userStore.currentUser?.email"
              disabled
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-phone">
            {{ t('profile.fields.phone') }}
          </label>
          <pv-input-text
              id="profile-phone"
              v-model="form.phone"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-document-type">
            {{ t('profile.fields.documentType') }}
          </label>
          <pv-select
              id="profile-document-type"
              v-model="form.documentType"
              :options="documentTypeOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('profile.placeholders.documentType')"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-document-number">
            {{ t('profile.fields.documentNumber') }}
          </label>
          <pv-input-text
              id="profile-document-number"
              v-model="form.documentNumber"
              maxlength="12"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-birth-date">
            {{ t('profile.fields.birthDate') }}
          </label>
          <input
              id="profile-birth-date"
              v-model="form.birthDate"
              type="date"
              :max="today"
              class="p-inputtext p-component"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-address">
            {{ t('profile.fields.address') }}
          </label>
          <pv-input-text
              id="profile-address"
              v-model="form.address"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-district">
            {{ t('profile.fields.district') }}
          </label>
          <pv-input-text
              id="profile-district"
              v-model="form.district"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-province">
            {{ t('profile.fields.province') }}
          </label>
          <pv-input-text
              id="profile-province"
              v-model="form.province"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-department">
            {{ t('profile.fields.department') }}
          </label>
          <pv-input-text
              id="profile-department"
              v-model="form.department"
              :disabled="!editing"
          />
        </div>

        <div class="profile-form__field">
          <label for="profile-country">
            {{ t('profile.fields.country') }}
          </label>
          <pv-input-text
              id="profile-country"
              v-model="form.country"
              :disabled="!editing"
          />
        </div>

        <pv-message
            v-if="userStore.error"
            severity="error"
            :closable="false"
            class="profile-form__full"
        >
          {{ t(userStore.error) }}
        </pv-message>

        <footer v-if="editing" class="profile-form__actions">
          <pv-button
              type="button"
              severity="secondary"
              outlined
              :label="t('profile.actions.cancel')"
              :disabled="userStore.saving"
              @click="cancelEditing"
          />
          <pv-button
              type="submit"
              icon="pi pi-check"
              :label="t('profile.actions.save')"
              :loading="userStore.saving"
          />
        </footer>
      </form>
    </section>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 180px);
  padding: 3rem max(1.5rem, calc((100vw - 1500px) / 2));
}

.profile-card {
  padding: 2.5rem;
  border: 1px solid #dbe3ef;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 50px rgb(15 39 77 / 8%);
}

.profile-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-bottom: 2rem;
}

.profile-card__header h1 {
  margin: 0.5rem 0;
  color: #071c44;
  font-size: clamp(2rem, 5vw, 3.5rem);
}

.profile-card__header p {
  margin: 0;
  color: #49617e;
}

.profile-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.profile-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.profile-form__field label {
  color: #071c44;
  font-weight: 600;
}

.profile-form__field :deep(.p-inputtext),
.profile-form__field :deep(.p-select),
.profile-form__field > input {
  width: 100%;
}

.profile-form__actions,
.profile-form__full {
  grid-column: 1 / -1;
}

.profile-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.75rem;
}

@media (max-width: 720px) {
  .profile-card {
    padding: 1.5rem;
  }

  .profile-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .profile-form {
    grid-template-columns: 1fr;
  }
}
</style>
