const LifeApplicationListView = () =>
    import('./views/life-application-list-view.vue');

export const lifeRoutes = [
    {
        path: '/life-applications',
        name: 'life-applications',
        component: LifeApplicationListView,
        meta: {
            titleKey: 'lifeApplications.pageTitle'
        }
    }
];