const VehicleListView = () =>
    import('./views/vehicle-list-view.vue');

const VehicleApplicationListView = () =>
    import('./views/vehicle-application-list-view.vue');

export const vehicleRoutes = [
    {
        path: '/vehicles',
        name: 'vehicles',
        component: VehicleListView,
        meta: {
            titleKey: 'vehicles.pageTitle'
        }
    },
    {
        path: '/vehicle-applications',
        name: 'vehicle-applications',
        component: VehicleApplicationListView,
        meta: {
            titleKey: 'vehicleApplications.pageTitle'
        }
    }
];