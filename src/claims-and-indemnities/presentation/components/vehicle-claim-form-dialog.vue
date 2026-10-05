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
  }
});

const emit = defineEmits(['update:visible', 'save']);
const { t } = useI18n();

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  policyId: null,
  incidentDate: '',
  incidentLocation: '',
  description: '',
  estimatedDamageAmount: null
});

const errors = reactive({
  policyId: '',
  incidentDate: '',
  incidentLocation: '',
  description: '',
  estimatedDamageAmount: ''
});

const policyOptions = computed(() =>
    props.policies.map((policy) => ({
      value: policy.id,
      label: policy.policyNumber
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
  form.incidentDate = '';
  form.incidentLocation = '';
  form.description = '';
  form.estimatedDamageAmount = null;
};

watch(
    () => props.visible,
    (isVisible) => {
      if (isVisible) {
        resetForm();
      }
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
    errors.policyId =
        t('vehicleClaims.validation.required');
  }

  if (
      !form.incidentDate ||
      form.incidentDate > today
  ) {
    errors.incidentDate =
        t('vehicleClaims.validation.incidentDate');
  }

  if (form.incidentLocation.trim().length < 3) {
    errors.incidentLocation =
        t('vehicleClaims.validation.location');
  }

  if (form.description.trim().length < 10) {
    errors.description =
        t('vehicleClaims.validation.description');
  }

  if (
      !form.estimatedDamageAmount ||
      form.estimatedDamageAmount <= 0
  ) {
    errors.estimatedDamageAmount =
        t('vehicleClaims.validation.damageAmount');
  }

  return Object.values(errors).every((error) => !error);
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    policyId: form.policyId,
    incidentDate: form.incidentDate,
    incidentLocation: form.incidentLocation.trim(),
    description: form.description.trim(),
    estimatedDamageAmount:
    form.estimatedDamageAmount
  });
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!saving"
      :dismissable-mask="!saving"
      :header="t('vehicleClaims.form.createTitle')"
      class="vehicle-dialog"
      @update:visible="
        emit('update:visible', $event)
      "
  >
    <form
        class="vehicle-form"
        @submit.prevent="submitForm"
    >
      <div class="vehicle-form__field">
        <label for="claim-policy">
          {{ t('vehicleClaims.fields.policy') }}
        </label>

        <pv-select
            id="claim-policy"
            v-model="form.policyId"
            :options="policyOptions"
            option-label="label"
            option-value="value"
            :placeholder="
              t('vehicleClaims.form.selectPolicy')
            "
            :invalid="Boolean(errors.policyId)"
        />

        <small
            v-if="errors.policyId"
            class="vehicle-form__error"
        >
          {{ errors.policyId }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="claim-incident-date">
          {{ t('vehicleClaims.fields.incidentDate') }}
        </label>

        <input
            id="claim-incident-date"
            v-model="form.incidentDate"
            type="date"
            :max="today"
            class="p-inputtext p-component"
            :class="{
              'p-invalid': errors.incidentDate
            }"
        />

        <small
            v-if="errors.incidentDate"
            class="vehicle-form__error"
        >
          {{ errors.incidentDate }}
        </small>
      </div>

      <div
          class="
            vehicle-form__field
            vehicle-form__field--full
          "
      >
        <label for="claim-location">
          {{ t('vehicleClaims.fields.location') }}
        </label>

        <pv-input-text
            id="claim-location"
            v-model="form.incidentLocation"
            :invalid="
              Boolean(errors.incidentLocation)
            "
            autocomplete="off"
        />

        <small
            v-if="errors.incidentLocation"
            class="vehicle-form__error"
        >
          {{ errors.incidentLocation }}
        </small>
      </div>

      <div
          class="
            vehicle-form__field
            vehicle-form__field--full
          "
      >
        <label for="claim-description">
          {{ t('vehicleClaims.fields.description') }}
        </label>

        <textarea
            id="claim-description"
            v-model="form.description"
            rows="4"
            maxlength="500"
            class="p-inputtext p-component"
            :class="{
              'p-invalid': errors.description
            }"
        />

        <small
            v-if="errors.description"
            class="vehicle-form__error"
        >
          {{ errors.description }}
        </small>
      </div>

      <div
          class="
            vehicle-form__field
            vehicle-form__field--full
          "
      >
        <label for="claim-damage-amount">
          {{
            t(
                'vehicleClaims.fields.estimatedDamageAmount'
            )
          }}
        </label>

        <pv-input-number
            id="claim-damage-amount"
            v-model="form.estimatedDamageAmount"
            mode="currency"
            currency="PEN"
            locale="es-PE"
            :min="1"
            :max-fraction-digits="2"
            :invalid="
              Boolean(errors.estimatedDamageAmount)
            "
        />

        <small
            v-if="errors.estimatedDamageAmount"
            class="vehicle-form__error"
        >
          {{ errors.estimatedDamageAmount }}
        </small>
      </div>

      <footer class="vehicle-form__actions">
        <pv-button
            type="button"
            severity="secondary"
            outlined
            :label="
              t('vehicleClaims.actions.cancel')
            "
            :disabled="saving"
            @click="closeDialog"
        />

        <pv-button
            type="submit"
            icon="pi pi-check"
            :label="t('vehicleClaims.actions.save')"
            :loading="saving"
        />
      </footer>
    </form>
  </pv-dialog>
</template>