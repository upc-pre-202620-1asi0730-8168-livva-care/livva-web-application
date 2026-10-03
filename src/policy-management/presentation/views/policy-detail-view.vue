<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePolicyStore } from '../../application/policy.store.js';

const props = defineProps({
  policyId: {
    type: Number,
    required: true
  }
});

const { t, locale } = useI18n();
const policyStore = usePolicyStore();

const {
  selectedPolicy,
  coverages,
  documents,
  loading,
  error
} = storeToRefs(policyStore);

const localeCode = computed(() =>
    locale.value === 'es' ? 'es-PE' : 'en-US'
);

const formatDate = (date) =>
    new Intl.DateTimeFormat(localeCode.value).format(
        new Date(`${date}T00:00:00`)
    );

const formatAmount = (amount) =>
    new Intl.NumberFormat(localeCode.value, {
      maximumFractionDigits: 2
    }).format(amount);

const statusSeverity = computed(() => {
  if (selectedPolicy.value?.status === 'active') return 'success';
  if (selectedPolicy.value?.status === 'expired') return 'danger';
  return 'info';
});

onMounted(() => {
  policyStore.fetchPolicyById(props.policyId);
});

onBeforeUnmount(() => {
  policyStore.clearSelectedPolicy();
});
</script>

<template>
  <main class="policy-detail-page">
    <router-link class="policy-detail-page__back" to="/policies">
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
            {{ t(`policies.types.${selectedPolicy.insuranceType}`) }}
          </span>

          <h1>{{ selectedPolicy.policyNumber }}</h1>
        </div>

        <pv-tag
            :value="t(`policies.statuses.${selectedPolicy.status}`)"
            :severity="statusSeverity"
        />
      </header>

      <section class="policy-detail-section">
        <h2>{{ t('policies.detail.generalInformation') }}</h2>

        <dl class="policy-detail-grid">
          <div>
            <dt>{{ t('policies.fields.startDate') }}</dt>
            <dd>{{ formatDate(selectedPolicy.startDate) }}</dd>
          </div>

          <div>
            <dt>{{ t('policies.fields.expirationDate') }}</dt>
            <dd>{{ formatDate(selectedPolicy.expirationDate) }}</dd>
          </div>

          <div>
            <dt>{{ t('policies.fields.premiumAmount') }}</dt>
            <dd>{{ formatAmount(selectedPolicy.premiumAmount) }}</dd>
          </div>

          <div>
            <dt>{{ t('policies.fields.coverageAmount') }}</dt>
            <dd>{{ formatAmount(selectedPolicy.coverageAmount) }}</dd>
          </div>
        </dl>
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