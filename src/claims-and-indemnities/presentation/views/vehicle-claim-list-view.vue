<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useVehicleClaimStore } from '../../application/vehicle-claim.store.js';
import { usePolicyStore } from '../../../policy-management/application/policy.store.js';
import VehicleClaimFormDialog from '../components/vehicle-claim-form-dialog.vue';
import { useConfirm } from 'primevue/useconfirm';

const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const vehicleClaimStore = useVehicleClaimStore();
const policyStore = usePolicyStore();

const {
  vehicleClaims,
  statusHistories,
  loading: claimsLoading,
  saving,
  error: claimError
} = storeToRefs(vehicleClaimStore);

const {
  policies,
  loading: policiesLoading,
  error: policyError
} = storeToRefs(policyStore);

const formVisible = ref(false);
const historyVisible = ref(false);
const selectedClaim = ref(null);

const loading = computed(() =>
    claimsLoading.value || policiesLoading.value
);

const pageError = computed(() =>
    claimError.value || policyError.value
);

const vehiclePolicies = computed(() =>
    policies.value.filter(
        (policy) => policy.insuranceType === 'vehicle'
    )
);

const activeVehiclePolicies = computed(() =>
    vehiclePolicies.value.filter(
        (policy) => policy.status === 'active'
    )
);

const getPolicyNumber = (policyId) =>
    vehiclePolicies.value.find(
        (policy) =>
            Number(policy.id) === Number(policyId)
    )?.policyNumber ?? '—';

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }
    ).format(amount);

const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  const normalizedDate = date.includes('T')
      ? date
      : `${date}T00:00:00`;

  return new Intl.DateTimeFormat(
      locale.value === 'es' ? 'es-PE' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
  ).format(new Date(normalizedDate));
};

const formatDateTime = (date) => {
  if (!date) {
    return '—';
  }

  return new Intl.DateTimeFormat(
      locale.value === 'es' ? 'es-PE' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
  ).format(new Date(date));
};

const statusSeverity = (status) => {
  const severities = {
    reported: 'info',
    under_review: 'warn',
    information_required: 'warn',
    approved: 'success',
    rejected: 'danger',
    closed: 'secondary'
  };

  return severities[status] ?? 'secondary';
};

const openForm = () => {
  vehicleClaimStore.clearError();
  formVisible.value = true;
};

const setFormVisibility = (visible) => {
  formVisible.value = visible;
};

const saveVehicleClaim = async (vehicleClaimData) => {
  const createdClaim =
      await vehicleClaimStore.createVehicleClaim(
          vehicleClaimData
      );

  if (!createdClaim) {
    toast.add({
      severity: 'error',
      summary: t(
          claimError.value ??
          'vehicleClaims.errors.create'
      ),
      life: 3500
    });

    vehicleClaimStore.clearError();
    return;
  }

  formVisible.value = false;

  toast.add({
    severity: 'success',
    summary: t('vehicleClaims.messages.created'),
    life: 3500
  });
};

const openHistory = async (vehicleClaim) => {
  selectedClaim.value = vehicleClaim;
  vehicleClaimStore.clearStatusHistories();

  await vehicleClaimStore.fetchClaimStatusHistory(
      vehicleClaim.id
  );

  if (claimError.value) {
    toast.add({
      severity: 'error',
      summary: t(claimError.value),
      life: 3500
    });

    vehicleClaimStore.clearError();
    selectedClaim.value = null;
    return;
  }

  historyVisible.value = true;
};

const closeHistory = () => {
  historyVisible.value = false;
  selectedClaim.value = null;
  vehicleClaimStore.clearStatusHistories();
};

const confirmCancelClaim = (vehicleClaim) => {
  confirm.require({
    header: t('vehicleClaims.confirmation.cancelTitle'),
    message: t('vehicleClaims.confirmation.cancelMessage'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: t('vehicleClaims.actions.keep'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: t('vehicleClaims.actions.cancelClaim'),
      severity: 'danger'
    },
    accept: async () => {
      const cancelled =
          await vehicleClaimStore.cancelVehicleClaim(
              vehicleClaim.id
          );

      if (!cancelled) {
        toast.add({
          severity: 'error',
          summary: t(
              claimError.value ??
              'vehicleClaims.errors.cancel'
          ),
          life: 3500
        });

        vehicleClaimStore.clearError();
        return;
      }

      toast.add({
        severity: 'success',
        summary: t('vehicleClaims.messages.cancelled'),
        life: 3500
      });
    }
  });
};

onMounted(async () => {
  await policyStore.fetchPolicies();

  if (policyError.value) {
    return;
  }

  await vehicleClaimStore.fetchVehicleClaims(
      vehiclePolicies.value.map((policy) => policy.id)
  );
});
</script>

<template>
  <main class="vehicles-page beneficiaries-page">
    <pv-toast />
    <pv-confirm-dialog />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('vehicleClaims.sectionLabel') }}
        </span>

        <h1>{{ t('vehicleClaims.title') }}</h1>

        <p>{{ t('vehicleClaims.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-plus"
          :label="t('vehicleClaims.actions.add')"
          :disabled="
            activeVehiclePolicies.length === 0 ||
            loading
          "
          @click="openForm"
      />
    </header>

    <pv-message
        v-if="
          !loading &&
          activeVehiclePolicies.length === 0
        "
        severity="warn"
        :closable="false"
    >
      {{ t('vehicleClaims.noActivePolicies') }}
    </pv-message>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading vehicle claims"
      />
    </div>

    <pv-message
        v-else-if="pageError"
        severity="error"
        :closable="false"
    >
      {{ t(pageError) }}
    </pv-message>

    <pv-data-table
        v-else
        :value="vehicleClaims"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="vehicles-table"
    >
      <template #empty>
        <div class="vehicles-state">
          <i class="pi pi-car"></i>
          <p>{{ t('vehicleClaims.empty') }}</p>
        </div>
      </template>

      <pv-column
          field="id"
          :header="t('vehicleClaims.fields.number')"
      >
        <template #body="{ data }">
          #{{ data.id }}
        </template>
      </pv-column>

      <pv-column
          :header="t('vehicleClaims.fields.policy')"
      >
        <template #body="{ data }">
          {{ getPolicyNumber(data.policyId) }}
        </template>
      </pv-column>

      <pv-column
          :header="
            t('vehicleClaims.fields.incidentDate')
          "
      >
        <template #body="{ data }">
          {{ formatDate(data.incidentDate) }}
        </template>
      </pv-column>

      <pv-column
          field="incidentLocation"
          :header="t('vehicleClaims.fields.location')"
      />

      <pv-column
          :header="
            t(
                'vehicleClaims.fields.estimatedDamageAmount'
            )
          "
      >
        <template #body="{ data }">
          {{ formatAmount(data.estimatedDamageAmount) }}
        </template>
      </pv-column>

      <pv-column
          :header="t('vehicleClaims.fields.status')"
      >
        <template #body="{ data }">
          <pv-tag
              :value="
                t(
                    `vehicleClaims.statuses.${data.status}`
                )
              "
              :severity="statusSeverity(data.status)"
          />
        </template>
      </pv-column>

      <pv-column
          :header="t('vehicleClaims.actions.column')"
      >
        <template #body="{ data }">
          <pv-button
              icon="pi pi-history"
              severity="secondary"
              text
              :label="
                t('vehicleClaims.actions.viewStatus')
              "
              @click="openHistory(data)"
          />
          <pv-button
              v-if="['reported', 'under_review'].includes(data.status)"
              :label="t('vehicleClaims.actions.cancelClaim')"
              icon="pi pi-times"
              severity="danger"
              text
              :disabled="saving"
              @click="confirmCancelClaim(data)"
          />

        </template>
      </pv-column>
    </pv-data-table>

    <vehicle-claim-form-dialog
        :visible="formVisible"
        :saving="saving"
        :policies="activeVehiclePolicies"
        @update:visible="setFormVisibility"
        @save="saveVehicleClaim"
    />

    <pv-dialog
        :visible="historyVisible"
        modal
        :header="t('vehicleClaims.history.title')"
        class="vehicle-dialog"
        @update:visible="
          $event ? null : closeHistory()
        "
    >
      <div v-if="selectedClaim">
        <p>
          <strong>
            {{ t('vehicleClaims.fields.claim') }}:
          </strong>
          #{{ selectedClaim.id }}
        </p>

        <p>
          <strong>
            {{ t('vehicleClaims.fields.policy') }}:
          </strong>
          {{ getPolicyNumber(selectedClaim.policyId) }}
        </p>
      </div>

      <pv-data-table
          :value="statusHistories"
          striped-rows
          responsive-layout="scroll"
          class="vehicles-table"
      >
        <template #empty>
          <div class="vehicles-state">
            <i class="pi pi-history"></i>
            <p>
              {{ t('vehicleClaims.history.empty') }}
            </p>
          </div>
        </template>

        <pv-column
            :header="t('vehicleClaims.fields.status')"
        >
          <template #body="{ data }">
            <pv-tag
                :value="
                  t(
                      `vehicleClaims.statuses.${data.status}`
                  )
                "
                :severity="statusSeverity(data.status)"
            />
          </template>
        </pv-column>

        <pv-column
            :header="
              t('vehicleClaims.history.changedAt')
            "
        >
          <template #body="{ data }">
            {{ formatDateTime(data.changedAt) }}
          </template>
        </pv-column>

        <pv-column
            :header="t('vehicleClaims.history.comment')"
        >
          <template #body="{ data }">
            {{ data.comment || '—' }}
          </template>
        </pv-column>
      </pv-data-table>

      <template #footer>
        <pv-button
            severity="secondary"
            outlined
            :label="t('vehicleClaims.actions.close')"
            @click="closeHistory"
        />
      </template>
    </pv-dialog>
  </main>
</template>