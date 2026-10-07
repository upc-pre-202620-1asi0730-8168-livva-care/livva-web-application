<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useVehicleInsuranceApplicationStore } from '../../application/vehicle-insurance-application.store.js';
import VehicleApplicationFormDialog from '../components/vehicle-application-form-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();
const applicationStore = useVehicleInsuranceApplicationStore();

const {
  vehicles,
  products,
  insurers,
  applications,
  loading,
  saving,
  error
} = storeToRefs(applicationStore);

const formVisible = ref(false);

const creationUnavailable = computed(
    () => vehicles.value.length === 0 || products.value.length === 0
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
          error.value ?? 'vehicleApplications.errors.create'
      ),
      life: 3500
    });

    applicationStore.clearError();
    return;
  }

  formVisible.value = false;

  toast.add({
    severity: 'success',
    summary: t('vehicleApplications.messages.created'),
    life: 3500
  });
};

const cancelApplication = async (application) => {
  const cancelled =
      await applicationStore.cancelApplication(application.id);

  if (!cancelled) {
    toast.add({
      severity: 'error',
      summary: t(
          error.value ?? 'vehicleApplications.errors.cancel'
      ),
      life: 3500
    });

    applicationStore.clearError();
    return;
  }

  toast.add({
    severity: 'success',
    summary: t('vehicleApplications.messages.cancelled'),
    life: 3500
  });
};

onMounted(() => {
  applicationStore.fetchApplications();
});
</script>

<template>
  <main class="vehicle-applications-page">
    <pv-toast />

    <header class="vehicle-applications-page__heading">
      <div class="vehicle-applications-page__header">
        <span class="section-label">
          {{ t('vehicleApplications.sectionLabel') }}
        </span>

        <h1>{{ t('vehicleApplications.title') }}</h1>

        <p>{{ t('vehicleApplications.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-send"
          :label="t('vehicleApplications.actions.create')"
          :disabled="creationUnavailable || loading"
          @click="openForm"
      />
    </header>

    <pv-message
        v-if="!loading && creationUnavailable"
        severity="warn"
        :closable="false"
        class="vehicle-applications-page__notice"
    >
      {{ t('vehicleApplications.creationUnavailable') }}
    </pv-message>

    <div v-if="loading" class="vehicle-applications-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading applications"
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
        class="vehicle-applications-table"
    >
      <template #empty>
        <div class="vehicle-applications-state">
          <i class="pi pi-file-edit"></i>
          <p>{{ t('vehicleApplications.empty') }}</p>
        </div>
      </template>

      <pv-column
          field="id"
          :header="t('vehicleApplications.fields.number')"
      >
        <template #body="{ data }">
          #{{ data.id }}
        </template>
      </pv-column>

      <pv-column :header="t('vehicleApplications.fields.vehicle')">
        <template #body="{ data }">
          <strong>{{ data.vehicle.licensePlate }}</strong>
          <span class="vehicle-applications-table__secondary">
            {{ data.vehicle.brand }} {{ data.vehicle.model }}
          </span>
        </template>
      </pv-column>

      <pv-column :header="t('vehicleApplications.fields.product')">
        <template #body="{ data }">
          <strong>{{ data.product.name }}</strong>
          <span class="vehicle-applications-table__secondary">
            {{ data.insurer.name }}
          </span>
        </template>
      </pv-column>

      <pv-column
          :header="t('vehicleApplications.fields.requestedCoverage')"
      >
        <template #body="{ data }">
          {{ formatAmount(data.requestedCoverage) }}
        </template>
      </pv-column>

      <pv-column :header="t('vehicleApplications.fields.status')">
        <template #body="{ data }">
          <pv-tag
              :value="
              t(`vehicleApplications.statuses.${data.status}`)
            "
              :severity="statusSeverity(data.status)"
          />
        </template>
      </pv-column>

      <pv-column :header="t('vehicleApplications.fields.createdAt')">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </pv-column>

      <pv-column :header="t('vehicleApplications.fields.actions')">
        <template #body="{ data }">
          <pv-button
              v-if="['pending', 'under_review'].includes(data.status)"
              icon="pi pi-times"
              :label="t('vehicleApplications.actions.cancelApplication')"
              severity="danger"
              outlined
              size="small"
              :disabled="saving"
              @click="cancelApplication(data)"
          />
        </template>
      </pv-column>

    </pv-data-table>

    <vehicle-application-form-dialog
        v-model:visible="formVisible"
        :saving="saving"
        :vehicles="vehicles"
        :products="products"
        :insurers="insurers"
        @save="submitApplication"
    />
  </main>
</template>