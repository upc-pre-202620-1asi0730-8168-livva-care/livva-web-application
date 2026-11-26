const InsuranceCatalogView = () =>
    import('./views/insurance-catalog-view.vue');

export const catalogRoutes = [
    {
        path: '/insurance-products',
        name: 'insurance-products',
        component: InsuranceCatalogView,
        meta: {
            titleKey: 'catalog.pageTitle'
        }
    }
];
