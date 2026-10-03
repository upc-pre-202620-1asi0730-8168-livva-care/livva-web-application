<script setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  saving: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'save']);

const { t } = useI18n();
const currentYear = new Date().getFullYear();

const form = reactive({
  licensePlate: '',
  brand: '',
  model: '',
  manufactureYear: null,
  estimatedValue: null
});

const errors = reactive({
  licensePlate: '',
  brand: '',
  model: '',
  manufactureYear: '',
  estimatedValue: ''
});

const resetForm = () => {
  form.licensePlate = '';
  form.brand = '';
  form.model = '';
  form.manufactureYear = null;
  form.estimatedValue = null;

  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });
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
  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });

  if (!form.licensePlate.trim()) {
    errors.licensePlate = t('vehicles.validation.required');
  }

  if (!form.brand.trim()) {
    errors.brand = t('vehicles.validation.required');
  }

  if (!form.model.trim()) {
    errors.model = t('vehicles.validation.required');
  }

  if (
      !form.manufactureYear ||
      form.manufactureYear < 1900 ||
      form.manufactureYear > currentYear
  ) {
    errors.manufactureYear = t('vehicles.validation.year', {
      year: currentYear
    });
  }

  if (!form.estimatedValue || form.estimatedValue <= 0) {
    errors.estimatedValue = t('vehicles.validation.value');
  }

  return Object.values(errors).every((error) => !error);
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    licensePlate: form.licensePlate.trim().toUpperCase(),
    brand: form.brand.trim(),
    model: form.model.trim(),
    manufactureYear: form.manufactureYear,
    estimatedValue: form.estimatedValue
  });
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!saving"
      :dismissable-mask="!saving"
      :header="t('vehicles.form.createTitle')"
      class="vehicle-dialog"
      @update:visible="emit('update:visible', $event)"
  >
    <form class="vehicle-form" @submit.prevent="submitForm">
      <div class="vehicle-form__field">
        <label for="license-plate">
          {{ t('vehicles.fields.licensePlate') }}
        </label>

        <pv-input-text
            id="license-plate"
            v-model="form.licensePlate"
            :invalid="Boolean(errors.licensePlate)"
            maxlength="8"
            autocomplete="off"
        />

        <small v-if="errors.licensePlate" class="vehicle-form__error">
          {{ errors.licensePlate }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="brand">
          {{ t('vehicles.fields.brand') }}
        </label>

        <pv-input-text
            id="brand"
            v-model="form.brand"
            :invalid="Boolean(errors.brand)"
            autocomplete="off"
        />

        <small v-if="errors.brand" class="vehicle-form__error">
          {{ errors.brand }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="model">
          {{ t('vehicles.fields.model') }}
        </label>

        <pv-input-text
            id="model"
            v-model="form.model"
            :invalid="Boolean(errors.model)"
            autocomplete="off"
        />

        <small v-if="errors.model" class="vehicle-form__error">
          {{ errors.model }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="manufacture-year">
          {{ t('vehicles.fields.manufactureYear') }}
        </label>

        <pv-input-number
            id="manufacture-year"
            v-model="form.manufactureYear"
            :invalid="Boolean(errors.manufactureYear)"
            :use-grouping="false"
            :min="1900"
            :max="currentYear"
        />

        <small v-if="errors.manufactureYear" class="vehicle-form__error">
          {{ errors.manufactureYear }}
        </small>
      </div>

      <div class="vehicle-form__field vehicle-form__field--full">
        <label for="estimated-value">
          {{ t('vehicles.fields.estimatedValue') }}
        </label>

        <pv-input-number
            id="estimated-value"
            v-model="form.estimatedValue"
            :invalid="Boolean(errors.estimatedValue)"
            :min="1"
            :max-fraction-digits="2"
            mode="currency"
            currency="PEN"
            locale="es-PE"
        />

        <small v-if="errors.estimatedValue" class="vehicle-form__error">
          {{ errors.estimatedValue }}
        </small>
      </div>

      <footer class="vehicle-form__actions">
        <pv-button
            type="button"
            severity="secondary"
            outlined
            :label="t('vehicles.actions.cancel')"
            :disabled="saving"
            @click="closeDialog"
        />

        <pv-button
            type="submit"
            icon="pi pi-check"
            :label="t('vehicles.actions.save')"
            :loading="saving"
        />
      </footer>
    </form>
  </pv-dialog>
</template>