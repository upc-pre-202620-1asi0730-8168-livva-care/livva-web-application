const PolicyListView = () =>
    import('./views/policy-list-view.vue');

export const policyRoutes = [
    {
        path: '/policies',
        name: 'policies',
        component: PolicyListView,
        meta: {
            titleKey: 'policies.pageTitle'
        }
    }
];