<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';

import {
  MAX_COMPARED_PRODUCTS,
  useInsuranceCatalogStore
} from '../../application/insurance-catalog.store.js';
import InsuranceComparisonDialog from '../components/insurance-comparison-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();
const router = useRouter();
const catalogStore = useInsuranceCatalogStore();

const {
  products,
  comparedProducts,
  loading,
  error
} = storeToRefs(catalogStore);

const insuranceTypes = ['vehicle', 'life'];
const selectedType = ref('vehicle');
const comparisonVisible = ref(false);

const visibleProducts = computed(() =>
    products.value
        .filter((product) => product.insuranceType === selectedType.value)
        .sort((first, second) => first.premiumAmount - second.premiumAmount)
);

const formatAmount = (amount) =>
    new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 2
    }).format(amount);

// Changing the insurance type starts a new comparison, because types cannot be mixed.
watch(selectedType, () => {
  catalogStore.clearComparison();
});

const toggleComparison = (product) => {
  const result = catalogStore.toggleComparison(product);

  if (result === 'limitReached') {
    toast.add({
      severity: 'warn',
      summary: t('catalog.comparison.limitReached', {
        max: MAX_COMPARED_PRODUCTS
      }),
      life: 3500
    });
  }

  if (result === 'differentType') {
    toast.add({
      severity: 'warn',
      summary: t('catalog.comparison.differentType'),
      life: 3500
    });
  }
};

const removeFromComparison = (product) => {
  catalogStore.toggleComparison(product);

  if (comparedProducts.value.length < 2) {
    comparisonVisible.value = false;
  }
};

const requestProduct = (product) => {
  comparisonVisible.value = false;

  const path = product.insuranceType === 'life'
      ? '/life-applications'
      : '/vehicle-applications';

  router.push({ path, query: { productId: product.id } });
};

onMounted(() => {
  catalogStore.fetchCatalog();
});
</script>

<template>
  <main class="vehicles-page catalog-page">
    <pv-toast />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('catalog.sectionLabel') }}
        </span>

        <h1>{{ t('catalog.title') }}</h1>

        <p>{{ t('catalog.description') }}</p>
      </div>
    </header>

    <div
        class="catalog-page__types"
        role="radiogroup"
        :aria-label="t('catalog.typeLabel')"
    >
      <pv-button
          v-for="type in insuranceTypes"
          :key="type"
          role="radio"
          :aria-checked="selectedType === type"
          :icon="type === 'life' ? 'pi pi-heart' : 'pi pi-car'"
          :label="t(`catalog.types.${type}`)"
          :outlined="selectedType !== type"
          @click="selectedType = type"
      />
    </div>

    <details class="catalog-page__glossary">
      <summary>
        <i class="pi pi-question-circle" aria-hidden="true"></i>
        {{ t('catalog.glossary.title') }}
      </summary>

      <dl>
        <dt>{{ t('catalog.fields.premium') }}</dt>
        <dd>{{ t('catalog.glossary.premium') }}</dd>

        <dt>{{ t('catalog.fields.coverage') }}</dt>
        <dd>{{ t('catalog.glossary.coverage') }}</dd>

        <dt>{{ t('catalog.fields.coveragePerSol') }}</dt>
        <dd>{{ t('catalog.glossary.coveragePerSol') }}</dd>

        <dt>{{ t('catalog.glossary.claimTerm') }}</dt>
        <dd>{{ t('catalog.glossary.claim') }}</dd>

        <dt>{{ t('catalog.glossary.beneficiaryTerm') }}</dt>
        <dd>{{ t('catalog.glossary.beneficiary') }}</dd>
      </dl>
    </details>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          :aria-label="t('catalog.loading')"
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
        v-else-if="visibleProducts.length === 0"
        class="vehicles-state"
    >
      <i class="pi pi-inbox" aria-hidden="true"></i>
      <p>{{ t('catalog.empty') }}</p>
    </div>

    <ul v-else class="catalog-grid">
      <li
          v-for="product in visibleProducts"
          :key="product.id"
          class="catalog-card"
          :class="{ 'catalog-card--selected': catalogStore.isCompared(product.id) }"
      >
        <span class="catalog-card__insurer">
          {{ catalogStore.getInsurerName(product.insurerId) }}
        </span>

        <h2 class="catalog-card__name">{{ product.name }}</h2>

        <dl class="catalog-card__figures">
          <div>
            <dt :title="t('catalog.glossary.premium')">
              {{ t('catalog.fields.premium') }}
            </dt>
            <dd>{{ formatAmount(product.premiumAmount) }}</dd>
          </div>

          <div>
            <dt :title="t('catalog.glossary.coverage')">
              {{ t('catalog.fields.coverage') }}
            </dt>
            <dd>{{ formatAmount(product.coverageAmount) }}</dd>
          </div>
        </dl>

        <label class="catalog-card__compare">
          <input
              type="checkbox"
              :checked="catalogStore.isCompared(product.id)"
              @change="toggleComparison(product)"
          />
          {{ t('catalog.actions.compare') }}
        </label>

        <pv-button
            icon="pi pi-send"
            :label="t('catalog.actions.request')"
            @click="requestProduct(product)"
        />
      </li>
    </ul>

    <div
        v-if="comparedProducts.length > 0"
        class="catalog-compare-bar"
        role="region"
        :aria-label="t('catalog.comparison.barLabel')"
        aria-live="polite"
    >
      <span>
        {{ t('catalog.comparison.selected', {
          count: comparedProducts.length,
          max: MAX_COMPARED_PRODUCTS
        }) }}
      </span>

      <div class="catalog-compare-bar__actions">
        <pv-button
            severity="secondary"
            text
            :label="t('catalog.actions.clear')"
            @click="catalogStore.clearComparison()"
        />

        <pv-button
            icon="pi pi-table"
            :label="t('catalog.actions.openComparison')"
            :disabled="comparedProducts.length < 2"
            @click="comparisonVisible = true"
        />
      </div>
    </div>

    <insurance-comparison-dialog
        v-model:visible="comparisonVisible"
        :products="comparedProducts"
        :get-insurer-name="catalogStore.getInsurerName"
        @remove="removeFromComparison"
        @request="requestProduct"
    />
  </main>
</template>

<style scoped>
.catalog-page__types {
  display: flex;
  margin-bottom: 1.25rem;
  gap: 0.75rem;
}

.catalog-page__glossary {
  margin-bottom: 2rem;
  padding: 1rem 1.25rem;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #f8fafc;
}

.catalog-page__glossary summary {
  cursor: pointer;
  color: #2563eb;
  font-weight: 600;
}

.catalog-page__glossary dl {
  display: grid;
  margin: 1rem 0 0;
  grid-template-columns: minmax(140px, max-content) 1fr;
  gap: 0.5rem 1.5rem;
}

.catalog-page__glossary dt {
  font-weight: 600;
}

.catalog-page__glossary dd {
  margin: 0;
  color: #52627a;
}

.catalog-grid {
  display: grid;
  margin: 0;
  padding: 0 0 6rem;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
  list-style: none;
}

.catalog-card {
  display: flex;
  padding: 1.5rem;
  flex-direction: column;
  gap: 0.75rem;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.catalog-card--selected {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgb(37 99 235 / 25%);
}

.catalog-card__insurer {
  color: #2563eb;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.catalog-card__name {
  margin: 0;
  font-size: 1.15rem;
}

.catalog-card__figures {
  display: grid;
  margin: 0;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.catalog-card__figures dt {
  color: #52627a;
  font-size: 0.8rem;
  text-decoration: underline dotted;
  cursor: help;
}

.catalog-card__figures dd {
  margin: 0.25rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.catalog-card__compare {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
  cursor: pointer;
}

.catalog-card__compare input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #2563eb;
}

.catalog-compare-bar {
  position: fixed;
  z-index: 20;
  right: 50%;
  bottom: 1.5rem;
  display: flex;
  width: min(100% - 2rem, 720px);
  padding: 0.75rem 1rem 0.75rem 1.5rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: #ffffff;
  border-radius: 999px;
  background: #0f172a;
  box-shadow: 0 12px 32px rgb(15 23 42 / 30%);
  transform: translateX(50%);
}

.catalog-compare-bar__actions {
  display: flex;
  gap: 0.5rem;
}

.catalog-compare-bar__actions :deep(.p-button-text) {
  color: #cbd5e1;
}

@media (max-width: 640px) {
  .catalog-compare-bar {
    border-radius: 16px;
    flex-direction: column;
  }
}
</style>
