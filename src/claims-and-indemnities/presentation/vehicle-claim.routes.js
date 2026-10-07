const VehicleClaimListView = () =>
    import('./views/vehicle-claim-list-view.vue');

export const vehicleClaimRoutes = [
    {
        path: '/vehicle-claims',
        name: 'vehicle-claims',
        component: VehicleClaimListView,
        meta: {
            titleKey: 'vehicleClaims.pageTitle'
        }
    }
];