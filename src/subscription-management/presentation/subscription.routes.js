const SubscriptionPlanListView = () =>
    import(
        './views/subscription-plan-list-view.vue'
        );

const MySubscriptionView = () =>
    import(
        './views/my-subscription-view.vue'
        );

export const subscriptionRoutes = [
    {
        path: '/subscription-plans',
        name: 'subscription-plans',
        component: SubscriptionPlanListView,
        meta: {
            titleKey:
                'subscriptions.plans.pageTitle',
            requiresAuth: true
        }
    },
    {
        path: '/my-subscription',
        name: 'my-subscription',
        component: MySubscriptionView,
        meta: {
            titleKey:
                'subscriptions.mySubscription.pageTitle',
            requiresAuth: true
        }
    }
];