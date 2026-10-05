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
  beneficiary: {
    type: Object,
    default: null
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
  fullName: '',
  documentType: null,
  documentNumber: '',
  relationship: null,
  birthDate: '',
  participationPercentage: null
});

const errors = reactive({
  policyId: '',
  fullName: '',
  documentType: '',
  documentNumber: '',
  relationship: '',
  birthDate: '',
  participationPercentage: ''
});

const dialogTitle = computed(() =>
    props.beneficiary
        ? t('beneficiaries.form.editTitle')
        : t('beneficiaries.form.createTitle')
);

const policyOptions = computed(() =>
    props.policies.map((policy) => ({
      value: policy.id,
      label: policy.policyNumber
    }))
);

const documentTypeOptions = computed(() => [
  {
    value: 'DNI',
    label: t('beneficiaries.documentTypes.dni')
  },
  {
    value: 'CE',
    label: t('beneficiaries.documentTypes.foreignCard')
  },
  {
    value: 'PASSPORT',
    label: t('beneficiaries.documentTypes.passport')
  }
]);

const relationshipOptions = computed(() => [
  {
    value: 'spouse',
    label: t('beneficiaries.relationships.spouse')
  },
  {
    value: 'child',
    label: t('beneficiaries.relationships.child')
  },
  {
    value: 'parent',
    label: t('beneficiaries.relationships.parent')
  },
  {
    value: 'sibling',
    label: t('beneficiaries.relationships.sibling')
  },
  {
    value: 'other',
    label: t('beneficiaries.relationships.other')
  }
]);

const assignedPercentage = computed(() =>
    props.beneficiaries
        .filter((beneficiary) =>
            Number(beneficiary.policyId) === Number(form.policyId) &&
            beneficiary.id !== props.beneficiary?.id
        )
        .reduce(
            (total, beneficiary) =>
                total + Number(
                    beneficiary.participationPercentage
                ),
            0
        )
);

const clearErrors = () => {
  Object.keys(errors).forEach((field) => {
    errors[field] = '';
  });
};

const prepareForm = () => {
  clearErrors();

  form.policyId = props.beneficiary?.policyId ?? null;
  form.fullName = props.beneficiary?.fullName ?? '';
  form.documentType =
      props.beneficiary?.documentType ?? null;
  form.documentNumber =
      props.beneficiary?.documentNumber ?? '';
  form.relationship =
      props.beneficiary?.relationship ?? null;
  form.birthDate = props.beneficiary?.birthDate ?? '';
  form.participationPercentage =
      props.beneficiary?.participationPercentage ?? null;
};

watch(
    [() => props.visible, () => props.beneficiary],
    ([isVisible]) => {
      if (isVisible) {
        prepareForm();
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
    errors.policyId = t('beneficiaries.validation.required');
  }

  if (form.fullName.trim().length < 3) {
    errors.fullName = t('beneficiaries.validation.required');
  }

  if (!form.documentType) {
    errors.documentType =
        t('beneficiaries.validation.required');
  }

  if (
      !/^[A-Za-z0-9]{8,12}$/.test(
          form.documentNumber.trim()
      )
  ) {
    errors.documentNumber =
        t('beneficiaries.validation.document');
  }

  if (!form.relationship) {
    errors.relationship =
        t('beneficiaries.validation.required');
  }

  if (!form.birthDate || form.birthDate > today) {
    errors.birthDate =
        t('beneficiaries.validation.birthDate');
  }

  if (
      !form.participationPercentage ||
      form.participationPercentage <= 0 ||
      form.participationPercentage > 100
  ) {
    errors.participationPercentage =
        t('beneficiaries.validation.percentage');
  } else if (
      assignedPercentage.value +
      form.participationPercentage >
      100
  ) {
    errors.participationPercentage =
        t('beneficiaries.validation.totalPercentage', {
          available: 100 - assignedPercentage.value
        });
  }

  return Object.values(errors).every((error) => !error);
};

const submitForm = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    policyId: form.policyId,
    fullName: form.fullName.trim(),
    documentType: form.documentType,
    documentNumber:
        form.documentNumber.trim().toUpperCase(),
    relationship: form.relationship,
    birthDate: form.birthDate,
    participationPercentage:
    form.participationPercentage
  });
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :closable="!saving"
      :dismissable-mask="!saving"
      :header="dialogTitle"
      class="vehicle-dialog"
      @update:visible="emit('update:visible', $event)"
  >
    <form class="vehicle-form" @submit.prevent="submitForm">
      <div class="vehicle-form__field">
        <label for="beneficiary-policy">
          {{ t('beneficiaries.fields.policy') }}
        </label>

        <pv-select
            id="beneficiary-policy"
            v-model="form.policyId"
            :options="policyOptions"
            option-label="label"
            option-value="value"
            :placeholder="
              t('beneficiaries.form.selectPolicy')
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
        <label for="beneficiary-name">
          {{ t('beneficiaries.fields.fullName') }}
        </label>

        <pv-input-text
            id="beneficiary-name"
            v-model="form.fullName"
            :invalid="Boolean(errors.fullName)"
            autocomplete="off"
        />

        <small
            v-if="errors.fullName"
            class="vehicle-form__error"
        >
          {{ errors.fullName }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="beneficiary-document-type">
          {{ t('beneficiaries.fields.documentType') }}
        </label>

        <pv-select
            id="beneficiary-document-type"
            v-model="form.documentType"
            :options="documentTypeOptions"
            option-label="label"
            option-value="value"
            :placeholder="
              t('beneficiaries.form.selectDocumentType')
            "
            :invalid="Boolean(errors.documentType)"
        />

        <small
            v-if="errors.documentType"
            class="vehicle-form__error"
        >
          {{ errors.documentType }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="beneficiary-document-number">
          {{ t('beneficiaries.fields.documentNumber') }}
        </label>

        <pv-input-text
            id="beneficiary-document-number"
            v-model="form.documentNumber"
            :invalid="Boolean(errors.documentNumber)"
            maxlength="12"
            autocomplete="off"
        />

        <small
            v-if="errors.documentNumber"
            class="vehicle-form__error"
        >
          {{ errors.documentNumber }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="beneficiary-relationship">
          {{ t('beneficiaries.fields.relationship') }}
        </label>

        <pv-select
            id="beneficiary-relationship"
            v-model="form.relationship"
            :options="relationshipOptions"
            option-label="label"
            option-value="value"
            :placeholder="
              t('beneficiaries.form.selectRelationship')
            "
            :invalid="Boolean(errors.relationship)"
        />

        <small
            v-if="errors.relationship"
            class="vehicle-form__error"
        >
          {{ errors.relationship }}
        </small>
      </div>

      <div class="vehicle-form__field">
        <label for="beneficiary-birth-date">
          {{ t('beneficiaries.fields.birthDate') }}
        </label>

        <input
            id="beneficiary-birth-date"
            v-model="form.birthDate"
            type="date"
            :max="today"
            class="p-inputtext p-component"
            :class="{ 'p-invalid': errors.birthDate }"
        />

        <small
            v-if="errors.birthDate"
            class="vehicle-form__error"
        >
          {{ errors.birthDate }}
        </small>
      </div>

      <div class="vehicle-form__field vehicle-form__field--full">
        <label for="beneficiary-percentage">
          {{ t('beneficiaries.fields.percentage') }}
        </label>

        <pv-input-number
            id="beneficiary-percentage"
            v-model="form.participationPercentage"
            suffix=" %"
            :min="1"
            :max="100"
            :max-fraction-digits="2"
            :invalid="
              Boolean(errors.participationPercentage)
            "
        />

        <small
            v-if="errors.participationPercentage"
            class="vehicle-form__error"
        >
          {{ errors.participationPercentage }}
        </small>
      </div>

      <footer class="vehicle-form__actions">
        <pv-button
            type="button"
            severity="secondary"
            outlined
            :label="t('beneficiaries.actions.cancel')"
            :disabled="saving"
            @click="closeDialog"
        />

        <pv-button
            type="submit"
            icon="pi pi-check"
            :label="t('beneficiaries.actions.save')"
            :loading="saving"
        />
      </footer>
    </form>
  </pv-dialog>
</template>