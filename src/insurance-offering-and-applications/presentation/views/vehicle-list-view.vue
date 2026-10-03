<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVehicleStore } from '../../application/vehicle.store.js';
import VehicleFormDialog from '../components/vehicle-form-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();
const vehicleStore = useVehicleStore();

const { vehicles, loading, saving, error } = storeToRefs(vehicleStore);
const formVisible = ref(false);

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }
    ).format(amount);

const openCreateForm = () => {
  vehicleStore.clearError();
  formVisible.value = true;
};

const createVehicle = async (vehicle) => {
  const timestamp = new Date().toISOString();

  const createdVehicle = await vehicleStore.createVehicle({
    ...vehicle,
    userId: 1,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  if (!createdVehicle) {
    toast.add({
      severity: 'error',
      summary: t('vehicles.errors.create'),
      life: 3000
    });

    vehicleStore.clearError();
    return;
  }

  formVisible.value = false;

  toast.add({
    severity: 'success',
    summary: t('vehicles.messages.created'),
    life: 3000
  });
};

onMounted(() => {
  vehicleStore.fetchVehicles();
});
</script>

<template>
  <main class="vehicles-page">
    <pv-toast />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('vehicles.sectionLabel') }}
        </span>

        <h1>{{ t('vehicles.title') }}</h1>

        <p>{{ t('vehicles.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-plus"
          :label="t('vehicles.actions.add')"
          @click="openCreateForm"
      />
    </header>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading vehicles"
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
        :value="vehicles"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="vehicles-table"
    >
      <template #empty>
        <div class="vehicles-state">
          <i class="pi pi-car"></i>
          <p>{{ t('vehicles.empty') }}</p>
        </div>
      </template>

      <pv-column
          field="licensePlate"
          :header="t('vehicles.fields.licensePlate')"
      />

      <pv-column
          field="brand"
          :header="t('vehicles.fields.brand')"
      />

      <pv-column
          field="model"
          :header="t('vehicles.fields.model')"
      />

      <pv-column
          field="manufactureYear"
          :header="t('vehicles.fields.manufactureYear')"
      />

      <pv-column :header="t('vehicles.fields.estimatedValue')">
        <template #body="{ data }">
          {{ formatAmount(data.estimatedValue) }}
        </template>
      </pv-column>
    </pv-data-table>

    <vehicle-form-dialog
        v-model:visible="formVisible"
        :saving="saving"
        @save="createVehicle"
    />
  </main>
</template>