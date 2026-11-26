<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import { useIndemnityRequestStore } from '../../application/indemnity-request.store.js';
import { usePolicyStore } from '../../../policy-management/application/policy.store.js';
import { useBeneficiaryStore } from '../../../insurance-offering-and-applications/application/beneficiary.store.js';
import IndemnityRequestFormDialog from '../components/indemnity-request-form-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();

const indemnityRequestStore = useIndemnityRequestStore();
const policyStore = usePolicyStore();
const beneficiaryStore = useBeneficiaryStore();

const {
  indemnityRequests,
  loading: requestsLoading,
  saving,
  error: requestError
} = storeToRefs(indemnityRequestStore);

const {
  policies,
  loading: policiesLoading,
  error: policyError
} = storeToRefs(policyStore);

const {
  beneficiaries,
  loading: beneficiariesLoading,
  error: beneficiaryError
} = storeToRefs(beneficiaryStore);

const formVisible = ref(false);
const historyVisible = ref(false);
const selectedRequest = ref(null);

const loading = computed(() =>
    requestsLoading.value ||
    policiesLoading.value ||
    beneficiariesLoading.value
);

const pageError = computed(() =>
    requestError.value || policyError.value || beneficiaryError.value
);

const lifePolicies = computed(() =>
    policies.value.filter((policy) => policy.insuranceType === 'life')
);

const activeLifePolicies = computed(() =>
    lifePolicies.value.filter((policy) => policy.status === 'active')
);

const getPolicyNumber = (policyId) =>
    lifePolicies.value.find(
        (policy) => Number(policy.id) === Number(policyId)
    )?.policyNumber ?? '—';

const getBeneficiaryName = (beneficiaryId) =>
    beneficiaries.value.find(
        (beneficiary) => Number(beneficiary.id) === Number(beneficiaryId)
    )?.fullName ?? '—';

const numberLocale = computed(() =>
    locale.value === 'es' ? 'es-PE' : 'en-US'
);

const formatAmount = (amount) =>
    amount === null || amount === undefined
        ? '—'
        : new Intl.NumberFormat(numberLocale.value, {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }).format(amount);

const formatDate = (date) => {
  if (!date) {
    return '—';
  }

  const normalizedDate = date.includes('T') ? date : `${date}T00:00:00`;

  return new Intl.DateTimeFormat(numberLocale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(normalizedDate));
};

const formatDateTime = (date) =>
    date
        ? new Intl.DateTimeFormat(numberLocale.value, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(date))
        : '—';

const statusSeverity = (status) => ({
  submitted: 'info',
  under_review: 'warn',
  approved: 'success',
  rejected: 'danger',
  paid: 'success'
}[status] ?? 'secondary');

const openForm = () => {
  indemnityRequestStore.clearError();
  formVisible.value = true;
};

const saveIndemnityRequest = async (requestData) => {
  const createdRequest =
      await indemnityRequestStore.createIndemnityRequest(requestData);

  if (!createdRequest) {
    toast.add({
      severity: 'error',
      summary: t(requestError.value ?? 'indemnities.errors.create'),
      detail: t('indemnities.errors.retryHint'),
      life: 5000
    });

    indemnityRequestStore.clearError();
    return;
  }

  formVisible.value = false;

  toast.add({
    severity: 'success',
    summary: t('indemnities.messages.created'),
    detail: t('indemnities.messages.createdDetail', {
      number: createdRequest.id
    }),
    life: 5000
  });
};

const openHistory = (indemnityRequest) => {
  selectedRequest.value = indemnityRequest;
  historyVisible.value = true;
};

const closeHistory = () => {
  historyVisible.value = false;
  selectedRequest.value = null;
};

onMounted(async () => {
  await policyStore.fetchPolicies();

  if (policyError.value) {
    return;
  }

  const lifePolicyIds = lifePolicies.value.map((policy) => policy.id);

  await Promise.all([
    beneficiaryStore.fetchBeneficiaries(lifePolicyIds),
    indemnityRequestStore.fetchIndemnityRequests(lifePolicyIds)
  ]);
});
</script>

<template>
  <main class="vehicles-page beneficiaries-page">
    <pv-toast />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('indemnities.sectionLabel') }}
        </span>

        <h1>{{ t('indemnities.title') }}</h1>

        <p>{{ t('indemnities.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-plus"
          :label="t('indemnities.actions.add')"
          :disabled="activeLifePolicies.length === 0 || loading"
          @click="openForm"
      />
    </header>

    <pv-message
        v-if="!loading && !pageError && activeLifePolicies.length === 0"
        severity="warn"
        :closable="false"
    >
      {{ t('indemnities.noActivePolicies') }}
    </pv-message>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          :aria-label="t('indemnities.loading')"
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
        :value="indemnityRequests"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="vehicles-table"
    >
      <template #empty>
        <div class="vehicles-state">
          <i class="pi pi-heart" aria-hidden="true"></i>
          <p>{{ t('indemnities.empty') }}</p>
        </div>
      </template>

      <pv-column :header="t('indemnities.fields.number')">
        <template #body="{ data }">
          #{{ data.id }}
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.fields.policy')">
        <template #body="{ data }">
          {{ getPolicyNumber(data.policyId) }}
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.fields.beneficiary')">
        <template #body="{ data }">
          {{ getBeneficiaryName(data.beneficiaryId) }}
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.fields.requestDate')">
        <template #body="{ data }">
          {{ formatDate(data.requestDate) }}
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.fields.amount')">
        <template #body="{ data }">
          {{ formatAmount(data.indemnityAmount) }}
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.fields.status')">
        <template #body="{ data }">
          <pv-tag
              :value="t(`indemnities.statuses.${data.status}`)"
              :severity="statusSeverity(data.status)"
          />
        </template>
      </pv-column>

      <pv-column :header="t('indemnities.actions.column')">
        <template #body="{ data }">
          <pv-button
              icon="pi pi-history"
              severity="secondary"
              text
              :label="t('indemnities.actions.viewStatus')"
              @click="openHistory(data)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <indemnity-request-form-dialog
        :visible="formVisible"
        :saving="saving"
        :policies="activeLifePolicies"
        :beneficiaries="beneficiaries"
        @update:visible="formVisible = $event"
        @save="saveIndemnityRequest"
    />

    <pv-dialog
        :visible="historyVisible"
        modal
        :header="t('indemnities.history.title')"
        class="vehicle-dialog"
        @update:visible="$event ? null : closeHistory()"
    >
      <div v-if="selectedRequest">
        <p>
          <strong>{{ t('indemnities.fields.request') }}:</strong>
          #{{ selectedRequest.id }}
        </p>

        <p>
          <strong>{{ t('indemnities.fields.policy') }}:</strong>
          {{ getPolicyNumber(selectedRequest.policyId) }}
        </p>

        <p>
          <strong>{{ t('indemnities.fields.description') }}:</strong>
          {{ selectedRequest.description }}
        </p>

        <p v-if="selectedRequest.resolvedAt">
          <strong>{{ t('indemnities.fields.resolvedAt') }}:</strong>
          {{ formatDateTime(selectedRequest.resolvedAt) }}
        </p>

        <pv-data-table
            :value="selectedRequest.statusHistories"
            striped-rows
            responsive-layout="scroll"
            class="vehicles-table"
        >
          <template #empty>
            <div class="vehicles-state">
              <i class="pi pi-history" aria-hidden="true"></i>
              <p>{{ t('indemnities.history.empty') }}</p>
            </div>
          </template>

          <pv-column :header="t('indemnities.fields.status')">
            <template #body="{ data }">
              <pv-tag
                  :value="t(`indemnities.statuses.${data.status}`)"
                  :severity="statusSeverity(data.status)"
              />
            </template>
          </pv-column>

          <pv-column :header="t('indemnities.history.changedAt')">
            <template #body="{ data }">
              {{ formatDateTime(data.changedAt) }}
            </template>
          </pv-column>

          <pv-column :header="t('indemnities.history.comment')">
            <template #body="{ data }">
              {{ data.comment || '—' }}
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <template #footer>
        <pv-button
            severity="secondary"
            outlined
            :label="t('indemnities.actions.close')"
            @click="closeHistory"
        />
      </template>
    </pv-dialog>
  </main>
</template>
