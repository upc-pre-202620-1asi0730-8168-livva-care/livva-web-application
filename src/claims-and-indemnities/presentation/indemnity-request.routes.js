const IndemnityRequestListView = () =>
    import('./views/indemnity-request-list-view.vue');

export const indemnityRequestRoutes = [
    {
        path: '/indemnity-requests',
        name: 'indemnity-requests',
        component: IndemnityRequestListView,
        meta: {
            titleKey: 'indemnities.pageTitle'
        }
    }
];
