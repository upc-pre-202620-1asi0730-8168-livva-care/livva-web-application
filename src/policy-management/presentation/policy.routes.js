const PolicyListView = () =>
    import('./views/policy-list-view.vue');

const PolicyDetailView = () =>
    import('./views/policy-detail-view.vue');

export const policyRoutes = [
    {
        path: '/policies',
        name: 'policies',
        component: PolicyListView,
        meta: {
            titleKey: 'policies.pageTitle'
        }
    },
    {
        path: '/policies/:id',
        name: 'policy-detail',
        component: PolicyDetailView,
        props: (route) => ({
            policyId: Number(route.params.id)
        }),
        meta: {
            titleKey: 'policies.detailPageTitle'
        }
    }
];