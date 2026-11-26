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
  policies: {
    type: Array,
    default: () => []
  },
  beneficiaries: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:visible', 'save']);
const { t } = useI18n();

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  policyId: null,
  beneficiaryId: null,
  requestDate: today,
  description: '',
  indemnityAmount: null
});

const errors = reactive({
  policyId: '',
  beneficiaryId: '',
  requestDate: '',
  description: '',
  indemnityAmount: ''
});

const policyOptions = computed(() =>
    props.policies.map((policy) => ({
      value: policy.id,
      label: policy.policyNumber
    }))
);

// Only the beneficiaries registered in the selected policy can request its indemnity.
const beneficiaryOptions = computed(() =>
    props.beneficiaries
        .filter(
            (beneficiary) =>
                Number(beneficiary.policyId) === Number(form.policyId)
        )
        .map((beneficiary) => ({
          value: beneficiary.id,
          label: `${beneficiary.fullName} (${t(`beneficiaries.relationships.${beneficiary.relationship}`)})`
        }))
);

const clearErrors = () => {
  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });
};

const resetForm = () => {
  clearErrors();

  form.policyId = null;
  form.beneficiaryId = null;
  form.requestDate = today;
  form.description = '';
  form.indemnityAmount = null;
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
    () => form.policyId,
    () => {
      form.beneficiaryId = null;
    }
);

const closeDialog = () => {
  if (!props.saving) {
    emit('update:visible', false);
  }
};

const validateForm = () => {
  clearErrors();

  if (!form.policyId) {
    errors.policyId = t('indemnities.validation.required');
  }

  if (!form.beneficiaryId) {
    errors.beneficiaryId = form.policyId && beneficiaryOptions.value.length === 0
        ? t('indemnities.validation.noBeneficiaries')
        : t('indemnities.validation.required');
  }

  if (!form.requestDate || form.requestDate > today) {
    errors.requestDate = t('indemnities.validation.requestDate');
  }

  const descriptionLength = form.description.trim().length;

  if (descriptionLength < 5 || descriptionLength > 1000) {
    errors.description = t('indemnities.validation.description');
  }

  if (
      form.indemnityAmount !== null &&
      form.indemnityAmount <= 0
  ) {
    errors.indemnityAmount = t('indemnities.validation.amount');
  }

  return Object.values(errors).every((error) => !error);
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    policyId: form.policyId,
    beneficiaryId: form.beneficiaryId,
    requestDate: form.requestDate,
    description: form.description.trim(),
    indemnityAmount: form.indemnityAmount
  });
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!saving"
      :dismissable-mask="!saving"
      :header="t('indemnities.form.createTitle')"
      class="vehicle-dialog"
      @update:visible="emit('update:visible', $event)"
  >
    <p class="indemnity-form__hint">
      {{ t('indemnities.form.hint') }}
    </p>

    <form
        class="vehicle-form"
        novalidate
        @submit.prevent="submitForm"
    >
      <div class="vehicle-form__field">
        <label for="indemnity-policy">
          {{ t('indemnities.fields.policy') }}
        </label>

        <pv-select
            v-model="form.policyId"
            input-id="indemnity-policy"
            :options="policyOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('indemnities.form.selectPolicy')"
            :invalid="Boolean(errors.policyId)"
            :aria-describedby="errors.policyId ? 'indemnity-policy-error' : undefined"
        />

        <small
            v-if="errors.policyId"
            id="indemnity-policy-error"
            class="vehicle-form__error"
            role="alert"
        >
          {{ errors.policyId }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="indemnity-beneficiary">
          {{ t('indemnities.fields.beneficiary') }}
        </label>

        <pv-select
            v-model="form.beneficiaryId"
            input-id="indemnity-beneficiary"
            :options="beneficiaryOptions"
            option-label="label"
            option-value="value"
            :disabled="!form.policyId"
            :placeholder="t('indemnities.form.selectBeneficiary')"
            :empty-message="t('indemnities.validation.noBeneficiaries')"
            :invalid="Boolean(errors.beneficiaryId)"
            :aria-describedby="errors.beneficiaryId ? 'indemnity-beneficiary-error' : undefined"
        />

        <small
            v-if="errors.beneficiaryId"
            id="indemnity-beneficiary-error"
            class="vehicle-form__error"
            role="alert"
        >
          {{ errors.beneficiaryId }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="indemnity-request-date">
          {{ t('indemnities.fields.requestDate') }}
        </label>

        <input
            id="indemnity-request-date"
            v-model="form.requestDate"
            type="date"
            :max="today"
            class="p-inputtext p-component"
            :class="{ 'p-invalid': errors.requestDate }"
            :aria-invalid="Boolean(errors.requestDate)"
        />

        <small
            v-if="errors.requestDate"
            class="vehicle-form__error"
            role="alert"
        >
          {{ errors.requestDate }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="indemnity-amount">
          {{ t('indemnities.fields.amount') }}
          <span class="indemnity-form__optional">
            ({{ t('indemnities.form.optional') }})
          </span>
        </label>

        <pv-input-number
            v-model="form.indemnityAmount"
            input-id="indemnity-amount"
            mode="currency"
            currency="PEN"
            locale="es-PE"
            :min="0"
            :max-fraction-digits="2"
            :invalid="Boolean(errors.indemnityAmount)"
        />

        <small
            v-if="errors.indemnityAmount"
            class="vehicle-form__error"
            role="alert"
        >
          {{ errors.indemnityAmount }}
        </small>
      </div>

      <div class="vehicle-form__field vehicle-form__field--full">
        <label for="indemnity-description">
          {{ t('indemnities.fields.description') }}
        </label>

        <textarea
            id="indemnity-description"
            v-model="form.description"
            rows="4"
            maxlength="1000"
            class="p-inputtext p-component"
            :class="{ 'p-invalid': errors.description }"
            :aria-invalid="Boolean(errors.description)"
        />

        <small class="indemnity-form__counter">
          {{ form.description.trim().length }}/1000
        </small>

        <small
            v-if="errors.description"
            class="vehicle-form__error"
            role="alert"
        >
          {{ errors.description }}
        </small>
      </div>

      <footer class="vehicle-form__actions">
        <pv-button
            type="button"
            severity="secondary"
            outlined
            :label="t('indemnities.actions.cancel')"
            :disabled="saving"
            @click="closeDialog"
        />

        <pv-button
            type="submit"
            icon="pi pi-check"
            :label="t('indemnities.actions.save')"
            :loading="saving"
        />
      </footer>
    </form>
  </pv-dialog>
</template>

<style scoped>
.indemnity-form__hint {
  margin: 0 0 1rem;
  color: #52627a;
  font-size: 0.9rem;
}

.indemnity-form__optional {
  color: #94a3b8;
  font-weight: 400;
}

.indemnity-form__counter {
  align-self: flex-end;
  color: #94a3b8;
}
</style>
