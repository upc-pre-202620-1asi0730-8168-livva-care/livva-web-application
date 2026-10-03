const VehicleListView = () =>
    import('./views/vehicle-list-view.vue');

export const vehicleRoutes = [
    {
        path: '/vehicles',
        name: 'vehicles',
        component: VehicleListView,
        meta: {
            titleKey: 'vehicles.pageTitle'
        }
    }
];