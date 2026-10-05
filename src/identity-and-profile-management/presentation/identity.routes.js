export const identityRoutes = [
    {
        path: '/register',
        name: 'register',
        component: () =>
            import('./views/register-view.vue'),
        meta: {
            titleKey: 'auth.register.pageTitle'
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () =>
            import('./views/login-view.vue'),
        meta: {
            titleKey: 'auth.login.pageTitle'
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: () =>
            import('./views/profile-view.vue'),
        meta: {
            titleKey: 'profile.pageTitle',
            requiresAuth: true
        }
    }
];