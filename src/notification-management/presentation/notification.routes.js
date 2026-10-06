const NotificationListView = () =>
    import('./views/notification-list-view.vue');

export const notificationRoutes = [
    {
        path: '/notifications',
        name: 'notifications',
        component: NotificationListView,
        meta: {
            titleKey: 'notifications.pageTitle',
            requiresAuth: true
        }
    }
];