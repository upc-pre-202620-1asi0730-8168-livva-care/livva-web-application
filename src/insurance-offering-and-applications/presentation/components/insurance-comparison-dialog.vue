<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  },
  getInsurerName: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:visible', 'request', 'remove']);
const { t, locale } = useI18n();

const formatAmount = (amount) =>
    new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
      style: 'currency',
      currency: 'PEN',
      maximumFractionDigits: 2
    }).format(amount);

const formatRatio = (ratio) =>
    new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
      maximumFractionDigits: 2
    }).format(ratio);

const coveragePerSol = (product) =>
    product.premiumAmount > 0
        ? product.coverageAmount / product.premiumAmount
        : 0;

const lowestPremiumId = computed(() =>
    [...props.products].sort(
        (first, second) => first.premiumAmount - second.premiumAmount
    )[0]?.id
);

const highestCoverageId = computed(() =>
    [...props.products].sort(
        (first, second) => second.coverageAmount - first.coverageAmount
    )[0]?.id
);

const bestValueId = computed(() =>
    [...props.products].sort(
        (first, second) => coveragePerSol(second) - coveragePerSol(first)
    )[0]?.id
);
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :header="t('catalog.comparison.title')"
      class="comparison-dialog"
      :style="{ width: 'min(960px, 95vw)' }"
      @update:visible="emit('update:visible', $event)"
  >
    <p class="comparison-dialog__intro">
      {{ t('catalog.comparison.description') }}
    </p>

    <div class="comparison-table__wrapper">
      <table class="comparison-table">
        <caption class="sr-only">
          {{ t('catalog.comparison.title') }}
        </caption>

        <thead>
          <tr>
            <th scope="col">
              {{ t('catalog.comparison.attribute') }}
            </th>

            <th
                v-for="product in products"
                :key="product.id"
                scope="col"
            >
              <span class="comparison-table__product">
                {{ product.name }}
              </span>

              <pv-button
                  icon="pi pi-times"
                  text
                  rounded
                  size="small"
                  severity="secondary"
                  :aria-label="t('catalog.comparison.remove', { name: product.name })"
                  @click="emit('remove', product)"
              />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <th scope="row">{{ t('catalog.fields.insurer') }}</th>
            <td v-for="product in products" :key="product.id">
              {{ getInsurerName(product.insurerId) }}
            </td>
          </tr>

          <tr>
            <th scope="row">{{ t('catalog.fields.premium') }}</th>
            <td v-for="product in products" :key="product.id">
              {{ formatAmount(product.premiumAmount) }}
              <pv-tag
                  v-if="products.length > 1 && product.id === lowestPremiumId"
                  severity="success"
                  :value="t('catalog.comparison.lowestPremium')"
              />
            </td>
          </tr>

          <tr>
            <th scope="row">{{ t('catalog.fields.coverage') }}</th>
            <td v-for="product in products" :key="product.id">
              {{ formatAmount(product.coverageAmount) }}
              <pv-tag
                  v-if="products.length > 1 && product.id === highestCoverageId"
                  severity="info"
                  :value="t('catalog.comparison.highestCoverage')"
              />
            </td>
          </tr>

          <tr>
            <th scope="row">{{ t('catalog.fields.coveragePerSol') }}</th>
            <td v-for="product in products" :key="product.id">
              S/ {{ formatRatio(coveragePerSol(product)) }}
              <pv-tag
                  v-if="products.length > 1 && product.id === bestValueId"
                  severity="warn"
                  :value="t('catalog.comparison.bestValue')"
              />
            </td>
          </tr>

          <tr>
            <th scope="row">{{ t('catalog.comparison.next') }}</th>
            <td v-for="product in products" :key="product.id">
              <pv-button
                  icon="pi pi-send"
                  size="small"
                  :label="t('catalog.actions.request')"
                  @click="emit('request', product)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <pv-button
          severity="secondary"
          outlined
          :label="t('catalog.actions.close')"
          @click="emit('update:visible', false)"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.comparison-dialog__intro {
  margin: 0 0 1rem;
  color: #52627a;
}

.comparison-table__wrapper {
  overflow-x: auto;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.comparison-table thead th {
  color: #0f172a;
  background: #f1f5f9;
}

.comparison-table tbody th {
  width: 22%;
  color: #52627a;
  font-weight: 600;
}

.comparison-table td .p-tag {
  margin-left: 0.5rem;
}

.comparison-table__product {
  font-weight: 700;
}
</style>
