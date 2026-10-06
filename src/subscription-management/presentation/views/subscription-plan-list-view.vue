<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

import { useSubscriptionStore } from '../../application/subscription.store.js';
import { useUserStore } from '../../../identity-and-profile-management/application/user.store.js';

import SubscriptionPaymentDialog from '../components/subscription-payment-dialog.vue';

const { t, locale } = useI18n();
const router = useRouter();
const toast = useToast();

const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();

const {
  plans,
  activeSubscription,
  loading,
  saving,
  error
} = storeToRefs(subscriptionStore);

const { currentUser } = storeToRefs(userStore);

const billingCycle = ref('monthly');
const selectedPlan = ref(null);
const paymentDialogVisible = ref(false);

const pricePeriod = computed(() =>
    billingCycle.value === 'annual'
        ? t('subscriptions.plans.yearPeriod')
        : t('subscriptions.plans.monthPeriod')
);

const formatPrice = (amount) =>
    new Intl.NumberFormat(
        locale.value === 'es'
            ? 'es-PE'
            : 'en-US',
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }
    ).format(amount);

const getPlanPrice = (plan) =>
    billingCycle.value === 'annual'
        ? plan.annualPrice
        : plan.monthlyPrice;

const getPlanTitle = (plan) =>
    t(
        `subscriptions.plans.${plan.name}.title`
    );

const getPlanDescription = (plan) =>
    t(
        `subscriptions.plans.${plan.name}.${plan.description}`
    );

const getBenefit = (plan, benefit) =>
    t(
        `subscriptions.plans.${plan.name}.${benefit}`
    );

const isCurrentPlan = (plan) =>
    Number(activeSubscription.value?.planId) ===
    Number(plan.id);

const selectBillingCycle = (cycle) => {
  billingCycle.value = cycle;
};

const openPaymentDialog = (plan) => {
  if (activeSubscription.value) {
    router.push({
      name: 'my-subscription'
    });

    return;
  }

  selectedPlan.value = plan;
  paymentDialogVisible.value = true;
};

const setPaymentDialogVisibility = (visible) => {
  paymentDialogVisible.value = visible;

  if (!visible) {
    selectedPlan.value = null;
  }
};

const activateSubscription = async (
    payment
) => {
  if (
      !currentUser.value ||
      !selectedPlan.value
  ) {
    return;
  }

  const createdSubscription =
      await subscriptionStore
          .activateSubscription({
            userId: currentUser.value.id,
            planId: selectedPlan.value.id,
            billingCycle:
            billingCycle.value,
            payment
          });

  if (!createdSubscription) {
    toast.add({
      severity: 'error',
      summary: t(
          error.value ??
          'subscriptions.errors.activate'
      ),
      life: 3500
    });

    subscriptionStore.clearError();
    return;
  }

  paymentDialogVisible.value = false;
  selectedPlan.value = null;

  toast.add({
    severity: 'success',
    summary: t(
        'subscriptions.messages.activated'
    ),
    life: 3500
  });

  await router.push({
    name: 'my-subscription'
  });
};

onMounted(async () => {
  userStore.restoreSession();

  await subscriptionStore.fetchPlans();

  if (currentUser.value) {
    await subscriptionStore
        .fetchUserSubscription(
            currentUser.value.id
        );
  }
});
</script>

<template>
  <main class="subscription-plans-page">
    <pv-toast />

    <header class="subscription-plans-page__header">
      <span class="section-label">
        {{ t('subscriptions.plans.sectionLabel') }}
      </span>

      <h1>
        {{ t('subscriptions.plans.title') }}
      </h1>

      <p>
        {{ t('subscriptions.plans.description') }}
      </p>
    </header>

    <div
        class="billing-selector"
        role="group"
        :aria-label="
          t('subscriptions.mySubscription.billingCycle')
        "
    >
      <button
          type="button"
          :class="{
            'billing-selector__option--active':
                billingCycle === 'monthly'
          }"
          @click="
            selectBillingCycle('monthly')
          "
      >
        {{ t('subscriptions.plans.monthly') }}
      </button>

      <button
          type="button"
          :class="{
            'billing-selector__option--active':
                billingCycle === 'annual'
          }"
          @click="
            selectBillingCycle('annual')
          "
      >
        {{ t('subscriptions.plans.annual') }}

        <small>
          {{
            t(
                'subscriptions.plans.annualSaving'
            )
          }}
        </small>
      </button>
    </div>

    <div
        v-if="loading"
        class="subscription-plans-state"
    >
      <pv-progress-spinner
          stroke-width="4"
          aria-label="Loading subscription plans"
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
        v-else
        class="subscription-plans-grid"
    >
      <article
          v-for="plan in plans"
          :key="plan.id"
          class="subscription-plan-card"
          :class="{
            'subscription-plan-card--featured':
                plan.name === 'pro',
            'subscription-plan-card--current':
                isCurrentPlan(plan)
          }"
      >
        <span
            v-if="plan.name === 'pro'"
            class="subscription-plan-card__badge"
        >
          {{
            t(
                'subscriptions.plans.recommended'
            )
          }}
        </span>

        <h2>{{ getPlanTitle(plan) }}</h2>

        <p class="subscription-plan-card__description">
          {{ getPlanDescription(plan) }}
        </p>

        <div class="subscription-plan-card__price">
          <span class="subscription-plan-card__currency">
            {{ t('subscriptions.plans.currency') }}
          </span>

          <strong>
            {{
              formatPrice(
                  getPlanPrice(plan)
              )
            }}
          </strong>

          <span>{{ pricePeriod }}</span>
        </div>

        <ul class="subscription-plan-card__benefits">
          <li
              v-for="benefit in plan.benefits"
              :key="benefit"
          >
            <i class="pi pi-check-circle"></i>
            {{ getBenefit(plan, benefit) }}
          </li>
        </ul>

        <pv-button
            :label="
              isCurrentPlan(plan)
                  ? t(
                      'subscriptions.plans.currentPlan'
                    )
                  : t(
                      'subscriptions.plans.choose'
                    )
            "
            :icon="
              isCurrentPlan(plan)
                  ? 'pi pi-check'
                  : 'pi pi-arrow-right'
            "
            :outlined="plan.name !== 'pro'"
            :disabled="
              Boolean(activeSubscription) ||
              saving
            "
            @click="openPaymentDialog(plan)"
        />
      </article>
    </div>

    <subscription-payment-dialog
        :visible="paymentDialogVisible"
        :plan="selectedPlan"
        :billing-cycle="billingCycle"
        :saving="saving"
        @update:visible="
          setPaymentDialogVisibility
        "
        @payment-approved="
          activateSubscription
        "
    />
  </main>
</template>

<style scoped>
.subscription-plans-page {
  width: min(100% - 2rem, 1100px);
  min-height: calc(100vh - 152px);
  margin-inline: auto;
  padding-block: 4rem 5rem;
}

.subscription-plans-page__header {
  max-width: 720px;
  margin-inline: auto;
  text-align: center;
}

.subscription-plans-page__header h1 {
  margin: 0.6rem 0 1rem;
  color: #081b3a;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
}

.subscription-plans-page__header p {
  margin: 0;
  color: #52627a;
}

.billing-selector {
  display: flex;
  width: fit-content;
  margin: 2rem auto 2.5rem;
  padding: 0.35rem;
  gap: 0.35rem;
  background: #e8eef7;
  border-radius: 999px;
}

.billing-selector button {
  display: flex;
  min-height: 2.75rem;
  padding: 0.65rem 1.25rem;
  align-items: center;
  gap: 0.6rem;
  color: #52627a;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

.billing-selector button small {
  color: #0f766e;
  font-size: 0.7rem;
}

.billing-selector .billing-selector__option--active {
  color: #081b3a;
  background: #ffffff;
  box-shadow: 0 4px 14px rgb(8 27 58 / 10%);
}

.subscription-plans-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.subscription-plan-card {
  position: relative;
  display: flex;
  min-height: 100%;
  padding: 2rem;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #dfe6f0;
  border-radius: 20px;
  box-shadow: 0 14px 34px rgb(8 27 58 / 8%);
}

.subscription-plan-card--featured {
  border: 2px solid #2563eb;
}

.subscription-plan-card--current {
  border-color: #22a06b;
}

.subscription-plan-card__badge {
  position: absolute;
  top: -0.8rem;
  right: 1.5rem;
  padding: 0.4rem 0.8rem;
  color: #ffffff;
  background: #2563eb;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.subscription-plan-card h2 {
  margin: 0 0 0.75rem;
  color: #081b3a;
  font-size: 1.6rem;
}

.subscription-plan-card__description {
  min-height: 3rem;
  margin: 0;
  color: #52627a;
}

.subscription-plan-card__price {
  display: flex;
  margin-block: 1.75rem;
  align-items: baseline;
  color: #52627a;
}

.subscription-plan-card__price strong {
  color: #081b3a;
  font-size: 3rem;
}

.subscription-plan-card__currency {
  margin-right: 0.35rem;
  color: #081b3a;
  font-size: 1.2rem;
  font-weight: 700;
}

.subscription-plan-card__benefits {
  display: grid;
  margin: 0 0 2rem;
  padding: 0;
  gap: 1rem;
  list-style: none;
}

.subscription-plan-card__benefits li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: #334155;
}

.subscription-plan-card__benefits .pi {
  margin-top: 0.15rem;
  color: #22a06b;
}

.subscription-plan-card :deep(.p-button) {
  width: 100%;
  margin-top: auto;
  justify-content: center;
}

.subscription-plans-state {
  display: grid;
  min-height: 300px;
  place-items: center;
}

@media (max-width: 760px) {
  .subscription-plans-page {
    padding-block: 2.5rem;
  }

  .subscription-plans-grid {
    grid-template-columns: 1fr;
  }

  .billing-selector {
    width: 100%;
  }

  .billing-selector button {
    flex: 1;
    justify-content: center;
  }
}
</style>