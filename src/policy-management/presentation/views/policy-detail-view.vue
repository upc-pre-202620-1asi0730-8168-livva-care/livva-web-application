<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { usePolicyStore } from '../../application/policy.store.js';
import { useRenewalStore } from '../../application/renewal.store.js';

const props = defineProps({
  policyId: {
    type: Number,
    required: true
  }
});

const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const policyStore = usePolicyStore();
const renewalStore = useRenewalStore();

const {
  selectedPolicy,
  coverages,
  documents,
  loading,
  error
} = storeToRefs(policyStore);

const {
  latestRenewal,
  hasPendingRenewal,
  loading: renewalLoading,
  saving: renewalSaving,
  error: renewalError
} = storeToRefs(renewalStore);

const localeCode = computed(() =>
    locale.value === 'es' ? 'es-PE' : 'en-US'
);

const canRequestRenewal = computed(() =>
    selectedPolicy.value &&
    ['active', 'expired'].includes(
        selectedPolicy.value.status
    ) &&
    !hasPendingRenewal.value
);

const formatDate = (date) =>
    new Intl.DateTimeFormat(localeCode.value).format(
        new Date(`${date}T00:00:00`)
    );

const formatDateTime = (date) =>
    new Intl.DateTimeFormat(localeCode.value, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));

const formatAmount = (amount) =>
    new Intl.NumberFormat(localeCode.value, {
      maximumFractionDigits: 2
    }).format(amount);

const statusSeverity = computed(() => {
  if (selectedPolicy.value?.status === 'active') {
    return 'success';
  }

  if (selectedPolicy.value?.status === 'expired') {
    return 'danger';
  }

  return 'info';
});

const renewalStatusSeverity = computed(() => {
  switch (latestRenewal.value?.status) {
    case 'pending':
      return 'warn';
    case 'under_review':
      return 'info';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'cancelled':
      return 'secondary';
    default:
      return 'info';
  }
});

const requestRenewal = async () => {
  const renewal = await renewalStore.createRenewal(
      props.policyId
  );

  if (!renewal) {
    toast.add({
      severity: 'error',
      summary: t(
          renewalError.value ?? 'renewals.errors.create'
      ),
      life: 3000
    });

    renewalStore.clearError();
    return;
  }

  toast.add({
    severity: 'success',
    summary: t('renewals.messages.created'),
    life: 3000
  });
};

const confirmRenewal = () => {
  if (!canRequestRenewal.value || renewalSaving.value) {
    return;
  }

  confirm.require({
    header: t('renewals.confirmation.title'),
    message: t('renewals.confirmation.message', {
      policyNumber:
          selectedPolicy.value?.policyNumber ?? ''
    }),
    icon: 'pi pi-refresh',
    rejectProps: {
      label: t('renewals.actions.cancel'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: t('renewals.actions.confirm'),
      severity: 'primary'
    },
    accept: requestRenewal
  });
};

onMounted(async () => {
  await Promise.all([
    policyStore.fetchPolicyById(props.policyId),
    renewalStore.fetchRenewals(props.policyId)
  ]);
});

onBeforeUnmount(() => {
  policyStore.clearSelectedPolicy();
  renewalStore.clearRenewals();
});
</script>

<template>
  <main class="policy-detail-page">
    <pv-toast />
    <pv-confirm-dialog />

    <router-link
        class="policy-detail-page__back"
        to="/policies"
    >
      <i class="pi pi-arrow-left"></i>
      {{ t('policies.actions.backToPolicies') }}
    </router-link>

    <div v-if="loading" class="policies-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading policy details"
      />
    </div>

    <pv-message
        v-else-if="error"
        severity="error"
        :closable="false"
    >
      {{ t(error) }}
    </pv-message>

    <template v-else-if="selectedPolicy">
      <header class="policy-detail-page__header">
        <div>
          <span class="section-label">
            {{
              t(
                  `policies.types.${selectedPolicy.insuranceType}`
              )
            }}
          </span>

          <h1>{{ selectedPolicy.policyNumber }}</h1>
        </div>

        <pv-tag
            :value="
              t(`policies.statuses.${selectedPolicy.status}`)
            "
            :severity="statusSeverity"
        />
      </header>

      <section class="policy-detail-section">
        <h2>
          {{ t('policies.detail.generalInformation') }}
        </h2>

        <dl class="policy-detail-grid">
          <div>
            <dt>{{ t('policies.fields.startDate') }}</dt>
            <dd>
              {{ formatDate(selectedPolicy.startDate) }}
            </dd>
          </div>

          <div>
            <dt>
              {{ t('policies.fields.expirationDate') }}
            </dt>
            <dd>
              {{ formatDate(selectedPolicy.expirationDate) }}
            </dd>
          </div>

          <div>
            <dt>
              {{ t('policies.fields.premiumAmount') }}
            </dt>
            <dd>
              {{ formatAmount(selectedPolicy.premiumAmount) }}
            </dd>
          </div>

          <div>
            <dt>
              {{ t('policies.fields.coverageAmount') }}
            </dt>
            <dd>
              {{ formatAmount(selectedPolicy.coverageAmount) }}
            </dd>
          </div>
        </dl>
      </section>

      <section class="policy-detail-section">
        <div class="policy-renewal__heading">
          <div>
            <h2>{{ t('renewals.title') }}</h2>
            <p>{{ t('renewals.description') }}</p>
          </div>

          <pv-button
              icon="pi pi-refresh"
              :label="
                hasPendingRenewal
                    ? t('renewals.actions.pending')
                    : t('renewals.actions.request')
              "
              :loading="renewalSaving"
              :disabled="!canRequestRenewal"
              @click="confirmRenewal"
          />
        </div>

        <div
            v-if="renewalLoading"
            class="policies-state policy-renewal__state"
        >
          <pv-progress-spinner
              stroke-width="4"
              aria-label="Loading renewals"
          />
        </div>

        <pv-message
            v-else-if="renewalError"
            severity="error"
            :closable="false"
        >
          {{ t(renewalError) }}
        </pv-message>

        <article
            v-else-if="latestRenewal"
            class="policy-renewal"
        >
          <div>
            <span>{{ t('renewals.fields.requestedAt') }}</span>
            <strong>
              {{
                formatDateTime(
                    latestRenewal.requestedAt
                )
              }}
            </strong>
          </div>

          <div>
            <span>{{ t('renewals.fields.status') }}</span>
            <pv-tag
                :value="
                  t(
                      `renewals.statuses.${latestRenewal.status}`
                  )
                "
                :severity="renewalStatusSeverity"
            />
          </div>
        </article>

        <p v-else class="policy-detail-empty">
          {{ t('renewals.empty') }}
        </p>
      </section>

      <section class="policy-detail-section">
        <h2>{{ t('policies.detail.coverages') }}</h2>

        <div
            v-if="coverages.length > 0"
            class="policy-detail-list"
        >
          <article
              v-for="coverage in coverages"
              :key="coverage.id"
              class="policy-detail-item"
          >
            <div>
              <h3>{{ coverage.name }}</h3>
              <p>{{ coverage.description }}</p>
            </div>

            <strong>
              {{ formatAmount(coverage.coverageLimit) }}
            </strong>
          </article>
        </div>

        <p v-else class="policy-detail-empty">
          {{ t('policies.detail.noCoverages') }}
        </p>
      </section>

      <section class="policy-detail-section">
        <h2>{{ t('policies.detail.documents') }}</h2>

        <div
            v-if="documents.length > 0"
            class="policy-detail-list"
        >
          <article
              v-for="document in documents"
              :key="document.id"
              class="policy-detail-item"
          >
            <div>
              <h3>{{ document.name }}</h3>
              <p>{{ document.documentType }}</p>
            </div>

            <span v-if="!document.fileUrl">
              {{ t('policies.detail.documentUnavailable') }}
            </span>

            <a
                v-else
                :href="document.fileUrl"
                target="_blank"
                rel="noopener noreferrer"
            >
              {{ t('policies.actions.openDocument') }}
            </a>
          </article>
        </div>

        <p v-else class="policy-detail-empty">
          {{ t('policies.detail.noDocuments') }}
        </p>
      </section>
    </template>
  </main>
</template>