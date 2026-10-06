import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import subscriptionPlansApi from '../infrastructure/subscription-plans-api.js';
import userSubscriptionsApi from '../infrastructure/user-subscriptions-api.js';
import subscriptionPaymentsApi from '../infrastructure/subscription-payments-api.js';

import { SubscriptionPlanAssembler } from '../infrastructure/subscription-plan.assembler.js';
import { UserSubscriptionAssembler } from '../infrastructure/user-subscription.assembler.js';
import { SubscriptionPaymentAssembler } from '../infrastructure/subscription-payment.assembler.js';

const addBillingPeriod = (
    startDate,
    billingCycle
) => {
    const nextBillingDate = new Date(startDate);

    if (billingCycle === 'annual') {
        nextBillingDate.setFullYear(
            nextBillingDate.getFullYear() + 1
        );
    } else {
        nextBillingDate.setMonth(
            nextBillingDate.getMonth() + 1
        );
    }

    return nextBillingDate.toISOString();
};

const sortByCreatedAtDescending = (items) =>
    [...items].sort(
        (first, second) =>
            new Date(second.createdAt) -
            new Date(first.createdAt)
    );

export const useSubscriptionStore = defineStore(
    'subscription-management',
    () => {
        const plans = ref([]);
        const userSubscriptions = ref([]);
        const currentSubscription = ref(null);
        const payments = ref([]);

        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);

        const activeSubscription = computed(() =>
            currentSubscription.value?.status ===
            'active'
                ? currentSubscription.value
                : null
        );

        const fetchPlans = async () => {
            loading.value = true;
            error.value = null;

            try {
                const response =
                    await subscriptionPlansApi
                        .getActivePlans();

                plans.value =
                    SubscriptionPlanAssembler
                        .toEntities(response.data);
            } catch {
                error.value =
                    'subscriptions.errors.loadPlans';
            } finally {
                loading.value = false;
            }
        };

        const fetchUserSubscription = async (
            userId
        ) => {
            loading.value = true;
            error.value = null;

            try {
                const response =
                    await userSubscriptionsApi
                        .getByUserId(userId);

                userSubscriptions.value =
                    sortByCreatedAtDescending(
                        UserSubscriptionAssembler
                            .toEntities(response.data)
                    );

                currentSubscription.value =
                    userSubscriptions.value.find(
                        (subscription) =>
                            subscription.status ===
                            'active'
                    ) ??
                    userSubscriptions.value[0] ??
                    null;

                return currentSubscription.value;
            } catch {
                error.value =
                    'subscriptions.errors.loadSubscription';

                return null;
            } finally {
                loading.value = false;
            }
        };

        const fetchPayments = async (userId) => {
            loading.value = true;
            error.value = null;

            try {
                const response =
                    await subscriptionPaymentsApi
                        .getByUserId(userId);

                payments.value =
                    sortByCreatedAtDescending(
                        SubscriptionPaymentAssembler
                            .toEntities(response.data)
                    );
            } catch {
                error.value =
                    'subscriptions.errors.loadPayments';
            } finally {
                loading.value = false;
            }
        };

        const activateSubscription = async ({
                                                userId,
                                                planId,
                                                billingCycle,
                                                payment
                                            }) => {
            saving.value = true;
            error.value = null;

            let createdSubscription = null;

            try {
                if (activeSubscription.value) {
                    error.value =
                        'subscriptions.errors.activeExists';

                    return null;
                }

                if (payment.status !== 'approved') {
                    error.value =
                        'subscriptions.errors.paymentNotApproved';

                    return null;
                }

                const selectedPlan =
                    plans.value.find(
                        (plan) =>
                            Number(plan.id) ===
                            Number(planId)
                    );

                if (!selectedPlan) {
                    error.value =
                        'subscriptions.errors.planNotFound';

                    return null;
                }

                const now = new Date();
                const nowIso = now.toISOString();

                const subscriptionResource =
                    UserSubscriptionAssembler
                        .toResource({
                            userId,
                            planId: selectedPlan.id,
                            billingCycle,
                            status: 'active',
                            startDate: nowIso,
                            nextBillingDate:
                                addBillingPeriod(
                                    now,
                                    billingCycle
                                ),
                            cancelledAt: null,
                            createdAt: nowIso,
                            updatedAt: nowIso
                        });

                const subscriptionResponse =
                    await userSubscriptionsApi
                        .create(
                            subscriptionResource
                        );

                createdSubscription =
                    UserSubscriptionAssembler
                        .toEntity(
                            subscriptionResponse.data
                        );

                const amount =
                    billingCycle === 'annual'
                        ? selectedPlan.annualPrice
                        : selectedPlan.monthlyPrice;

                const paymentResource =
                    SubscriptionPaymentAssembler
                        .toResource({
                            userSubscriptionId:
                            createdSubscription.id,
                            userId,
                            planId: selectedPlan.id,
                            provider:
                            payment.provider,
                            providerPaymentId:
                            payment.providerPaymentId,
                            amount,
                            currency: 'PEN',
                            status: payment.status,
                            paidAt:
                                payment.paidAt ??
                                nowIso,
                            createdAt: nowIso
                        });

                const paymentResponse =
                    await subscriptionPaymentsApi
                        .create(paymentResource);

                const createdPayment =
                    SubscriptionPaymentAssembler
                        .toEntity(
                            paymentResponse.data
                        );

                userSubscriptions.value =
                    sortByCreatedAtDescending([
                        createdSubscription,
                        ...userSubscriptions.value
                    ]);

                currentSubscription.value =
                    createdSubscription;

                payments.value =
                    sortByCreatedAtDescending([
                        createdPayment,
                        ...payments.value
                    ]);

                return createdSubscription;
            } catch {
                if (createdSubscription?.id) {
                    try {
                        await userSubscriptionsApi
                            .delete(
                                createdSubscription.id
                            );
                    } catch {
                        // JSON Server does not provide
                        // transaction support.
                    }
                }

                error.value =
                    'subscriptions.errors.activate';

                return null;
            } finally {
                saving.value = false;
            }
        };

        const cancelSubscription = async () => {
            if (!activeSubscription.value) {
                return false;
            }

            saving.value = true;
            error.value = null;

            try {
                const now =
                    new Date().toISOString();

                const response =
                    await userSubscriptionsApi.patch(
                        activeSubscription.value.id,
                        {
                            status: 'cancelled',
                            cancelledAt: now,
                            updatedAt: now
                        }
                    );

                const cancelledSubscription =
                    UserSubscriptionAssembler
                        .toEntity(response.data);

                const index =
                    userSubscriptions.value
                        .findIndex(
                            (subscription) =>
                                subscription.id ===
                                cancelledSubscription.id
                        );

                if (index !== -1) {
                    userSubscriptions.value[index] =
                        cancelledSubscription;
                }

                currentSubscription.value =
                    cancelledSubscription;

                return true;
            } catch {
                error.value =
                    'subscriptions.errors.cancel';

                return false;
            } finally {
                saving.value = false;
            }
        };

        const clearError = () => {
            error.value = null;
        };

        return {
            plans,
            userSubscriptions,
            currentSubscription,
            activeSubscription,
            payments,
            loading,
            saving,
            error,
            fetchPlans,
            fetchUserSubscription,
            fetchPayments,
            activateSubscription,
            cancelSubscription,
            clearError
        };
    }
);