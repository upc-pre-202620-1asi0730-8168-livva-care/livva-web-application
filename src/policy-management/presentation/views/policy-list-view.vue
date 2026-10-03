<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { usePolicyStore } from '../../application/policy.store.js';
import PolicyCard from '../components/policy-card.vue';

const { t } = useI18n();
const policyStore = usePolicyStore();

const { policies, loading, error } = storeToRefs(policyStore);

onMounted(() => {
  policyStore.fetchPolicies();
});
</script>

<template>
  <main class="policies-page">
    <header class="policies-page__header">
      <span class="section-label">
        {{ t('policies.sectionLabel') }}
      </span>

      <h1>{{ t('policies.title') }}</h1>

      <p>{{ t('policies.description') }}</p>
    </header>

    <div v-if="loading" class="policies-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading policies"
      />
    </div>

    <pv-message
        v-else-if="error"
        severity="error"
        :closable="false"
    >
      {{ t(error) }}
    </pv-message>

    <div
        v-else-if="policies.length === 0"
        class="policies-state"
    >
      <i class="pi pi-file"></i>
      <p>{{ t('policies.empty') }}</p>
    </div>

    <section v-else class="policies-grid">
      <policy-card
          v-for="policy in policies"
          :key="policy.id"
          :policy="policy"
      />
    </section>
  </main>
</template>