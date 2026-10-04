<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useLifeInsuranceApplicationStore } from '../../application/life-insurance-application.store.js';
import LifeApplicationFormDialog from '../components/life-application-form-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();
const applicationStore = useLifeInsuranceApplicationStore();

const {
  products,
  insurers,
  applications,
  loading,
  saving,
  error
} = storeToRefs(applicationStore);

const formVisible = ref(false);

const creationUnavailable = computed(
    () => products.value.length === 0
);

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }
    ).format(amount);

const formatDate = (date) =>
    new Intl.DateTimeFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
    ).format(new Date(date));

const statusSeverity = (status) => {
  const severities = {
    pending: 'warn',
    under_review: 'info',
    approved: 'success',
    rejected: 'danger',
    cancelled: 'secondary'
  };

  return severities[status] ?? 'secondary';
};

const openForm = () => {
  applicationStore.clearError();
  formVisible.value = true;
};

const submitApplication = async (applicationData) => {
  const createdApplication =
      await applicationStore.createApplication(applicationData);

  if (!createdApplication) {
    toast.add({
      severity: 'error',
      summary: t(
          error.value ?? 'lifeApplications.errors.create'
      ),
      life: 3500
    });

    applicationStore.clearError();
    return;
  }

  formVisible.value = false;

  toast.add({
    severity: 'success',
    summary: t('lifeApplications.messages.created'),
    life: 3500
  });
};

onMounted(() => {
  applicationStore.fetchApplications();
});
</script>

<template>
  <main class="life-applications-page">
    <pv-toast />

    <header class="life-applications-page__heading">
      <div class="life-applications-page__header">
        <span class="section-label">
          {{ t('lifeApplications.sectionLabel') }}
        </span>

        <h1>{{ t('lifeApplications.title') }}</h1>

        <p>{{ t('lifeApplications.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-heart"
          :label="t('lifeApplications.actions.create')"
          :disabled="creationUnavailable || loading"
          @click="openForm"
      />
    </header>

    <pv-message
        v-if="!loading && creationUnavailable"
        severity="warn"
        :closable="false"
        class="life-applications-page__notice"
    >
      {{ t('lifeApplications.creationUnavailable') }}
    </pv-message>

    <div v-if="loading" class="life-applications-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading life applications"
      />
    </div>

    <pv-message
        v-else-if="error"
        severity="error"
        :closable="false"
    >
      {{ t(error) }}
    </pv-message>

    <pv-data-table
        v-else
        :value="applications"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="life-applications-table"
    >
      <template #empty>
        <div class="life-applications-state">
          <i class="pi pi-heart"></i>
          <p>{{ t('lifeApplications.empty') }}</p>
        </div>
      </template>

      <pv-column
          field="id"
          :header="t('lifeApplications.fields.number')"
      >
        <template #body="{ data }">
          #{{ data.id }}
        </template>
      </pv-column>

      <pv-column :header="t('lifeApplications.fields.product')">
        <template #body="{ data }">
          <strong>{{ data.product.name }}</strong>
          <span class="life-applications-table__secondary">
            {{ data.insurer.name }}
          </span>
        </template>
      </pv-column>

      <pv-column
          :header="t('lifeApplications.fields.requestedCoverage')"
      >
        <template #body="{ data }">
          {{ formatAmount(data.requestedCoverage) }}
        </template>
      </pv-column>

      <pv-column :header="t('lifeApplications.fields.status')">
        <template #body="{ data }">
          <pv-tag
              :value="t(`lifeApplications.statuses.${data.status}`)"
              :severity="statusSeverity(data.status)"
          />
        </template>
      </pv-column>

      <pv-column :header="t('lifeApplications.fields.createdAt')">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </pv-column>
    </pv-data-table>

    <life-application-form-dialog
        v-model:visible="formVisible"
        :saving="saving"
        :products="products"
        :insurers="insurers"
        @save="submitApplication"
    />
  </main>
</template>