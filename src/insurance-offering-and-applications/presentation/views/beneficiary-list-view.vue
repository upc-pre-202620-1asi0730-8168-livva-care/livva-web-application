<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useBeneficiaryStore } from '../../application/beneficiary.store.js';
import { usePolicyStore } from '../../../policy-management/application/policy.store.js';
import BeneficiaryFormDialog from '../components/beneficiary-form-dialog.vue';

const { t, locale } = useI18n();
const toast = useToast();

const beneficiaryStore = useBeneficiaryStore();
const policyStore = usePolicyStore();

const {
  beneficiaries,
  loading: beneficiariesLoading,
  saving,
  error: beneficiaryError
} = storeToRefs(beneficiaryStore);

const {
  policies,
  loading: policiesLoading,
  error: policyError
} = storeToRefs(policyStore);

const formVisible = ref(false);
const selectedBeneficiary = ref(null);

const loading = computed(() =>
    beneficiariesLoading.value || policiesLoading.value
);

const pageError = computed(() =>
    beneficiaryError.value || policyError.value
);

const lifePolicies = computed(() =>
    policies.value.filter(
        (policy) =>
            policy.insuranceType === 'life' &&
            policy.status === 'active'
    )
);

const getPolicyNumber = (policyId) =>
    lifePolicies.value.find(
        (policy) => policy.id === policyId
    )?.policyNumber ?? '—';

const getRelationshipLabel = (relationship) =>
    t(`beneficiaries.relationships.${relationship}`);

const formatDate = (date) =>
    new Intl.DateTimeFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US'
    ).format(new Date(`${date}T00:00:00`));

const setFormVisibility = (visible) => {
  formVisible.value = visible;

  if (!visible) {
    selectedBeneficiary.value = null;
  }
};

const openCreateForm = () => {
  beneficiaryStore.clearError();
  selectedBeneficiary.value = null;
  formVisible.value = true;
};

const openEditForm = (beneficiary) => {
  beneficiaryStore.clearError();
  selectedBeneficiary.value = beneficiary;
  formVisible.value = true;
};

const saveBeneficiary = async (beneficiaryData) => {
  const isEditing = Boolean(selectedBeneficiary.value);

  const savedBeneficiary = isEditing
      ? await beneficiaryStore.updateBeneficiary(
          selectedBeneficiary.value.id,
          beneficiaryData
      )
      : await beneficiaryStore.createBeneficiary(
          beneficiaryData
      );

  if (!savedBeneficiary) {
    toast.add({
      severity: 'error',
      summary: t(
          isEditing
              ? 'beneficiaries.errors.update'
              : 'beneficiaries.errors.create'
      ),
      life: 3000
    });

    beneficiaryStore.clearError();
    return;
  }

  setFormVisibility(false);

  toast.add({
    severity: 'success',
    summary: t(
        isEditing
            ? 'beneficiaries.messages.updated'
            : 'beneficiaries.messages.created'
    ),
    life: 3000
  });
};

onMounted(async () => {
  await policyStore.fetchPolicies();

  if (policyError.value) {
    return;
  }

  await beneficiaryStore.fetchBeneficiaries(
      lifePolicies.value.map((policy) => policy.id)
  );
});
</script>

<template>
  <main class="vehicles-page beneficiaries-page">
    <pv-toast />

    <header class="vehicles-page__heading">
      <div class="vehicles-page__header">
        <span class="section-label">
          {{ t('beneficiaries.sectionLabel') }}
        </span>

        <h1>{{ t('beneficiaries.title') }}</h1>

        <p>{{ t('beneficiaries.description') }}</p>
      </div>

      <pv-button
          icon="pi pi-plus"
          :label="t('beneficiaries.actions.add')"
          :disabled="lifePolicies.length === 0"
          @click="openCreateForm"
      />
    </header>

    <pv-message
        v-if="!loading && lifePolicies.length === 0"
        severity="warn"
        :closable="false"
    >
      {{ t('beneficiaries.noLifePolicies') }}
    </pv-message>

    <div v-if="loading" class="vehicles-state">
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading beneficiaries"
      />
    </div>

    <pv-message
        v-else-if="pageError"
        severity="error"
        :closable="false"
    >
      {{ t(pageError) }}
    </pv-message>

    <pv-data-table
        v-else
        :value="beneficiaries"
        paginator
        :rows="5"
        striped-rows
        responsive-layout="scroll"
        class="vehicles-table"
    >
      <template #empty>
        <div class="vehicles-state">
          <i class="pi pi-users"></i>
          <p>{{ t('beneficiaries.empty') }}</p>
        </div>
      </template>

      <pv-column
          field="fullName"
          :header="t('beneficiaries.fields.fullName')"
      />

      <pv-column :header="t('beneficiaries.fields.document')">
        <template #body="{ data }">
          {{ data.documentType }} {{ data.documentNumber }}
        </template>
      </pv-column>

      <pv-column
          :header="t('beneficiaries.fields.relationship')"
      >
        <template #body="{ data }">
          {{ getRelationshipLabel(data.relationship) }}
        </template>
      </pv-column>

      <pv-column :header="t('beneficiaries.fields.birthDate')">
        <template #body="{ data }">
          {{ formatDate(data.birthDate) }}
        </template>
      </pv-column>

      <pv-column :header="t('beneficiaries.fields.policy')">
        <template #body="{ data }">
          {{ getPolicyNumber(data.policyId) }}
        </template>
      </pv-column>

      <pv-column :header="t('beneficiaries.fields.percentage')">
        <template #body="{ data }">
          {{ data.participationPercentage }} %
        </template>
      </pv-column>

      <pv-column :header="t('beneficiaries.actions.column')">
        <template #body="{ data }">
          <div class="vehicles-table__actions">
            <pv-button
                icon="pi pi-pencil"
                severity="secondary"
                text
                :label="t('beneficiaries.actions.edit')"
                @click="openEditForm(data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <beneficiary-form-dialog
        :visible="formVisible"
        :saving="saving"
        :beneficiary="selectedBeneficiary"
        :policies="lifePolicies"
        :beneficiaries="beneficiaries"
        @update:visible="setFormVisibility"
        @save="saveBeneficiary"
    />
  </main>
</template>