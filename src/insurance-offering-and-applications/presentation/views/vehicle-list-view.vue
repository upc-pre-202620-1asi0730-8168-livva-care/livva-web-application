<script setup>
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useVehicleStore } from '../../application/vehicle.store.js';
import VehicleFormDialog from '../components/vehicle-form-dialog.vue';
import { useConfirm } from 'primevue/useconfirm';


const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const vehicleStore = useVehicleStore();

const {
  vehicles,
  loading,
  saving,
  deletingId,
  error
} = storeToRefs(vehicleStore);

const formVisible = ref(false);
const selectedVehicle = ref(null);

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }
    ).format(amount);

const setFormVisibility = (visible) => {
  formVisible.value = visible;

  if (!visible) {
    selectedVehicle.value = null;
  }
};

const openCreateForm = () => {
  vehicleStore.clearError();
  selectedVehicle.value = null;
  formVisible.value = true;
};

const openEditForm = (vehicle) => {
  vehicleStore.clearError();
  selectedVehicle.value = vehicle;
  formVisible.value = true;
};

const saveVehicle = async (vehicleData) => {
  const timestamp = new Date().toISOString();
  let savedVehicle = null;
  let successMessage = '';

  if (selectedVehicle.value) {
    savedVehicle = await vehicleStore.updateVehicle(
        selectedVehicle.value.id,
        {
          ...vehicleData,
          userId: selectedVehicle.value.userId,
          createdAt: selectedVehicle.value.createdAt,
          updatedAt: timestamp
        }
    );

    successMessage = 'vehicles.messages.updated';
  } else {
    savedVehicle = await vehicleStore.createVehicle({
      ...vehicleData,
      userId: 1,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    successMessage = 'vehicles.messages.created';
  }

  if (!savedVehicle) {
    toast.add({
      severity: 'error',
      summary: t(
          selectedVehicle.value
              ? 'vehicles.errors.update'
              : 'vehicles.errors.create'
      ),
      life: 3000
    });

    vehicleStore.clearError();
    return;
  }

  setFormVisibility(false);

  toast.add({
    severity: 'success',
    summary: t(successMessage),
    life: 3000
  });
};
const deleteVehicle = async (vehicle) => {
  const deleted = await vehicleStore.deleteVehicle(vehicle.id);

  if (!deleted) {
    toast.add({
      severity: 'error',
      summary: t('vehicles.errors.delete'),
      life: 3000
    });

    vehicleStore.clearError();
    return;
  }

  toast.add({
    severity: 'success',
    summary: t('vehicles.messages.deleted'),
    life: 3000
  });
};

const confirmDelete = (vehicle) => {
  if (deletingId.value !== null) {
    return;
  }

  confirm.require({
    header: t('vehicles.confirmation.deleteTitle'),
    message: t('vehicles.confirmation.deleteMessage', {
      licensePlate: vehicle.licensePlate
    }),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: t('vehicles.actions.cancel'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: t('vehicles.actions.delete'),
      severity: 'danger'
    },
    accept: () => deleteVehicle(vehicle)
  });
};

onMounted(() => {
  vehicleStore.fetchVehicles();
});
</script>

<template>
  <main class="vehicles-page">
    <pv-toast />
    <pv-confirm-dialog />
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

      <pv-column :header="t('vehicles.actions.column')">
        <template #body="{ data }">
          <div class="vehicles-table__actions">
            <pv-button
                icon="pi pi-pencil"
                severity="secondary"
                text
                :label="t('vehicles.actions.edit')"
                @click="openEditForm(data)"
            />
            <pv-button
                icon="pi pi-trash"
                severity="danger"
                text
                :label="t('vehicles.actions.delete')"
                :loading="deletingId === data.id"
                :disabled="deletingId !== null"
                @click.stop="confirmDelete(data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <vehicle-form-dialog
        :visible="formVisible"
        :saving="saving"
        :vehicle="selectedVehicle"
        @update:visible="setFormVisibility"
        @save="saveVehicle"
    />
  </main>
</template>