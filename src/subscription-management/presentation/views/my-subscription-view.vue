<script setup>
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

import { useSubscriptionStore } from '../../application/subscription.store.js';
import { useUserStore } from '../../../identity-and-profile-management/application/user.store.js';

const { t, locale } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const subscriptionStore = useSubscriptionStore();
const userStore = useUserStore();

const {
  currentSubscription,
  payments,
  plans,
  loading,
  saving,
  error
} = storeToRefs(subscriptionStore);

const currentPlan = computed(() =>
    plans.value.find(
        plan =>
            Number(plan.id) ===
            Number(currentSubscription.value?.planId)
    )
);

const translatePlan = computed(() =>
    currentPlan.value
        ? t(`subscriptions.plans.${currentPlan.value.name}.title`)
        : ''
);

const formatDate = value =>
    value
        ? new Intl.DateTimeFormat(
            locale.value === 'es' ? 'es-PE' : 'en-US'
        ).format(new Date(value))
        : '-';

const formatAmount = value =>
    new Intl.NumberFormat(
        locale.value === 'es' ? 'es-PE' : 'en-US',
        {
          style: 'currency',
          currency: 'PEN'
        }
    ).format(value);

const cancelSubscription = () => {
  confirm.require({
    header: t(
        'subscriptions.mySubscription.cancellation.title'
    ),
    message: t(
        'subscriptions.mySubscription.cancellation.description'
    ),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t(
        'subscriptions.mySubscription.actions.confirmCancel'
    ),
    rejectLabel: t(
        'subscriptions.mySubscription.actions.keep'
    ),
    accept: async () => {
      const cancelled =
          await subscriptionStore.cancelSubscription();

      if (cancelled) {
        toast.add({
          severity: 'success',
          summary: t(
              'subscriptions.messages.cancelled'
          ),
          life: 3500
        });
      }
    }
  });
};

onMounted(async () => {
  userStore.restoreSession();
  await subscriptionStore.fetchPlans();

  if (userStore.currentUser) {
    await Promise.all([
      subscriptionStore.fetchUserSubscription(
          userStore.currentUser.id
      ),
      subscriptionStore.fetchPayments(
          userStore.currentUser.id
      )
    ]);
  }
});
</script>

<template>
  <main class="subscription-page">
    <pv-toast />
    <pv-confirm-dialog />

    <header>
      <span class="section-label">
        {{ t('subscriptions.mySubscription.sectionLabel') }}
      </span>

      <h1>{{ t('subscriptions.mySubscription.title') }}</h1>

      <p>{{ t('subscriptions.mySubscription.description') }}</p>
    </header>

    <pv-progress-spinner v-if="loading" />

    <pv-message
        v-else-if="error"
        severity="error"
        :closable="false"
    >
      {{ t(error) }}
    </pv-message>

    <section
        v-else-if="!currentSubscription"
        class="empty-state"
    >
      <p>{{ t('subscriptions.mySubscription.noSubscription') }}</p>

      <pv-button
          :label="t('subscriptions.mySubscription.browsePlans')"
          icon="pi pi-arrow-right"
          @click="router.push('/subscription-plans')"
      />
    </section>

    <template v-else>
      <section class="subscription-card">
        <div>
          <span>{{ t('subscriptions.mySubscription.currentPlan') }}</span>
          <strong>{{ translatePlan }}</strong>
        </div>

        <div>
          <span>{{ t('subscriptions.mySubscription.status') }}</span>
          <strong>
            {{
              t(
                  `subscriptions.mySubscription.statuses.${currentSubscription.status}`
              )
            }}
          </strong>
        </div>

        <div>
          <span>{{ t('subscriptions.mySubscription.billingCycle') }}</span>
          <strong>
            {{
              t(
                  `subscriptions.mySubscription.${currentSubscription.billingCycle}`
              )
            }}
          </strong>
        </div>

        <div>
          <span>{{ t('subscriptions.mySubscription.startDate') }}</span>
          <strong>{{ formatDate(currentSubscription.startDate) }}</strong>
        </div>

        <div>
          <span>{{ t('subscriptions.mySubscription.nextBillingDate') }}</span>
          <strong>{{ formatDate(currentSubscription.nextBillingDate) }}</strong>
        </div>

        <pv-button
            v-if="currentSubscription.status === 'active'"
            severity="danger"
            outlined
            :loading="saving"
            :label="t('subscriptions.mySubscription.actions.cancel')"
            @click="cancelSubscription"
        />
      </section>

      <section class="payments">
        <h2>{{ t('subscriptions.mySubscription.payments.title') }}</h2>

        <p v-if="payments.length === 0">
          {{ t('subscriptions.mySubscription.payments.empty') }}
        </p>

        <article
            v-for="payment in payments"
            :key="payment.id"
            class="payment"
        >
          <span>{{ formatDate(payment.paidAt) }}</span>
          <span>{{ payment.provider }}</span>
          <strong>{{ formatAmount(payment.amount) }}</strong>
          <pv-tag
              severity="success"
              :value="
                t(
                    `subscriptions.mySubscription.payments.${payment.status}`
                )
              "
          />
        </article>
      </section>
    </template>
  </main>
</template>

<style scoped>
.subscription-page {
  width: min(100% - 2rem, 1000px);
  min-height: calc(100vh - 152px);
  margin-inline: auto;
  padding-block: 4rem;
}

header h1 {
  margin: 0.5rem 0;
  color: #081b3a;
  font-size: clamp(2.3rem, 5vw, 3.5rem);
}

header p,
.subscription-card span {
  color: #52627a;
}

.subscription-card,
.payments,
.empty-state {
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border: 1px solid #dfe6f0;
  border-radius: 18px;
}

.subscription-card {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.subscription-card div {
  display: grid;
  gap: 0.35rem;
}

.subscription-card strong {
  color: #081b3a;
}

.payment {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 1rem 0;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #dfe6f0;
}

@media (max-width: 650px) {
  .subscription-card,
  .payment {
    grid-template-columns: 1fr;
  }
}
</style>