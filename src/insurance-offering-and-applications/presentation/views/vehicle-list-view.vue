<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useVehicleStore } from '../../application/vehicle.store.js';

const { t, locale } = useI18n();
const vehicleStore = useVehicleStore();

const { vehicles, loading, error } = storeToRefs(vehicleStore);

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          maximumFractionDigits: 2
        }
    ).format(amount);

onMounted(() => {
  vehicleStore.fetchVehicles();
});
</script>

<template>
  <main class="vehicles-page">
    <header class="vehicles-page__header">
      <span class="section-label">
        {{ t('vehicles.sectionLabel') }}
      </span>

      <h1>{{ t('vehicles.title') }}</h1>

      <p>{{ t('vehicles.description') }}</p>
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

      <pv-column
          :header="t('vehicles.fields.estimatedValue')"
      >
        <template #body="{ data }">
          {{ formatAmount(data.estimatedValue) }}
        </template>
      </pv-column>
    </pv-data-table>
  </main>
</template>