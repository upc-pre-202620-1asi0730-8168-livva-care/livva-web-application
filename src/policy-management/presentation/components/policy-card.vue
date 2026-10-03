<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  policy: {
    type: Object,
    required: true
  }
});

const { t, locale } = useI18n();

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
  if (props.policy.status === 'active') return 'success';
  if (props.policy.status === 'expired') return 'danger';
  return 'info';
});
</script>

<template>
  <pv-card class="policy-card">
    <template #title>
      <div class="policy-card__header">
        <span>{{ policy.policyNumber }}</span>

        <pv-tag
            :value="t(`policies.statuses.${policy.status}`)"
            :severity="statusSeverity"
        />
      </div>
    </template>

    <template #subtitle>
      {{ t(`policies.types.${policy.insuranceType}`) }}
    </template>

    <template #content>
      <dl class="policy-card__information">
        <div>
          <dt>{{ t('policies.fields.startDate') }}</dt>
          <dd>{{ formatDate(policy.startDate) }}</dd>
        </div>

        <div>
          <dt>{{ t('policies.fields.expirationDate') }}</dt>
          <dd>{{ formatDate(policy.expirationDate) }}</dd>
        </div>

        <div>
          <dt>{{ t('policies.fields.premiumAmount') }}</dt>
          <dd>{{ formatAmount(policy.premiumAmount) }}</dd>
        </div>

        <div>
          <dt>{{ t('policies.fields.coverageAmount') }}</dt>
          <dd>{{ formatAmount(policy.coverageAmount) }}</dd>
        </div>
      </dl>
    </template>
  </pv-card>
</template>