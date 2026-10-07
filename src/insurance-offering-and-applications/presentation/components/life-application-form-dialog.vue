<script setup>
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  },
  insurers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'save']);

const { t, locale } = useI18n();

const form = reactive({
  productId: null,
  requestedCoverage: null
});

const errors = reactive({
  productId: '',
  requestedCoverage: ''
});

const productOptions = computed(() =>
    props.products.map((product) => {
      const insurer = props.insurers.find(
          (item) => item.id === product.insurerId
      );

      return {
        value: product.id,
        label: `${product.name} — ${insurer?.name ?? ''}`,
        coverageAmount: product.coverageAmount,
        premiumAmount: product.premiumAmount
      };
    })
);

const selectedProduct = computed(() =>
    productOptions.value.find(
        (product) => product.value === form.productId
    )
);

const formatAmount = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN',
          maximumFractionDigits: 2
        }
    ).format(amount ?? 0);

const clearErrors = () => {
  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });
};

const resetForm = () => {
  form.productId = null;
  form.requestedCoverage = null;
  clearErrors();
};

watch(
    () => props.visible,
    (isVisible) => {
      if (isVisible) {
        resetForm();
      }
    }
);

watch(
    () => form.productId,
    () => {
      form.requestedCoverage =
          selectedProduct.value?.coverageAmount ?? null;
    }
);

const closeDialog = () => {
  if (!props.saving) {
    emit('update:visible', false);
  }
};

const validateForm = () => {
  clearErrors();

  if (!form.productId) {
    errors.productId = t(
        'lifeApplications.validation.productRequired'
    );
  }

  if (
      !form.requestedCoverage ||
      form.requestedCoverage <= 0
  ) {
    errors.requestedCoverage = t(
        'lifeApplications.validation.coverageRequired'
    );
  } else if (
      selectedProduct.value &&
      form.requestedCoverage >
      selectedProduct.value.coverageAmount
  ) {
    errors.requestedCoverage = t(
        'lifeApplications.validation.coverageMaximum',
        {
          amount: formatAmount(
              selectedProduct.value.coverageAmount
          )
        }
    );
  }

  return Object.values(errors).every((error) => !error);
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    productId: form.productId,
    requestedCoverage: form.requestedCoverage
  });
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!saving"
      :dismissable-mask="!saving"
      :header="t('lifeApplications.form.title')"
      class="life-application-dialog"
      @update:visible="emit('update:visible', $event)"
  >
    <form
        class="life-application-form"
        @submit.prevent="submitForm"
    >
      <div class="vehicle-form__field">
        <label for="life-application-product">
          {{ t('lifeApplications.fields.product') }}
        </label>

        <pv-select
            id="life-application-product"
            v-model="form.productId"
            :options="productOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('lifeApplications.form.selectProduct')"
            :invalid="Boolean(errors.productId)"
        />

        <small
            v-if="errors.productId"
            class="vehicle-form__error"
        >
          {{ errors.productId }}
        </small>
      </div>

      <div
          v-if="selectedProduct"
          class="life-application-form__summary"
      >
        <div>
          <span>
            {{ t('lifeApplications.fields.maximumCoverage') }}
          </span>
          <strong>
            {{ formatAmount(selectedProduct.coverageAmount) }}
          </strong>
        </div>

        <div>
          <span>
            {{ t('lifeApplications.fields.premiumAmount') }}
          </span>
          <strong>
            {{ formatAmount(selectedProduct.premiumAmount) }}
          </strong>
        </div>
      </div>

      <div class="vehicle-form__field">
        <label for="life-requested-coverage">
          {{ t('lifeApplications.fields.requestedCoverage') }}
        </label>

        <pv-input-number
            id="life-requested-coverage"
            v-model="form.requestedCoverage"
            mode="currency"
            currency="PEN"
            :locale="locale === 'es' ? 'es-PE' : 'en-US'"
            :min="1"
            :max-fraction-digits="2"
            :invalid="Boolean(errors.requestedCoverage)"
        />

        <small
            v-if="errors.requestedCoverage"
            class="vehicle-form__error"
        >
          {{ errors.requestedCoverage }}
        </small>
      </div>

      <footer class="vehicle-form__actions">
        <pv-button
            type="button"
            severity="secondary"
            outlined
            :label="t('lifeApplications.actions.cancel')"
            :disabled="saving"
            @click="closeDialog"
        />

        <pv-button
            type="submit"
            icon="pi pi-send"
            :label="t('lifeApplications.actions.submit')"
            :loading="saving"
        />
      </footer>
    </form>
  </pv-dialog>
</template>